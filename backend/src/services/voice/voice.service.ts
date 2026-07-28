import { STTService } from './stt.service';
import { TTSService } from './tts.service';
import { VoiceSessionService, VoiceSession, StartSessionInput } from './voice-session.service';
import { VoiceActivityService } from './voice-activity.service';
import { VoiceProviderRegistry } from './voice-provider-registry';
import { MockSTTProvider, MockTTSProvider } from './providers/mock.provider';
import { AudioPayload, STTResult, STTOptions, TTSResult, TTSOptions, VoiceProviderInfo } from './voice-provider.interface';
import { ConversationService } from '../conversation.service';
import { AIService } from '../ai/ai.service';
import { MessageRole } from '@prisma/client';
import { logger } from '../../config/logger';

export interface VoiceInteractionResult {
  session?: VoiceSession;
  stt: STTResult;
  userMessageId: string;
  assistantMessageId: string;
  aiResponseText: string;
  tts?: TTSResult;
  executedAt: string;
}

export class VoiceService {
  private sttService: STTService;
  private ttsService: TTSService;
  private sessionService: VoiceSessionService;
  private activityService: VoiceActivityService;
  private registry: VoiceProviderRegistry;
  private conversationService: ConversationService;
  private aiService: AIService;

  constructor(
    sttService: STTService = new STTService(),
    ttsService: TTSService = new TTSService(),
    sessionService: VoiceSessionService = new VoiceSessionService(),
    activityService: VoiceActivityService = new VoiceActivityService(),
    registry: VoiceProviderRegistry = VoiceProviderRegistry.getInstance(),
    conversationService: ConversationService = new ConversationService(),
    aiService: AIService = new AIService(),
  ) {
    this.sttService = sttService;
    this.ttsService = ttsService;
    this.sessionService = sessionService;
    this.activityService = activityService;
    this.registry = registry;
    this.conversationService = conversationService;
    this.aiService = aiService;

    // Register mock providers by default if no providers registered yet
    if (this.registry.listProviders().length === 0) {
      this.registry.registerSTTProvider(new MockSTTProvider(), true);
      this.registry.registerTTSProvider(new MockTTSProvider(), true);
    }
  }

  // ── Provider Operations ───────────────────────────────────────────────────

  getProviders(): VoiceProviderInfo[] {
    return this.registry.listProviders();
  }

  // ── Session Operations ────────────────────────────────────────────────────

  async startSession(userId: string, input: StartSessionInput): Promise<VoiceSession> {
    // Validate conversation access
    await this.conversationService.getConversationById(userId, input.conversationId);
    const session = await this.sessionService.startSession(userId, input);

    this.activityService.logActivity(
      userId,
      'SESSION_START',
      session.sttProvider,
      { conversationId: input.conversationId },
      session.id,
    );

    return session;
  }

  async pauseSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.sessionService.pauseSession(userId, sessionId);
    this.activityService.logActivity(userId, 'SESSION_PAUSE', session.sttProvider, {}, sessionId);
    return session;
  }

  async resumeSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.sessionService.resumeSession(userId, sessionId);
    this.activityService.logActivity(userId, 'SESSION_RESUME', session.sttProvider, {}, sessionId);
    return session;
  }

  async endSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.sessionService.endSession(userId, sessionId);
    this.activityService.logActivity(userId, 'SESSION_END', session.sttProvider, {}, sessionId);
    return session;
  }

  async getSession(userId: string, sessionId: string): Promise<VoiceSession> {
    return this.sessionService.getSession(userId, sessionId);
  }

  // ── STT & Full Conversation Pipeline ──────────────────────────────────────

  async processVoiceInput(input: {
    userId: string;
    conversationId: string;
    audio: AudioPayload;
    sessionId?: string;
    sttOptions?: STTOptions;
    ttsOptions?: TTSOptions;
    sttProvider?: string;
    ttsProvider?: string;
    generateAudioResponse?: boolean;
  }): Promise<VoiceInteractionResult> {
    logger.info(`[VoiceService] Processing voice input for user '${input.userId}', conversation '${input.conversationId}'`);

    let session: VoiceSession | undefined;
    if (input.sessionId) {
      session = await this.sessionService.touchSession(input.userId, input.sessionId);
    }

    // 1. Speech-to-Text Transcribe
    const sttProviderName = input.sttProvider ?? session?.sttProvider;
    const sttResult = await this.sttService.transcribe(input.audio, input.sttOptions, sttProviderName);

    this.activityService.logActivity(
      input.userId,
      'TRANSCRIBE',
      sttResult.provider,
      { transcriptLength: sttResult.transcript.length, confidence: sttResult.confidence },
      input.sessionId,
    );

    // 2. Conversation Engine — Persist User Message
    const userMsg = await this.conversationService.createMessage(input.userId, input.conversationId, {
      role: MessageRole.USER,
      content: sttResult.transcript,
      metadata: {
        voiceInput: true,
        sttProvider: sttResult.provider,
        confidence: sttResult.confidence,
      },
    });

    // 3. AI Engine — Build Prompt & Generate AI Response
    const normalizedPrompt = await this.aiService.buildNormalizedPrompt({
      userId: input.userId,
      conversationId: input.conversationId,
      currentUserMessage: sttResult.transcript,
    });

    const aiResponse = await this.aiService.generateChatResponse({
      prompt: sttResult.transcript,
      normalizedPrompt,
    });

    // 4. Conversation Engine — Persist Assistant Reply
    const assistantMsg = await this.conversationService.createMessage(input.userId, input.conversationId, {
      role: MessageRole.ASSISTANT,
      content: aiResponse.message,
      metadata: {
        provider: aiResponse.provider,
        model: aiResponse.model,
        voiceTriggered: true,
      },
    });

    // 5. Optional Text-to-Speech Synthesis
    let ttsResult: TTSResult | undefined;
    if (input.generateAudioResponse !== false) {
      const ttsProviderName = input.ttsProvider ?? session?.ttsProvider;
      ttsResult = await this.ttsService.synthesize(aiResponse.message, input.ttsOptions, ttsProviderName);

      this.activityService.logActivity(
        input.userId,
        'SYNTHESIZE',
        ttsResult.provider,
        { characterCount: ttsResult.characterCount, format: ttsResult.format },
        input.sessionId,
      );
    }

    return {
      session,
      stt: sttResult,
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      aiResponseText: aiResponse.message,
      tts: ttsResult,
      executedAt: new Date().toISOString(),
    };
  }

  // ── Standalone TTS Synthesize ─────────────────────────────────────────────

  async synthesizeSpeech(
    userId: string,
    text: string,
    options?: TTSOptions,
    providerName?: string,
    sessionId?: string,
  ): Promise<TTSResult> {
    if (sessionId) {
      await this.sessionService.touchSession(userId, sessionId);
    }

    const ttsResult = await this.ttsService.synthesize(text, options, providerName);

    this.activityService.logActivity(
      userId,
      'SYNTHESIZE',
      ttsResult.provider,
      { characterCount: text.length, voice: ttsResult.voice },
      sessionId,
    );

    return ttsResult;
  }
}

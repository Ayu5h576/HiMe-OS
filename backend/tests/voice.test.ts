import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { VoiceService } from '../src/services/voice/voice.service';
import { STTService } from '../src/services/voice/stt.service';
import { TTSService } from '../src/services/voice/tts.service';
import { VoiceSessionService } from '../src/services/voice/voice-session.service';
import { VoiceProviderRegistry } from '../src/services/voice/voice-provider-registry';
import { MockSTTProvider, MockTTSProvider } from '../src/services/voice/providers/mock.provider';
import { ToolRegistry, ToolExecutor, initializeSystemTools } from '../src/services/ai/tools';
import { ISTTProvider, ITTSProvider, AudioPayload } from '../src/services/voice/voice-provider.interface';

describe('Voice Interface Abstraction (Phase 20)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';
  let projectId = '';
  let conversationId = '';

  let voiceService: VoiceService;
  let registry: VoiceProviderRegistry;
  let toolExecutor: ToolExecutor;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    toolExecutor = new ToolExecutor();
    registry = VoiceProviderRegistry.getInstance();
    voiceService = new VoiceService();

    // Register test user & token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Voice Test User',
        email: `voice-agent-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;

    // Create test project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userToken}` },
      payload: { name: 'Voice Test Project' },
    });
    projectId = JSON.parse(projRes.payload).data.id;

    // Create test conversation
    const convRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/conversations`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: { title: 'Voice Session Conversation' },
    });
    conversationId = JSON.parse(convRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Voice Provider Registration
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. Voice Provider Registration & Management', () => {
    it('should list mock STT and TTS providers in registry', () => {
      const providers = registry.listProviders();
      expect(providers.length).toBeGreaterThan(0);

      const mockInfo = providers.find((p) => p.name === 'mock');
      expect(mockInfo).toBeDefined();
      expect(mockInfo?.type).toBe('both');
      expect(mockInfo?.isAvailable).toBe(true);
    });

    it('should throw NotFoundError for unregistered provider', () => {
      expect(() => registry.getSTTProvider('non-existent')).toThrow(/not registered/i);
      expect(() => registry.getTTSProvider('non-existent')).toThrow(/not registered/i);
    });

    it('should register custom STT provider dynamically without modifying code', () => {
      const customSTT: ISTTProvider = {
        name: 'custom-whisper',
        displayName: 'Custom Whisper Model',
        isAvailable: true,
        transcribe: async () => ({
          transcript: 'Custom transcript',
          confidence: 0.99,
          language: 'en',
          durationSeconds: 2.0,
          provider: 'custom-whisper',
          processedAt: new Date().toISOString(),
        }),
      };

      registry.registerSTTProvider(customSTT);
      expect(registry.hasSTTProvider('custom-whisper')).toBe(true);

      const fetched = registry.getSTTProvider('custom-whisper');
      expect(fetched.displayName).toBe('Custom Whisper Model');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. STT Abstraction
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. Speech-to-Text (STT) Abstraction', () => {
    it('should transcribe valid audio payload using default mock provider', async () => {
      const sttService = new STTService();
      const audio: AudioPayload = {
        data: Buffer.from('mock audio test data stream').toString('base64'),
        format: 'wav',
        encoding: 'base64',
      };

      const result = await sttService.transcribe(audio);
      expect(result).toHaveProperty('transcript');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.provider).toBe('mock');
    });

    it('should reject invalid audio payload format', async () => {
      const sttService = new STTService();
      const audio: any = {
        data: 'validbase64==',
        format: 'invalid_format_xyz',
        encoding: 'base64',
      };

      await expect(sttService.transcribe(audio)).rejects.toThrow(/Unsupported audio format/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TTS Abstraction
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. Text-to-Speech (TTS) Abstraction', () => {
    it('should synthesize text into audio payload using default mock provider', async () => {
      const ttsService = new TTSService();
      const text = 'Hello, HiMe OS voice system is fully operational.';

      const result = await ttsService.synthesize(text);
      expect(result).toHaveProperty('audioData');
      expect(result.characterCount).toBe(text.length);
      expect(result.durationSeconds).toBeGreaterThan(0);
      expect(result.provider).toBe('mock');
    });

    it('should reject empty text input', async () => {
      const ttsService = new TTSService();
      await expect(ttsService.synthesize('')).rejects.toThrow(/cannot be empty/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Voice Session Lifecycle & Timeout
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. Voice Session Lifecycle & Timeout', () => {
    let activeSessionId = '';

    it('should start a new voice session', async () => {
      const sessionService = new VoiceSessionService();
      const session = await sessionService.startSession(userId, {
        conversationId,
        sttProvider: 'mock',
        ttsProvider: 'mock',
      });

      expect(session.status).toBe('ACTIVE');
      expect(session.userId).toBe(userId);
      expect(session.conversationId).toBe(conversationId);
      activeSessionId = session.id;
    });

    it('should pause and resume a voice session', async () => {
      const sessionService = new VoiceSessionService();
      const session = await sessionService.startSession(userId, { conversationId });

      const paused = await sessionService.pauseSession(userId, session.id);
      expect(paused.status).toBe('PAUSED');

      const resumed = await sessionService.resumeSession(userId, session.id);
      expect(resumed.status).toBe('ACTIVE');
    });

    it('should end a voice session', async () => {
      const sessionService = new VoiceSessionService();
      const session = await sessionService.startSession(userId, { conversationId });

      const ended = await sessionService.endSession(userId, session.id);
      expect(ended.status).toBe('ENDED');
    });

    it('should detect session timeout when inactive', async () => {
      // 100ms timeout for testing
      const shortTimeoutService = new VoiceSessionService(100);
      const session = await shortTimeoutService.startSession(userId, { conversationId });

      // Wait 150ms to exceed TTL
      await new Promise((resolve) => setTimeout(resolve, 150));

      const fetched = await shortTimeoutService.getSession(userId, session.id);
      expect(fetched.status).toBe('TIMED_OUT');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Full Voice Conversation Integration Pipeline
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. Conversation Engine & AI Provider Voice Integration', () => {
    it('should process full voice round-trip: STT -> Conversation -> AI -> TTS', async () => {
      const audio: AudioPayload = {
        data: Buffer.from('sample audio question input').toString('base64'),
        format: 'wav',
        encoding: 'base64',
      };

      const result = await voiceService.processVoiceInput({
        userId,
        conversationId,
        audio,
        generateAudioResponse: true,
      });

      expect(result.stt).toHaveProperty('transcript');
      expect(result.userMessageId).toBeDefined();
      expect(result.assistantMessageId).toBeDefined();
      expect(result.aiResponseText).toBeDefined();
      expect(result.tts).toHaveProperty('audioData');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Tool Calling Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. Tool Calling Integration', () => {
    it('should register voice tools in ToolRegistry', () => {
      const toolReg = ToolRegistry.getInstance();
      expect(toolReg.hasTool('startVoiceSession')).toBe(true);
      expect(toolReg.hasTool('transcribeAudio')).toBe(true);
      expect(toolReg.hasTool('synthesizeSpeech')).toBe(true);
    });

    it('should execute startVoiceSession tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('startVoiceSession', userId, {
        conversationId,
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result.status).toBe('ACTIVE');
    });

    it('should execute synthesizeSpeech tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('synthesizeSpeech', userId, {
        text: 'Hello from AI voice tool execution',
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('audioData');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. HTTP API Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  describe('7. HTTP API Endpoints', () => {
    let httpSessionId = '';

    it('POST /voice/session/start should create a voice session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/voice/session/start',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { conversationId },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ACTIVE');
      httpSessionId = body.data.id;
    });

    it('POST /voice/transcribe should execute full voice interaction', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/voice/transcribe',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          conversationId,
          audio: {
            data: Buffer.from('http test audio').toString('base64'),
            format: 'wav',
            encoding: 'base64',
          },
          sessionId: httpSessionId,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('stt');
      expect(body.data).toHaveProperty('tts');
    });

    it('POST /voice/synthesize should return TTS audio', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/voice/synthesize',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          text: 'Synthesizing voice response over HTTP API',
          sessionId: httpSessionId,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('audioData');
    });

    it('POST /voice/session/end should terminate session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/voice/session/end',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: httpSessionId },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('ENDED');
    });

    it('GET /voice/providers should return registered voice providers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/voice/providers',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should reject unauthenticated voice requests with HTTP 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/voice/providers',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

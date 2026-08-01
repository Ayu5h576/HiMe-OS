import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { VoiceService } from '../../voice/voice.service';

const defaultVoiceService = new VoiceService();

// ─────────────────────────────────────────────────────────────────────────────
// StartVoiceSessionTool
// ─────────────────────────────────────────────────────────────────────────────

export class StartVoiceSessionTool implements ITool {
  readonly name = 'startVoiceSession';
  readonly description = 'Start a voice session associated with a conversation.';
  readonly parameterSchema = z.object({
    conversationId: z.string().min(1, 'conversationId is required'),
    sttProvider: z.string().optional(),
    ttsProvider: z.string().optional(),
  });

  private voiceService: VoiceService;

  constructor(voiceService: VoiceService = defaultVoiceService) {
    this.voiceService = voiceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          conversationId: { type: 'string', description: 'ID of the conversation to attach voice session to' },
          sttProvider: { type: 'string', description: 'Optional STT provider name override' },
          ttsProvider: { type: 'string', description: 'Optional TTS provider name override' },
        },
        required: ['conversationId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const session = await this.voiceService.startSession(userId, {
        conversationId: validated.conversationId,
        sttProvider: validated.sttProvider,
        ttsProvider: validated.ttsProvider,
      });
      return ToolResponseFormatter.success(this.name, session);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TranscribeAudioTool
// ─────────────────────────────────────────────────────────────────────────────

export class TranscribeAudioTool implements ITool {
  readonly name = 'transcribeAudio';
  readonly description = 'Transcribe an audio payload into text and process it through the Conversation Engine.';
  readonly parameterSchema = z.object({
    conversationId: z.string().min(1, 'conversationId is required'),
    audioData: z.string().min(1, 'audioData base64 is required'),
    format: z.enum(['wav', 'mp3', 'ogg', 'webm', 'raw']).default('wav'),
    sessionId: z.string().optional(),
  });

  private voiceService: VoiceService;

  constructor(voiceService: VoiceService = defaultVoiceService) {
    this.voiceService = voiceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          conversationId: { type: 'string', description: 'Target conversation ID' },
          audioData: { type: 'string', description: 'Base64 encoded audio string' },
          format: { type: 'string', enum: ['wav', 'mp3', 'ogg', 'webm', 'raw'], description: 'Audio format' },
          sessionId: { type: 'string', description: 'Optional voice session ID' },
        },
        required: ['conversationId', 'audioData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.voiceService.processVoiceInput({
        userId,
        conversationId: validated.conversationId,
        audio: {
          data: validated.audioData,
          format: validated.format || 'wav',
          encoding: 'base64',
        },
        sessionId: validated.sessionId,
      });
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SynthesizeSpeechTool
// ─────────────────────────────────────────────────────────────────────────────

export class SynthesizeSpeechTool implements ITool {
  readonly name = 'synthesizeSpeech';
  readonly description = 'Synthesize text into speech audio using the registered TTS provider.';
  readonly parameterSchema = z.object({
    text: z.string().min(1, 'text is required'),
    voice: z.string().optional(),
    speed: z.number().optional(),
    sessionId: z.string().optional(),
  });

  private voiceService: VoiceService;

  constructor(voiceService: VoiceService = defaultVoiceService) {
    this.voiceService = voiceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to synthesize into audio' },
          voice: { type: 'string', description: 'Optional voice ID' },
          speed: { type: 'number', description: 'Playback speed factor' },
          sessionId: { type: 'string', description: 'Optional voice session ID' },
        },
        required: ['text'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.voiceService.synthesizeSpeech(
        userId,
        validated.text,
        { voice: validated.voice, speed: validated.speed },
        undefined,
        validated.sessionId,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

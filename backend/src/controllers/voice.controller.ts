import { FastifyRequest, FastifyReply } from 'fastify';
import { VoiceService } from '../services/voice/voice.service';
import {
  startVoiceSessionSchema,
  endVoiceSessionSchema,
  transcribeAudioSchema,
  synthesizeSpeechSchema,
} from '../schemas/voice.schema';

export class VoiceController {
  private voiceService: VoiceService;

  constructor(voiceService: VoiceService = new VoiceService()) {
    this.voiceService = voiceService;
  }

  // ── Session Handlers ──────────────────────────────────────────────────────

  startSession = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = startVoiceSessionSchema.parse(req.body);
    const session = await this.voiceService.startSession(userId, body);
    return reply.status(201).send({ success: true, data: session });
  };

  endSession = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const { sessionId } = endVoiceSessionSchema.parse(req.body);
    const session = await this.voiceService.endSession(userId, sessionId);
    return reply.status(200).send({ success: true, data: session });
  };

  // ── Speech Processing Handlers ───────────────────────────────────────────

  transcribe = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = transcribeAudioSchema.parse(req.body);

    const result = await this.voiceService.processVoiceInput({
      userId,
      conversationId: body.conversationId,
      audio: body.audio,
      sessionId: body.sessionId,
      sttOptions: body.sttOptions,
      ttsOptions: body.ttsOptions,
      sttProvider: body.sttProvider,
      ttsProvider: body.ttsProvider,
      generateAudioResponse: body.generateAudioResponse,
    });

    return reply.status(200).send({ success: true, data: result });
  };

  synthesize = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const { text, sessionId, options, provider } = synthesizeSpeechSchema.parse(req.body);

    const result = await this.voiceService.synthesizeSpeech(userId, text, options, provider, sessionId);
    return reply.status(200).send({ success: true, data: result });
  };

  // ── Provider Metadata Handlers ───────────────────────────────────────────

  getProviders = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const providers = this.voiceService.getProviders();
    return reply.status(200).send({ success: true, data: providers });
  };
}

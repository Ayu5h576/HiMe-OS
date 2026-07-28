import { FastifyPluginAsync } from 'fastify';
import { VoiceController } from '../controllers/voice.controller';
import { authenticate } from '../middleware/auth';
import {
  startSessionSwaggerSchema,
  endSessionSwaggerSchema,
  transcribeSwaggerSchema,
  synthesizeSwaggerSchema,
  getProvidersSwaggerSchema,
} from '../schemas/voice.schema';

export const voiceRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new VoiceController();

  fastify.post(
    '/voice/session/start',
    { schema: startSessionSwaggerSchema, preHandler: [authenticate] },
    controller.startSession,
  );

  fastify.post(
    '/voice/session/end',
    { schema: endSessionSwaggerSchema, preHandler: [authenticate] },
    controller.endSession,
  );

  fastify.post(
    '/voice/transcribe',
    { schema: transcribeSwaggerSchema, preHandler: [authenticate] },
    controller.transcribe,
  );

  fastify.post(
    '/voice/synthesize',
    { schema: synthesizeSwaggerSchema, preHandler: [authenticate] },
    controller.synthesize,
  );

  fastify.get(
    '/voice/providers',
    { schema: getProvidersSwaggerSchema, preHandler: [authenticate] },
    controller.getProviders,
  );
};

import { FastifyPluginAsync } from 'fastify';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { aiChatSwaggerSchema } from '../schemas/ai.schema';
import {
  listProvidersSwaggerSchema,
  getOllamaModelsSwaggerSchema,
  getOllamaStatusSwaggerSchema,
  setOllamaModelSwaggerSchema,
} from '../schemas/ollama.schema';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AIController();

  fastify.post(
    '/ai/chat',
    { schema: aiChatSwaggerSchema, preHandler: [authenticate] },
    controller.chat,
  );

  fastify.get(
    '/ai/providers',
    { schema: listProvidersSwaggerSchema, preHandler: [authenticate] },
    controller.listProviders,
  );

  fastify.get(
    '/ai/providers/ollama/models',
    { schema: getOllamaModelsSwaggerSchema, preHandler: [authenticate] },
    controller.getOllamaModels,
  );

  fastify.get(
    '/ai/providers/ollama/status',
    { schema: getOllamaStatusSwaggerSchema, preHandler: [authenticate] },
    controller.getOllamaStatus,
  );

  fastify.post(
    '/ai/providers/ollama/model',
    { schema: setOllamaModelSwaggerSchema, preHandler: [authenticate] },
    controller.setOllamaModel,
  );
};

import { FastifyPluginAsync } from 'fastify';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { aiChatSwaggerSchema } from '../schemas/ai.schema';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AIController();

  fastify.post(
    '/ai/chat',
    { schema: aiChatSwaggerSchema, preHandler: [authenticate] },
    controller.chat,
  );
};

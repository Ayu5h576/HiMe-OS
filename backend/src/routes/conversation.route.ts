import { FastifyPluginAsync } from 'fastify';
import { ConversationController } from '../controllers/conversation.controller';
import { authenticate } from '../middleware/auth';
import {
  createConversationSwaggerSchema,
  getProjectConversationsSwaggerSchema,
  getConversationByIdSwaggerSchema,
  updateConversationSwaggerSchema,
  deleteConversationSwaggerSchema,
  createMessageSwaggerSchema,
  getMessagesSwaggerSchema,
} from '../schemas/conversation.schema';

export const conversationRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new ConversationController();

  // Project-scoped conversation endpoints
  fastify.post(
    '/projects/:projectId/conversations',
    { schema: createConversationSwaggerSchema, preHandler: [authenticate] },
    controller.createConversation,
  );

  fastify.get(
    '/projects/:projectId/conversations',
    { schema: getProjectConversationsSwaggerSchema, preHandler: [authenticate] },
    controller.getProjectConversations,
  );

  // Conversation endpoints
  fastify.get(
    '/conversations/:id',
    { schema: getConversationByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getConversationById,
  );

  fastify.patch(
    '/conversations/:id',
    { schema: updateConversationSwaggerSchema, preHandler: [authenticate] },
    controller.updateConversation,
  );

  fastify.delete(
    '/conversations/:id',
    { schema: deleteConversationSwaggerSchema, preHandler: [authenticate] },
    controller.deleteConversation,
  );

  // Message endpoints
  fastify.post(
    '/conversations/:id/messages',
    { schema: createMessageSwaggerSchema, preHandler: [authenticate] },
    controller.createMessage,
  );

  fastify.get(
    '/conversations/:id/messages',
    { schema: getMessagesSwaggerSchema, preHandler: [authenticate] },
    controller.getMessages,
  );
};

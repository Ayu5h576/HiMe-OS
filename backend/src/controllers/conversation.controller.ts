import { FastifyRequest, FastifyReply } from 'fastify';
import { ConversationService } from '../services/conversation.service';
import {
  createConversationSchema,
  updateConversationSchema,
  conversationIdSchema,
  projectIdParamSchema,
  createMessageSchema,
  getMessagesQuerySchema,
} from '../schemas/conversation.schema';

export class ConversationController {
  private service: ConversationService;

  constructor(service: ConversationService = new ConversationService()) {
    this.service = service;
  }

  createConversation = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const body = createConversationSchema.parse(req.body);
    const userId = req.user.id;
    const conversation = await this.service.createConversation(userId, projectId, body);
    return reply.status(201).send({ success: true, data: conversation });
  };

  getProjectConversations = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const userId = req.user.id;
    const conversations = await this.service.getProjectConversations(userId, projectId);
    return reply.status(200).send({ success: true, data: conversations });
  };

  getConversationById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = conversationIdSchema.parse(req.params);
    const userId = req.user.id;
    const conversation = await this.service.getConversationById(userId, id);
    return reply.status(200).send({ success: true, data: conversation });
  };

  updateConversation = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = conversationIdSchema.parse(req.params);
    const body = updateConversationSchema.parse(req.body);
    const userId = req.user.id;
    const conversation = await this.service.updateConversation(userId, id, body);
    return reply.status(200).send({ success: true, data: conversation });
  };

  deleteConversation = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = conversationIdSchema.parse(req.params);
    const userId = req.user.id;
    await this.service.deleteConversation(userId, id);
    return reply.status(204).send();
  };

  createMessage = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = conversationIdSchema.parse(req.params);
    const body = createMessageSchema.parse(req.body);
    const userId = req.user.id;
    const message = await this.service.createMessage(userId, id, body);
    return reply.status(201).send({ success: true, data: message });
  };

  getMessages = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = conversationIdSchema.parse(req.params);
    const query = getMessagesQuerySchema.parse(req.query);
    const userId = req.user.id;
    const result = await this.service.getMessages(userId, id, query);
    return reply.status(200).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };
}

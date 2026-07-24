import { Conversation, Message } from '@prisma/client';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository, PaginatedMessages } from '../repositories/message.repository';
import { ProjectService } from './project.service';
import { NotFoundError } from '../utils/errors';
import {
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
  GetMessagesQueryInput,
} from '../schemas/conversation.schema';

export class ConversationService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private projectService: ProjectService;

  constructor(
    conversationRepo: ConversationRepository = new ConversationRepository(),
    messageRepo: MessageRepository = new MessageRepository(),
    projectService: ProjectService = new ProjectService(),
  ) {
    this.conversationRepo = conversationRepo;
    this.messageRepo = messageRepo;
    this.projectService = projectService;
  }

  async createConversation(
    userId: string,
    projectId: string,
    input: CreateConversationInput,
  ): Promise<Conversation> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.conversationRepo.create(input, projectId);
  }

  async getProjectConversations(userId: string, projectId: string): Promise<Conversation[]> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.conversationRepo.findProjectConversations(projectId);
  }

  async getConversationById(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
    // Verify user owns the project to which this conversation belongs
    await this.projectService.getProjectById(userId, conversation.projectId);
    return conversation;
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    input: UpdateConversationInput,
  ): Promise<Conversation> {
    await this.getConversationById(userId, conversationId);
    return this.conversationRepo.update(conversationId, input);
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    await this.getConversationById(userId, conversationId);
    await this.conversationRepo.delete(conversationId);
  }

  // ── Message Operations ──

  async createMessage(
    userId: string,
    conversationId: string,
    input: CreateMessageInput,
  ): Promise<Message> {
    // Verify conversation exists and user owns the parent project
    await this.getConversationById(userId, conversationId);
    return this.messageRepo.create(input, conversationId);
  }

  async getMessages(
    userId: string,
    conversationId: string,
    query: GetMessagesQueryInput,
  ): Promise<PaginatedMessages> {
    // Verify conversation exists and user owns the parent project
    await this.getConversationById(userId, conversationId);
    return this.messageRepo.findByConversationId(conversationId, query);
  }
}

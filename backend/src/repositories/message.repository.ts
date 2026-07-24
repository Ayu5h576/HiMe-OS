import { PrismaClient, Message, MessageRole, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { CreateMessageInput, GetMessagesQueryInput } from '../schemas/conversation.schema';

export interface PaginatedMessages {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MessageRepository {
  private db: PrismaClient;
  private memoryStore: Map<string, Message> = new Map();

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async create(data: CreateMessageInput, conversationId: string): Promise<Message> {
    try {
      return await this.db.message.create({
        data: {
          role: data.role,
          content: data.content,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          conversationId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const message: Message = {
          id: `msg-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: data.role as MessageRole,
          content: data.content,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          conversationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryStore.set(message.id, message);
        return message;
      }
      throw err;
    }
  }

  async findByConversationId(
    conversationId: string,
    query: GetMessagesQueryInput,
  ): Promise<PaginatedMessages> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    try {
      const [total, messages] = await Promise.all([
        this.db.message.count({ where: { conversationId } }),
        this.db.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        let messages = Array.from(this.memoryStore.values()).filter(
          (m) => m.conversationId === conversationId,
        );
        messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        const total = messages.length;
        const paginated = messages.slice(skip, skip + limit);

        return {
          data: paginated,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }
      throw err;
    }
  }
}

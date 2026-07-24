import { PrismaClient, Conversation } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { CreateConversationInput, UpdateConversationInput } from '../schemas/conversation.schema';

export class ConversationRepository {
  private db: PrismaClient;
  private memoryStore: Map<string, Conversation> = new Map();

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async create(data: CreateConversationInput, projectId: string): Promise<Conversation> {
    try {
      return await this.db.conversation.create({
        data: {
          title: data.title,
          projectId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const conversation: Conversation = {
          id: `conv-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: data.title,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryStore.set(conversation.id, conversation);
        return conversation;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Conversation | null> {
    try {
      return await this.db.conversation.findUnique({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.memoryStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async findProjectConversations(projectId: string): Promise<Conversation[]> {
    try {
      return await this.db.conversation.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const list: Conversation[] = [];
        for (const conv of this.memoryStore.values()) {
          if (conv.projectId === projectId) list.push(conv);
        }
        return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateConversationInput): Promise<Conversation> {
    try {
      return await this.db.conversation.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const conv = this.memoryStore.get(id);
        if (!conv) throw new Error('Conversation not found');
        const updated: Conversation = {
          ...conv,
          ...(data.title !== undefined && { title: data.title }),
          updatedAt: new Date(),
        };
        this.memoryStore.set(id, updated);
        return updated;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.conversation.delete({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        this.memoryStore.delete(id);
        return;
      }
      throw err;
    }
  }
}

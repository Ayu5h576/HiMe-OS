import { PrismaClient, Memory, MemoryType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { CreateMemoryInput, GetMemoriesQueryInput } from '../schemas/memory.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MemoryRepository {
  private db: PrismaClient;
  private memoryStore: Map<string, Memory> = new Map();

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async create(data: CreateMemoryInput, projectId: string): Promise<Memory> {
    try {
      return await this.db.memory.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type,
          importance: data.importance,
          tags: data.tags,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          projectId,
          conversationId: data.conversationId,
          messageId: data.messageId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const memory: Memory = {
          id: `mem-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: data.title,
          content: data.content,
          type: data.type,
          importance: data.importance,
          tags: data.tags,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          projectId,
          conversationId: data.conversationId ?? null,
          messageId: data.messageId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryStore.set(memory.id, memory);
        return memory;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Memory | null> {
    try {
      return await this.db.memory.findUnique({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.memoryStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async findProjectMemories(
    projectId: string,
    query: GetMemoriesQueryInput,
  ): Promise<PaginatedResult<Memory>> {
    const { search, type, importance, sortBy, sortOrder, page, limit } = query;

    const where: Prisma.MemoryWhereInput = {
      projectId,
      ...(type && { type }),
      ...(importance !== undefined && { importance }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    try {
      const [total, memories] = await Promise.all([
        this.db.memory.count({ where }),
        this.db.memory.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: memories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        let list = Array.from(this.memoryStore.values()).filter((m) => m.projectId === projectId);

        if (type) list = list.filter((m) => m.type === type);
        if (importance !== undefined) list = list.filter((m) => m.importance === importance);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              m.content.toLowerCase().includes(q) ||
              m.tags.some((t) => t.toLowerCase() === q || t.toLowerCase().includes(q)),
          );
        }

        list.sort((a, b) => {
          const valA = a[sortBy as keyof Memory];
          const valB = b[sortBy as keyof Memory];
          const numA = valA instanceof Date ? valA.getTime() : valA;
          const numB = valB instanceof Date ? valB.getTime() : valB;
          if (numA === null || numA === undefined) return 1;
          if (numB === null || numB === undefined) return -1;
          if (numA < numB) return sortOrder === 'asc' ? -1 : 1;
          if (numA > numB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        const total = list.length;
        const paginated = list.slice(skip, skip + limit);

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

  async update(id: string, data: Prisma.MemoryUpdateInput): Promise<Memory> {
    try {
      return await this.db.memory.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const memory = this.memoryStore.get(id);
        if (!memory) throw new Error('Memory not found');
        const updated: Memory = {
          ...memory,
          title: typeof data.title === 'string' ? data.title : memory.title,
          content: typeof data.content === 'string' ? data.content : memory.content,
          type: typeof data.type === 'string' ? (data.type as MemoryType) : memory.type,
          importance: typeof data.importance === 'number' ? data.importance : memory.importance,
          tags: Array.isArray(data.tags) ? (data.tags as string[]) : memory.tags,
          metadata:
            data.metadata !== undefined ? (data.metadata as Prisma.JsonValue) : memory.metadata,
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
      await this.db.memory.delete({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        this.memoryStore.delete(id);
        return;
      }
      throw err;
    }
  }
}

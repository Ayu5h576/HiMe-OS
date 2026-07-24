import { PrismaClient, Memory, MemoryType } from '@prisma/client';
import { prisma as defaultPrisma } from '../../../config/database';

export interface MemoryVectorFilter {
  conversationId?: string;
  type?: MemoryType;
  minImportance?: number;
}

export class VectorRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient = defaultPrisma) {
    this.prisma = prisma;
  }

  async saveEmbedding(memoryId: string, embedding: number[]): Promise<Memory> {
    return this.prisma.memory.update({
      where: { id: memoryId },
      data: { embedding },
    });
  }

  async findMemoriesForVectorSearch(
    projectId: string,
    filter?: MemoryVectorFilter,
  ): Promise<Memory[]> {
    return this.prisma.memory.findMany({
      where: {
        projectId,
        ...(filter?.conversationId ? { conversationId: filter.conversationId } : {}),
        ...(filter?.type ? { type: filter.type } : {}),
        ...(filter?.minImportance !== undefined
          ? { importance: { gte: filter.minImportance } }
          : {}),
      },
    });
  }

  async findMemoriesWithoutEmbedding(projectId: string): Promise<Memory[]> {
    return this.prisma.memory.findMany({
      where: {
        projectId,
        embedding: {
          isEmpty: true,
        },
      },
    });
  }
}

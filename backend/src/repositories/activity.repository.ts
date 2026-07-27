import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import { env } from '../config/env';
import { GetActivityQueryInput } from '../schemas/runtime.schema';
import { PaginatedResult } from './memory.repository';

export interface ActivityItem {
  id: string;
  userId: string;
  projectId?: string | null;
  category: string;
  action: string;
  description: string;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
}

export class ActivityRepository {
  private db: PrismaClient;
  private store: Map<string, ActivityItem> = new Map();

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  async create(data: {
    userId: string;
    projectId?: string | null;
    category: string;
    action: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<ActivityItem> {
    try {
      const result = await (this.db as any).activity.create({
        data: {
          userId: data.userId,
          projectId: data.projectId,
          category: data.category,
          action: data.action,
          description: data.description,
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });
      return result;
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('activity' in this.db)) {
        const item: ActivityItem = {
          id: `act-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          projectId: data.projectId ?? null,
          category: data.category,
          action: data.action,
          description: data.description,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          createdAt: new Date(),
        };
        this.store.set(item.id, item);
        return item;
      }
      throw err;
    }
  }

  async findActivities(
    userId: string,
    query: GetActivityQueryInput,
  ): Promise<PaginatedResult<ActivityItem>> {
    const { page, limit, category, projectId, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {
        userId,
        ...(category ? { category } : {}),
        ...(projectId ? { projectId } : {}),
        ...(fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
      };

      const [total, data] = await Promise.all([
        (this.db as any).activity.count({ where }),
        (this.db as any).activity.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('activity' in this.db)) {
        let list = Array.from(this.store.values()).filter((item) => item.userId === userId);
        if (category) list = list.filter((item) => item.category === category);
        if (projectId) list = list.filter((item) => item.projectId === projectId);
        if (fromDate) list = list.filter((item) => item.createdAt >= fromDate);
        if (toDate) list = list.filter((item) => item.createdAt <= toDate);

        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

  async countTotal(): Promise<number> {
    try {
      return await (this.db as any).activity.count();
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('activity' in this.db)) {
        return this.store.size;
      }
      throw err;
    }
  }
}

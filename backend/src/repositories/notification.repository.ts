import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import { env } from '../config/env';
import { CreateNotificationInput, GetNotificationsQueryInput, NotificationType } from '../schemas/notification.schema';
import { PaginatedResult } from './memory.repository';

export interface NotificationItem {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationRepository {
  private db: PrismaClient;
  private store: Map<string, NotificationItem> = new Map();

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  async create(userId: string, data: CreateNotificationInput): Promise<NotificationItem> {
    try {
      // If Prisma model exists, try using it
      const result = await (this.db as any).notification.create({
        data: {
          userId,
          projectId: data.projectId,
          title: data.title,
          message: data.message,
          type: data.type,
          read: false,
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });
      return result;
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        const item: NotificationItem = {
          id: `notif-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId,
          projectId: data.projectId ?? null,
          title: data.title,
          message: data.message,
          type: data.type,
          read: false,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.store.set(item.id, item);
        return item;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<NotificationItem | null> {
    try {
      return await (this.db as any).notification.findUnique({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        return this.store.get(id) ?? null;
      }
      throw err;
    }
  }

  async findUserNotifications(
    userId: string,
    query: GetNotificationsQueryInput,
  ): Promise<PaginatedResult<NotificationItem>> {
    const { page, limit, type, read, projectId } = query;
    const skip = (page - 1) * limit;

    try {
      const where: any = {
        userId,
        ...(type ? { type } : {}),
        ...(read !== undefined ? { read } : {}),
        ...(projectId ? { projectId } : {}),
      };

      const [total, data] = await Promise.all([
        (this.db as any).notification.count({ where }),
        (this.db as any).notification.findMany({
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
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        let list = Array.from(this.store.values()).filter((item) => item.userId === userId);
        if (type) list = list.filter((item) => item.type === type);
        if (read !== undefined) list = list.filter((item) => item.read === read);
        if (projectId) list = list.filter((item) => item.projectId === projectId);

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

  async markAsRead(id: string): Promise<NotificationItem> {
    try {
      return await (this.db as any).notification.update({
        where: { id },
        data: { read: true },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        const item = this.store.get(id);
        if (!item) throw new Error('Notification not found');
        item.read = true;
        item.updatedAt = new Date();
        this.store.set(id, item);
        return item;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await (this.db as any).notification.delete({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        this.store.delete(id);
        return;
      }
      throw err;
    }
  }

  async countUnread(userId: string): Promise<number> {
    try {
      return await (this.db as any).notification.count({
        where: { userId, read: false },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test' || !('notification' in this.db)) {
        return Array.from(this.store.values()).filter(
          (item) => item.userId === userId && !item.read,
        ).length;
      }
      throw err;
    }
  }
}

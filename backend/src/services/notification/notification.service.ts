import { NotificationRepository, NotificationItem } from '../../repositories/notification.repository';
import { CreateNotificationInput, GetNotificationsQueryInput } from '../../schemas/notification.schema';
import {
  NotificationProvider,
  InAppNotificationProvider,
  EmailNotificationProvider,
  PushNotificationProvider,
} from './providers/notification-providers';
import { NotFoundError } from '../../utils/errors';
import { PaginatedResult } from '../../repositories/memory.repository';

export class NotificationService {
  private repository: NotificationRepository;
  private providers: NotificationProvider[];

  constructor(
    repository: NotificationRepository = new NotificationRepository(),
    providers: NotificationProvider[] = [
      new InAppNotificationProvider(),
      new EmailNotificationProvider(),
      new PushNotificationProvider(),
    ],
  ) {
    this.repository = repository;
    this.providers = providers;
  }

  async createNotification(
    userId: string,
    data: CreateNotificationInput,
  ): Promise<NotificationItem> {
    const item = await this.repository.create(userId, data);

    // Dispatch to registered providers
    for (const provider of this.providers) {
      try {
        await provider.send(item);
      } catch {
        // Log & proceed
      }
    }

    return item;
  }

  async getUserNotifications(
    userId: string,
    query: GetNotificationsQueryInput,
  ): Promise<PaginatedResult<NotificationItem>> {
    return this.repository.findUserNotifications(userId, query);
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationItem> {
    const item = await this.repository.findById(notificationId);
    if (!item || item.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }
    return this.repository.markAsRead(notificationId);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const item = await this.repository.findById(notificationId);
    if (!item || item.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }
    await this.repository.delete(notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }
}

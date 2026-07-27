import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification/notification.service';
import { GetNotificationsQuerySchema } from '../schemas/notification.schema';

export class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService = new NotificationService()) {
    this.notificationService = notificationService;
  }

  async getUserNotifications(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const query = GetNotificationsQuerySchema.parse(req.query);

    const result = await this.notificationService.getUserNotifications(userId, query);
    return reply.status(200).send({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }

  async markAsRead(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const { id } = req.params as { id: string };

    const notification = await this.notificationService.markAsRead(userId, id);
    return reply.status(200).send({
      success: true,
      data: notification,
    });
  }

  async deleteNotification(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const { id } = req.params as { id: string };

    await this.notificationService.deleteNotification(userId, id);
    return reply.status(204).send();
  }
}

import { FastifyInstance } from 'fastify';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  const controller = new NotificationController();

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authenticate);

    protectedRoutes.get('/notifications', controller.getUserNotifications.bind(controller));
    protectedRoutes.patch('/notifications/:id/read', controller.markAsRead.bind(controller));
    protectedRoutes.delete('/notifications/:id', controller.deleteNotification.bind(controller));
  });
}

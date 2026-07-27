import { FastifyInstance } from 'fastify';
import { RuntimeController } from '../controllers/runtime.controller';
import { authenticate } from '../middleware/auth';

export async function runtimeRoutes(app: FastifyInstance): Promise<void> {
  const controller = new RuntimeController();

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authenticate);

    protectedRoutes.post('/runtime/events/simulate', controller.simulateEvent.bind(controller));
    protectedRoutes.get('/runtime/activity', controller.getActivityFeed.bind(controller));
    protectedRoutes.get('/runtime/status', controller.getSystemStatus.bind(controller));
  });
}

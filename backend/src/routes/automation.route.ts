import { FastifyPluginAsync } from 'fastify';
import { AutomationController } from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createAutomationSwaggerSchema,
  getProjectAutomationsSwaggerSchema,
  getAutomationByIdSwaggerSchema,
  updateAutomationSwaggerSchema,
  deleteAutomationSwaggerSchema,
  runAutomationSwaggerSchema,
  getExecutionsSwaggerSchema,
} from '../schemas/automation.schema';

export const automationRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AutomationController();

  fastify.post(
    '/projects/:projectId/automations',
    {
      schema: createAutomationSwaggerSchema,
      preHandler: [authenticate, authorize('automation:create')],
    },
    controller.create,
  );

  fastify.get(
    '/projects/:projectId/automations',
    {
      schema: getProjectAutomationsSwaggerSchema,
      preHandler: [authenticate, authorize('automation:read')],
    },
    controller.listForProject,
  );

  fastify.get(
    '/automations/:id',
    {
      schema: getAutomationByIdSwaggerSchema,
      preHandler: [authenticate, authorize('automation:read')],
    },
    controller.getById,
  );

  fastify.patch(
    '/automations/:id',
    {
      schema: updateAutomationSwaggerSchema,
      preHandler: [authenticate, authorize('automation:update')],
    },
    controller.update,
  );

  fastify.delete(
    '/automations/:id',
    {
      schema: deleteAutomationSwaggerSchema,
      preHandler: [authenticate, authorize('automation:delete')],
    },
    controller.delete,
  );

  fastify.post(
    '/automations/:id/run',
    {
      schema: runAutomationSwaggerSchema,
      preHandler: [authenticate, authorize('automation:run')],
    },
    controller.run,
  );

  fastify.get(
    '/automations/:id/executions',
    {
      schema: getExecutionsSwaggerSchema,
      preHandler: [authenticate, authorize('automation:read')],
    },
    controller.getExecutions,
  );
};

import { FastifyPluginAsync } from 'fastify';
import { AutomationController } from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth';
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
    { schema: createAutomationSwaggerSchema, preHandler: [authenticate] },
    controller.create,
  );

  fastify.get(
    '/projects/:projectId/automations',
    { schema: getProjectAutomationsSwaggerSchema, preHandler: [authenticate] },
    controller.listForProject,
  );

  fastify.get(
    '/automations/:id',
    { schema: getAutomationByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getById,
  );

  fastify.patch(
    '/automations/:id',
    { schema: updateAutomationSwaggerSchema, preHandler: [authenticate] },
    controller.update,
  );

  fastify.delete(
    '/automations/:id',
    { schema: deleteAutomationSwaggerSchema, preHandler: [authenticate] },
    controller.delete,
  );

  fastify.post(
    '/automations/:id/run',
    { schema: runAutomationSwaggerSchema, preHandler: [authenticate] },
    controller.run,
  );

  fastify.get(
    '/automations/:id/executions',
    { schema: getExecutionsSwaggerSchema, preHandler: [authenticate] },
    controller.getExecutions,
  );
};

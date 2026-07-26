import { FastifyPluginAsync } from 'fastify';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createTaskSwaggerSchema,
  getProjectTasksSwaggerSchema,
  getTaskByIdSwaggerSchema,
  updateTaskSwaggerSchema,
  deleteTaskSwaggerSchema,
} from '../schemas/task.schema';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new TaskController();

  fastify.post(
    '/projects/:projectId/tasks',
    { schema: createTaskSwaggerSchema, preHandler: [authenticate, authorize('task:create')] },
    controller.createTask,
  );

  fastify.get(
    '/projects/:projectId/tasks',
    { schema: getProjectTasksSwaggerSchema, preHandler: [authenticate, authorize('task:read')] },
    controller.getProjectTasks,
  );

  fastify.get(
    '/tasks/:id',
    { schema: getTaskByIdSwaggerSchema, preHandler: [authenticate, authorize('task:read')] },
    controller.getTaskById,
  );

  fastify.patch(
    '/tasks/:id',
    { schema: updateTaskSwaggerSchema, preHandler: [authenticate, authorize('task:update')] },
    controller.updateTask,
  );

  fastify.delete(
    '/tasks/:id',
    { schema: deleteTaskSwaggerSchema, preHandler: [authenticate, authorize('task:delete')] },
    controller.deleteTask,
  );
};

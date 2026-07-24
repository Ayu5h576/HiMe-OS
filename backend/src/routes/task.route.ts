import { FastifyPluginAsync } from 'fastify';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
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
    { schema: createTaskSwaggerSchema, preHandler: [authenticate] },
    controller.createTask,
  );

  fastify.get(
    '/projects/:projectId/tasks',
    { schema: getProjectTasksSwaggerSchema, preHandler: [authenticate] },
    controller.getProjectTasks,
  );

  fastify.get(
    '/tasks/:id',
    { schema: getTaskByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getTaskById,
  );

  fastify.patch(
    '/tasks/:id',
    { schema: updateTaskSwaggerSchema, preHandler: [authenticate] },
    controller.updateTask,
  );

  fastify.delete(
    '/tasks/:id',
    { schema: deleteTaskSwaggerSchema, preHandler: [authenticate] },
    controller.deleteTask,
  );
};

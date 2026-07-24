import { FastifyPluginAsync } from 'fastify';
import { MemoryController } from '../controllers/memory.controller';
import { authenticate } from '../middleware/auth';
import {
  createMemorySwaggerSchema,
  getProjectMemoriesSwaggerSchema,
  getMemoryByIdSwaggerSchema,
  updateMemorySwaggerSchema,
  deleteMemorySwaggerSchema,
} from '../schemas/memory.schema';

export const memoryRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new MemoryController();

  fastify.post(
    '/projects/:projectId/memories',
    { schema: createMemorySwaggerSchema, preHandler: [authenticate] },
    controller.createMemory,
  );

  fastify.get(
    '/projects/:projectId/memories',
    { schema: getProjectMemoriesSwaggerSchema, preHandler: [authenticate] },
    controller.getProjectMemories,
  );

  fastify.get(
    '/memories/:id',
    { schema: getMemoryByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getMemoryById,
  );

  fastify.patch(
    '/memories/:id',
    { schema: updateMemorySwaggerSchema, preHandler: [authenticate] },
    controller.updateMemory,
  );

  fastify.delete(
    '/memories/:id',
    { schema: deleteMemorySwaggerSchema, preHandler: [authenticate] },
    controller.deleteMemory,
  );
};

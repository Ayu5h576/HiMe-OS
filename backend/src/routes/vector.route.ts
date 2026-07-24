import { FastifyPluginAsync } from 'fastify';
import { VectorController } from '../controllers/vector.controller';
import { authenticate } from '../middleware/auth';
import {
  vectorSearchSwaggerSchema,
  reindexSwaggerSchema,
  similarMemorySwaggerSchema,
} from '../schemas/vector.schema';

export const vectorRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new VectorController();

  fastify.post(
    '/memories/search',
    { schema: vectorSearchSwaggerSchema, preHandler: [authenticate] },
    controller.search,
  );

  fastify.post(
    '/memories/reindex',
    { schema: reindexSwaggerSchema, preHandler: [authenticate] },
    controller.reindex,
  );

  fastify.get(
    '/memories/:id/similar',
    { schema: similarMemorySwaggerSchema, preHandler: [authenticate] },
    controller.similar,
  );
};

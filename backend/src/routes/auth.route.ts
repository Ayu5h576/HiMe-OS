import { FastifyPluginAsync } from 'fastify';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/auth/status', async () => {
    return {
      message: 'Authentication foundation is ready. No endpoints configured yet.',
      timestamp: new Date().toISOString(),
    };
  });
};

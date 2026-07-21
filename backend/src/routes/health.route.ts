import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint returning system status and uptime',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              service: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

      return {
        status: 'ok',
        service: 'HiMe OS Backend',
        timestamp: new Date().toISOString(),
        uptime: uptimeFormatted,
      };
    },
  );
};

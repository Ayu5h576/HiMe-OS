import { FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.route';
import { authRoutes } from './auth.route';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
};

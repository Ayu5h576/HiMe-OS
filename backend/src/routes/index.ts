import { FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.route';
import { authRoutes } from './auth.route';
import { projectRoutes } from './project.route';
import { taskRoutes } from './task.route';
import { conversationRoutes } from './conversation.route';
import { memoryRoutes } from './memory.route';
import { aiRoutes } from './ai.route';
import { vectorRoutes } from './vector.route';
import { automationRoutes } from './automation.route';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(projectRoutes);
  await fastify.register(taskRoutes);
  await fastify.register(conversationRoutes);
  await fastify.register(memoryRoutes);
  await fastify.register(aiRoutes);
  await fastify.register(vectorRoutes);
  await fastify.register(automationRoutes);
};

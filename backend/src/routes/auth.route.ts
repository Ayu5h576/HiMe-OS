import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import {
  registerSwaggerSchema,
  loginSwaggerSchema,
  meSwaggerSchema,
  refreshSwaggerSchema,
  logoutSwaggerSchema,
} from '../schemas/auth.schema';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authController = new AuthController();

  fastify.post('/auth/register', { schema: registerSwaggerSchema }, authController.register);
  fastify.post('/auth/login', { schema: loginSwaggerSchema }, authController.login);
  fastify.get(
    '/auth/me',
    { schema: meSwaggerSchema, preHandler: [authenticate] },
    authController.getMe,
  );
  fastify.post('/auth/refresh', { schema: refreshSwaggerSchema }, authController.refresh);
  fastify.post('/auth/logout', { schema: logoutSwaggerSchema }, authController.logout);
};

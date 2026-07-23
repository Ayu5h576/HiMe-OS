import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma';
import jwtPlugin from './plugins/jwt';
import swaggerPlugin from './plugins/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { routes } from './routes';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    ajv: {
      customOptions: {
        keywords: ['example'],
      },
    },
    logger:
      env.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          }
        : env.NODE_ENV !== 'test',
  });

  // Security & Utility Middlewares
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(compress);

  // Custom Plugins
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);

  // Custom Handlers
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // Routes
  await app.register(routes);

  return app;
};

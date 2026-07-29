import { FastifyPluginAsync } from 'fastify';
import { BrowserController } from '../controllers/browser.controller';
import { authenticate } from '../middleware/auth';
import {
  openBrowserSwaggerSchema,
  navigateBrowserSwaggerSchema,
  actionBrowserSwaggerSchema,
  extractBrowserSwaggerSchema,
  screenshotBrowserSwaggerSchema,
  getSessionBrowserSwaggerSchema,
  closeSessionBrowserSwaggerSchema,
} from '../schemas/browser.schema';

export const browserRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new BrowserController();

  fastify.post(
    '/browser/open',
    { schema: openBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.open,
  );

  fastify.post(
    '/browser/navigate',
    { schema: navigateBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.navigate,
  );

  fastify.post(
    '/browser/action',
    { schema: actionBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.action,
  );

  fastify.post(
    '/browser/extract',
    { schema: extractBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.extract,
  );

  fastify.post(
    '/browser/screenshot',
    { schema: screenshotBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.screenshot,
  );

  fastify.get(
    '/browser/session',
    { schema: getSessionBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.getSession,
  );

  fastify.delete(
    '/browser/session',
    { schema: closeSessionBrowserSwaggerSchema, preHandler: [authenticate] },
    controller.closeSession,
  );

  fastify.get(
    '/browser/providers',
    { preHandler: [authenticate] },
    controller.getProviders,
  );
};

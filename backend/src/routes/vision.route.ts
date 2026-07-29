import { FastifyPluginAsync } from 'fastify';
import { VisionController } from '../controllers/vision.controller';
import { authenticate } from '../middleware/auth';
import {
  analyzeImageSwaggerSchema,
  ocrSwaggerSchema,
  objectsSwaggerSchema,
  sceneSwaggerSchema,
  screenshotSwaggerSchema,
  getVisionProvidersSwaggerSchema,
} from '../schemas/vision.schema';

export const visionRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new VisionController();

  fastify.post(
    '/vision/analyze',
    { schema: analyzeImageSwaggerSchema, preHandler: [authenticate] },
    controller.analyze,
  );

  fastify.post(
    '/vision/ocr',
    { schema: ocrSwaggerSchema, preHandler: [authenticate] },
    controller.ocr,
  );

  fastify.post(
    '/vision/objects',
    { schema: objectsSwaggerSchema, preHandler: [authenticate] },
    controller.objects,
  );

  fastify.post(
    '/vision/scene',
    { schema: sceneSwaggerSchema, preHandler: [authenticate] },
    controller.scene,
  );

  fastify.post(
    '/vision/screenshot',
    { schema: screenshotSwaggerSchema, preHandler: [authenticate] },
    controller.screenshot,
  );

  fastify.get(
    '/vision/providers',
    { schema: getVisionProvidersSwaggerSchema, preHandler: [authenticate] },
    controller.getProviders,
  );
};

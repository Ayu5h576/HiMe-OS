import { FastifyPluginAsync } from 'fastify';
import { DeviceController } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth';
import {
  createDeviceSwaggerSchema,
  getProjectDevicesSwaggerSchema,
  getDeviceByIdSwaggerSchema,
  updateDeviceSwaggerSchema,
  deleteDeviceSwaggerSchema,
  connectDeviceSwaggerSchema,
  disconnectDeviceSwaggerSchema,
} from '../schemas/device.schema';

export const deviceRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new DeviceController();

  fastify.post(
    '/projects/:projectId/devices',
    { schema: createDeviceSwaggerSchema, preHandler: [authenticate] },
    controller.create,
  );

  fastify.get(
    '/projects/:projectId/devices',
    { schema: getProjectDevicesSwaggerSchema, preHandler: [authenticate] },
    controller.listForProject,
  );

  fastify.get(
    '/devices/:id',
    { schema: getDeviceByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getById,
  );

  fastify.patch(
    '/devices/:id',
    { schema: updateDeviceSwaggerSchema, preHandler: [authenticate] },
    controller.update,
  );

  fastify.delete(
    '/devices/:id',
    { schema: deleteDeviceSwaggerSchema, preHandler: [authenticate] },
    controller.delete,
  );

  fastify.post(
    '/devices/:id/connect',
    { schema: connectDeviceSwaggerSchema, preHandler: [authenticate] },
    controller.connect,
  );

  fastify.post(
    '/devices/:id/disconnect',
    { schema: disconnectDeviceSwaggerSchema, preHandler: [authenticate] },
    controller.disconnect,
  );
};

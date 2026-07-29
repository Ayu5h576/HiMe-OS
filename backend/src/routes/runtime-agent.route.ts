import { FastifyPluginAsync } from 'fastify';
import { RuntimeAgentController } from '../controllers/runtime-agent.controller';
import { authenticate } from '../middleware/auth';
import {
  getRuntimeAgentStatusSwaggerSchema,
  getRuntimeAgentSystemSwaggerSchema,
  getRuntimeAgentProcessesSwaggerSchema,
  launchAppSwaggerSchema,
  closeAppSwaggerSchema,
  systemActionSwaggerSchema,
  getRuntimeAgentBatterySwaggerSchema,
  getRuntimeAgentEventsSwaggerSchema,
} from '../schemas/runtime-agent.schema';

export const runtimeAgentRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new RuntimeAgentController();

  fastify.get(
    '/runtime-agent/status',
    { schema: getRuntimeAgentStatusSwaggerSchema, preHandler: [authenticate] },
    controller.getStatus,
  );

  fastify.get(
    '/runtime-agent/system',
    { schema: getRuntimeAgentSystemSwaggerSchema, preHandler: [authenticate] },
    controller.getSystem,
  );

  fastify.get(
    '/runtime-agent/processes',
    { schema: getRuntimeAgentProcessesSwaggerSchema, preHandler: [authenticate] },
    controller.getProcesses,
  );

  fastify.post(
    '/runtime-agent/apps/launch',
    { schema: launchAppSwaggerSchema, preHandler: [authenticate] },
    controller.launchApp,
  );

  fastify.post(
    '/runtime-agent/apps/close',
    { schema: closeAppSwaggerSchema, preHandler: [authenticate] },
    controller.closeApp,
  );

  fastify.post(
    '/runtime-agent/system/action',
    { schema: systemActionSwaggerSchema, preHandler: [authenticate] },
    controller.systemAction,
  );

  fastify.get(
    '/runtime-agent/battery',
    { schema: getRuntimeAgentBatterySwaggerSchema, preHandler: [authenticate] },
    controller.getBattery,
  );

  fastify.get(
    '/runtime-agent/events',
    { schema: getRuntimeAgentEventsSwaggerSchema, preHandler: [authenticate] },
    controller.getEvents,
  );
};

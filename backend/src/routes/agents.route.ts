import { FastifyPluginAsync } from 'fastify';
import { AgentsController } from '../controllers/agents.controller';
import { authenticate } from '../middleware/auth';
import {
  executeOrchestrationSwaggerSchema,
  listAgentsSwaggerSchema,
  getAgentStatusSwaggerSchema,
  getActivityLogsSwaggerSchema,
} from '../schemas/agents.schema';

export const agentsRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AgentsController();

  fastify.post(
    '/agents/execute',
    { schema: executeOrchestrationSwaggerSchema, preHandler: [authenticate] },
    controller.execute,
  );

  fastify.get(
    '/agents',
    { schema: listAgentsSwaggerSchema, preHandler: [authenticate] },
    controller.listAgents,
  );

  fastify.get(
    '/agents/status',
    { schema: getAgentStatusSwaggerSchema, preHandler: [authenticate] },
    controller.getStatus,
  );

  fastify.get(
    '/agents/activity',
    { schema: getActivityLogsSwaggerSchema, preHandler: [authenticate] },
    controller.getActivity,
  );
};

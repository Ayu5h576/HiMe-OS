import { FastifyRequest, FastifyReply } from 'fastify';
import { SupervisorAgentService } from '../services/agents/supervisor.service';
import { executeOrchestrationSchema, getActivityLogsQuerySchema } from '../schemas/agents.schema';

export class AgentsController {
  private supervisorService: SupervisorAgentService;

  constructor(supervisorService: SupervisorAgentService = new SupervisorAgentService()) {
    this.supervisorService = supervisorService;
  }

  execute = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = executeOrchestrationSchema.parse(req.body);

    const result = await this.supervisorService.executeOrchestration({
      userId,
      prompt: body.prompt,
      projectId: body.projectId,
      conversationId: body.conversationId,
      initialData: body.initialData,
    });

    return reply.status(200).send({ success: true, data: result });
  };

  listAgents = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const agents = this.supervisorService.getAgents();
    return reply.status(200).send({ success: true, data: agents });
  };

  getStatus = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const status = this.supervisorService.getFrameworkStatus();
    return reply.status(200).send({ success: true, data: status });
  };

  getActivity = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const { limit } = getActivityLogsQuerySchema.parse(req.query);
    const logs = this.supervisorService.getActivityLogs(userId, limit);
    return reply.status(200).send({ success: true, data: logs });
  };
}

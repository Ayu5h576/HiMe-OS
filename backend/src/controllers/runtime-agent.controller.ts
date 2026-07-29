import { FastifyRequest, FastifyReply } from 'fastify';
import { NativeRuntimeAgentService } from '../services/runtime-agent/runtime-agent.service';
import {
  launchAppSchema,
  closeAppSchema,
  systemActionSchema,
} from '../schemas/runtime-agent.schema';
import { AgentEventType } from '../services/runtime-agent/types';

export class RuntimeAgentController {
  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = new NativeRuntimeAgentService()) {
    this.agentService = agentService;
  }

  getStatus = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const status = await this.agentService.getStatus();
    return reply.status(200).send({ success: true, data: status });
  };

  getSystem = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const system = await this.agentService.getSystemInfo();
    return reply.status(200).send({ success: true, data: system });
  };

  getProcesses = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const procs = await this.agentService.getRunningProcesses();
    return reply.status(200).send({ success: true, data: procs });
  };

  launchApp = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = launchAppSchema.parse(req.body);
    const result = await this.agentService.launchApplication(body.appName);
    return reply.status(200).send({ success: true, data: result });
  };

  closeApp = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = closeAppSchema.parse(req.body);
    const targetVal = /^\d+$/.test(body.target) ? parseInt(body.target, 10) : body.target;
    const result = await this.agentService.closeApplication(targetVal);
    return reply.status(200).send({ success: true, data: result });
  };

  systemAction = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = systemActionSchema.parse(req.body);
    const result = await this.agentService.executeCommand(body);
    return reply.status(200).send({ success: true, data: result });
  };

  getBattery = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const battery = await this.agentService.getBatteryInfo();
    return reply.status(200).send({ success: true, data: battery });
  };

  getEvents = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = req.query as { type?: AgentEventType; limit?: string };
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const events = this.agentService.getRecentEvents(query.type, limit);
    return reply.status(200).send({ success: true, data: events });
  };
}

import { FastifyRequest, FastifyReply } from 'fastify';
import { AutomationService } from '../services/automation/automation.service';
import { DeviceEventService } from '../services/automation/device-event.service';
import {
  createAutomationSchema,
  updateAutomationSchema,
  getAutomationsQuerySchema,
  runAutomationSchema,
  deviceEventSchema,
} from '../schemas/automation.schema';

export class AutomationController {
  private automationService: AutomationService;
  private deviceEventService: DeviceEventService;

  constructor(
    automationService: AutomationService = new AutomationService(),
    deviceEventService: DeviceEventService = new DeviceEventService(),
  ) {
    this.automationService = automationService;
    this.deviceEventService = deviceEventService;
  }

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = req.params as { projectId: string };
    const body = createAutomationSchema.parse(req.body);
    const userId = req.user.id;

    const automation = await this.automationService.createAutomation(userId, projectId, body);

    return reply.status(201).send({
      success: true,
      data: automation,
    });
  };

  listForProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = req.params as { projectId: string };
    const query = getAutomationsQuerySchema.parse(req.query);
    const userId = req.user.id;

    const result = await this.automationService.getProjectAutomations(userId, projectId, query);

    return reply.status(200).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };

  getById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const automation = await this.automationService.getAutomationById(userId, id);

    return reply.status(200).send({
      success: true,
      data: automation,
    });
  };

  update = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const body = updateAutomationSchema.parse(req.body);
    const userId = req.user.id;

    const updated = await this.automationService.updateAutomation(userId, id, body);

    return reply.status(200).send({
      success: true,
      data: updated,
    });
  };

  delete = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    await this.automationService.deleteAutomation(userId, id);

    return reply.status(204).send();
  };

  run = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const body = runAutomationSchema.parse(req.body || {});
    const userId = req.user.id;

    const execution = await this.automationService.runAutomation(userId, id, body.input);

    return reply.status(200).send({
      success: true,
      data: execution,
    });
  };

  getExecutions = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const executions = await this.automationService.getAutomationExecutions(userId, id);

    return reply.status(200).send({
      success: true,
      data: executions,
    });
  };

  dispatchDeviceEvent = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = req.params as { projectId: string };
    const body = deviceEventSchema.parse(req.body);
    const userId = req.user.id;

    const executions = await this.deviceEventService.dispatchDeviceEvent(userId, projectId, body);

    return reply.status(200).send({
      success: true,
      data: executions,
    });
  };
}

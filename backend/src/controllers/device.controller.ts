import { FastifyRequest, FastifyReply } from 'fastify';
import { DeviceService } from '../services/device.service';
import {
  createDeviceSchema,
  updateDeviceSchema,
  getDevicesQuerySchema,
} from '../schemas/device.schema';

export class DeviceController {
  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = req.params as { projectId: string };
    const input = createDeviceSchema.parse(req.body);
    const userId = req.user.id;

    const device = await this.deviceService.createDevice(userId, projectId, input);

    return reply.status(201).send({
      success: true,
      data: device,
    });
  };

  listForProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = req.params as { projectId: string };
    const query = getDevicesQuerySchema.parse(req.query);
    const userId = req.user.id;

    const result = await this.deviceService.getProjectDevices(userId, projectId, query);

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

    const device = await this.deviceService.getDeviceById(userId, id);

    return reply.status(200).send({
      success: true,
      data: device,
    });
  };

  update = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const input = updateDeviceSchema.parse(req.body);
    const userId = req.user.id;

    const device = await this.deviceService.updateDevice(userId, id, input);

    return reply.status(200).send({
      success: true,
      data: device,
    });
  };

  delete = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    await this.deviceService.deleteDevice(userId, id);

    return reply.status(204).send();
  };

  connect = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const device = await this.deviceService.connectDevice(userId, id);

    return reply.status(200).send({
      success: true,
      data: device,
    });
  };

  disconnect = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const device = await this.deviceService.disconnectDevice(userId, id);

    return reply.status(200).send({
      success: true,
      data: device,
    });
  };
}

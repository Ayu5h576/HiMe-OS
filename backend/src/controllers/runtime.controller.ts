import { FastifyRequest, FastifyReply } from 'fastify';
import { VirtualSensorService } from '../services/runtime/virtual-sensor.service';
import { ActivityFeedService } from '../services/runtime/activity-feed.service';
import { RuntimeMonitoringService } from '../services/runtime/monitoring.service';
import { SimulateEventSchema, GetActivityQuerySchema } from '../schemas/runtime.schema';

export class RuntimeController {
  private sensorService: VirtualSensorService;
  private activityService: ActivityFeedService;
  private monitoringService: RuntimeMonitoringService;

  constructor(
    sensorService: VirtualSensorService = new VirtualSensorService(),
    activityService: ActivityFeedService = new ActivityFeedService(),
    monitoringService: RuntimeMonitoringService = new RuntimeMonitoringService(),
  ) {
    this.sensorService = sensorService;
    this.activityService = activityService;
    this.monitoringService = monitoringService;
  }

  async simulateEvent(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const body = SimulateEventSchema.parse(req.body);

    const result = await this.sensorService.triggerEvent(
      userId,
      body.deviceId,
      body.eventType as any,
      body.payload || {},
    );

    return reply.status(200).send({
      success: true,
      message: `Simulated event '${body.eventType}' triggered on device`,
      data: result,
    });
  }

  async getActivityFeed(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const query = GetActivityQuerySchema.parse(req.query);

    const result = await this.activityService.getUserActivityFeed(userId, query);
    return reply.status(200).send({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }

  async getSystemStatus(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (req.user as { id: string }).id;
    const status = await this.monitoringService.getSystemStatus(userId);

    return reply.status(200).send({
      success: true,
      data: status,
    });
  }
}

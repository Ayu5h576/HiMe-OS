import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { DeviceService } from '../../device.service';
import { logger } from '../../../config/logger';

export class DeviceAgent implements IAgent {
  readonly name = 'Device Agent';
  readonly type: AgentType = 'device';
  readonly description = 'Inspects connected IoT devices, reads telemetry, and controls smart home hardware.';
  readonly capabilities = ['device_inspection', 'device_control', 'telemetry_reading'];

  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  async execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[DeviceAgent] Executing subtask '${task.id}': ${task.title}`);

    let deviceCount = 0;
    if (context.projectId) {
      try {
        const devices = await this.deviceService.getProjectDevices(userId, context.projectId);
        deviceCount = devices.length;
      } catch {
        deviceCount = 0;
      }
    }

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: {
        taskTitle: task.title,
        connectedDevices: deviceCount,
        status: 'DEVICES_INSPECTED',
      },
      executedAt: new Date().toISOString(),
    };
  }
}

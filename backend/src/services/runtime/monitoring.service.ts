import { SchedulerService } from '../automation/scheduler.service';
import { DeviceRepository } from '../../repositories/device.repository';
import { AutomationRepository } from '../../repositories/automation.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { ActivityRepository } from '../../repositories/activity.repository';
import { RuntimeEventBusService } from './event-bus.service';

export class RuntimeMonitoringService {
  private deviceRepository: DeviceRepository;
  private automationRepository: AutomationRepository;
  private notificationRepository: NotificationRepository;
  private activityRepository: ActivityRepository;

  constructor(
    deviceRepository: DeviceRepository = new DeviceRepository(),
    automationRepository: AutomationRepository = new AutomationRepository(),
    notificationRepository: NotificationRepository = new NotificationRepository(),
    activityRepository: ActivityRepository = new ActivityRepository(),
  ) {
    this.deviceRepository = deviceRepository;
    this.automationRepository = automationRepository;
    this.notificationRepository = notificationRepository;
    this.activityRepository = activityRepository;
  }

  /**
   * Retrieves full system diagnostics and runtime status metrics.
   */
  async getSystemStatus(userId: string) {
    const schedulerStatus = SchedulerService.getStatus();
    const totalDevices = await this.deviceRepository.countTotal();
    const totalAutomations = await this.automationRepository.countTotal();
    const unreadNotifications = await this.notificationRepository.countUnread(userId);
    const totalActivities = await this.activityRepository.countTotal();
    const recentEvents = RuntimeEventBusService.getRecentEvents(10);

    return {
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: {
        scheduler: schedulerStatus,
        simulator: {
          status: 'ONLINE',
          virtualSensorsActive: true,
        },
        counts: {
          devices: totalDevices,
          automations: totalAutomations,
          unreadNotifications,
          activitiesLogged: totalActivities,
        },
        recentEvents,
      },
    };
  }
}

import { ActivityRepository, ActivityItem } from '../../repositories/activity.repository';
import { GetActivityQueryInput } from '../../schemas/runtime.schema';
import { RuntimeEventBusService, RuntimeEvent } from './event-bus.service';
import { PaginatedResult } from '../../repositories/memory.repository';

export class ActivityFeedService {
  private repository: ActivityRepository;
  private static initialized = false;

  constructor(repository: ActivityRepository = new ActivityRepository()) {
    this.repository = repository;
    this.subscribeToEventBus();
  }

  private subscribeToEventBus(): void {
    if (ActivityFeedService.initialized) return;
    ActivityFeedService.initialized = true;

    RuntimeEventBusService.subscribeAll(async (event: RuntimeEvent) => {
      try {
        let category = 'SYSTEM';
        let action: string = event.type;
        let description = `Event ${event.type} triggered`;

        if (event.type === 'DeviceChanged') {
          category = 'DEVICE';
          action = 'DEVICE_UPDATE';
          description = `Device '${(event.payload as any).deviceName || 'Device'}' updated state`;
        } else if (event.type === 'AutomationExecuted') {
          category = 'AUTOMATION';
          action = 'AUTOMATION_RUN';
          description = `Automation rule executed`;
        } else if (event.type === 'TaskCreated') {
          category = 'TASK';
          action = 'TASK_CREATE';
          description = `New task created`;
        } else if (event.type === 'MemoryCreated') {
          category = 'MEMORY';
          action = 'MEMORY_CREATE';
          description = `New memory stored`;
        } else if (event.type === 'ConversationUpdated') {
          category = 'AI';
          action = 'CONVERSATION_UPDATE';
          description = `Conversation message received`;
        } else if (event.type === 'NotificationCreated') {
          category = 'NOTIFICATION';
          action = 'NOTIFICATION_SEND';
          description = `Notification created for user`;
        }

        await this.repository.create({
          userId: event.userId,
          projectId: event.projectId,
          category,
          action,
          description,
          metadata: event.payload as Record<string, unknown>,
        });
      } catch {
        // Ignore background activity logging errors
      }
    });
  }

  async getUserActivityFeed(
    userId: string,
    query: GetActivityQueryInput,
  ): Promise<PaginatedResult<ActivityItem>> {
    return this.repository.findActivities(userId, query);
  }

  async recordManualActivity(
    userId: string,
    data: {
      category: string;
      action: string;
      description: string;
      projectId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<ActivityItem> {
    return this.repository.create({
      userId,
      projectId: data.projectId,
      category: data.category,
      action: data.action,
      description: data.description,
      metadata: data.metadata,
    });
  }
}

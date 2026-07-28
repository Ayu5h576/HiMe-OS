import { NotificationService } from '../notification/notification.service';
import { logger } from '../../config/logger';

export interface DesktopNotificationPayload {
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';
  projectId?: string;
}

export interface DesktopNotificationResult {
  success: boolean;
  notificationId?: string;
  deliveredAt: string;
  channel: 'in-app';
}

export class DesktopNotificationService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService = new NotificationService()) {
    this.notificationService = notificationService;
  }

  /**
   * Bridges a desktop notification request through the existing Notification Gateway.
   * The AI Provider never calls this directly — it goes through the Tool Calling Framework.
   */
  async sendDesktopNotification(
    userId: string,
    payload: DesktopNotificationPayload,
  ): Promise<DesktopNotificationResult> {
    logger.info(
      `[DesktopNotificationService] Sending desktop notification for user '${userId}': ${payload.title}`,
    );

    const notification = await this.notificationService.createNotification(userId, {
      title: payload.title,
      message: payload.message,
      type: payload.type ?? 'INFO',
      projectId: payload.projectId,
      metadata: {
        source: 'desktop-agent',
        deliveredVia: 'notification-gateway',
      },
    });

    return {
      success: true,
      notificationId: notification.id,
      deliveredAt: new Date().toISOString(),
      channel: 'in-app',
    };
  }
}

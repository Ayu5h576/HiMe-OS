import { NotificationItem } from '../../../repositories/notification.repository';
import { logger } from '../../../config/logger';

export interface NotificationProvider {
  name: string;
  send(notification: NotificationItem): Promise<boolean>;
}

export class InAppNotificationProvider implements NotificationProvider {
  name = 'InApp';

  async send(notification: NotificationItem): Promise<boolean> {
    logger.info(
      `[InAppProvider] Emitted in-app notification [${notification.type}] to user ${notification.userId}: ${notification.title}`,
    );
    return true;
  }
}

export class EmailNotificationProvider implements NotificationProvider {
  name = 'Email';

  async send(notification: NotificationItem): Promise<boolean> {
    logger.info(
      `[EmailProvider] [Abstraction] Queued email notification [${notification.type}] to user ${notification.userId}: ${notification.title}`,
    );
    return true;
  }
}

export class PushNotificationProvider implements NotificationProvider {
  name = 'Push';

  async send(notification: NotificationItem): Promise<boolean> {
    logger.info(
      `[PushProvider] [Abstraction] Sent push notification [${notification.type}] to user ${notification.userId}: ${notification.title}`,
    );
    return true;
  }
}

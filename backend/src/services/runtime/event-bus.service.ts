import { EventEmitter } from 'events';
import { logger } from '../../config/logger';

export type RuntimeEventType =
  | 'DeviceChanged'
  | 'AutomationExecuted'
  | 'TaskCreated'
  | 'MemoryCreated'
  | 'ConversationUpdated'
  | 'NotificationCreated';

export interface RuntimeEvent<T = Record<string, unknown>> {
  id: string;
  type: RuntimeEventType;
  userId: string;
  projectId?: string | null;
  timestamp: Date;
  payload: T;
}

export type RuntimeEventHandler<T = any> = (event: RuntimeEvent<T>) => void | Promise<void>;

export class RuntimeEventBusService {
  private static emitter = new EventEmitter();
  private static eventHistory: RuntimeEvent[] = [];
  private static maxHistory = 100;

  static subscribe<T = any>(type: RuntimeEventType, handler: RuntimeEventHandler<T>): void {
    this.emitter.on(type, handler);
  }

  static unsubscribe<T = any>(type: RuntimeEventType, handler: RuntimeEventHandler<T>): void {
    this.emitter.off(type, handler);
  }

  static publish<T = Record<string, unknown>>(
    type: RuntimeEventType,
    userId: string,
    payload: T,
    projectId?: string | null,
  ): RuntimeEvent<T> {
    const event: RuntimeEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      userId,
      projectId: projectId ?? null,
      timestamp: new Date(),
      payload,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.pop();
    }

    logger.info(`[EventBus] Emitted event '${type}' for user '${userId}'`);
    setImmediate(() => {
      this.emitter.emit(type, event);
      this.emitter.emit('*', event);
    });

    return event;
  }

  static subscribeAll(handler: RuntimeEventHandler): void {
    this.emitter.on('*', handler);
  }

  static getRecentEvents(limit = 20): RuntimeEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  static clearHistory(): void {
    this.eventHistory = [];
    this.emitter.removeAllListeners();
  }
}

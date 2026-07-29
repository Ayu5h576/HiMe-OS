import { AgentEvent, AgentEventType } from './types';
import { logger } from '../../config/logger';

export class EventStreamService {
  private static events: AgentEvent[] = [];
  private static readonly MAX_EVENTS = 1000;
  private listeners: Array<(event: AgentEvent) => void> = [];

  emitEvent(type: AgentEventType, data: Record<string, unknown>): AgentEvent {
    const event: AgentEvent = {
      id: `agtevt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    EventStreamService.events.unshift(event);
    if (EventStreamService.events.length > EventStreamService.MAX_EVENTS) {
      EventStreamService.events.pop();
    }

    logger.debug(`[EventStreamService] Emitted agent event '${type}'`);
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        logger.error(`[EventStreamService] Listener error: ${err}`);
      }
    }

    return event;
  }

  getRecentEvents(type?: AgentEventType, limit = 50): AgentEvent[] {
    if (!type) {
      return EventStreamService.events.slice(0, limit);
    }
    return EventStreamService.events.filter((e) => e.type === type).slice(0, limit);
  }

  subscribe(listener: (event: AgentEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  static clear(): void {
    EventStreamService.events = [];
  }
}

import { logger } from '../../config/logger';

export type AgentActivityType =
  | 'PLANNING_STARTED'
  | 'PLAN_CREATED'
  | 'SUBTASK_STARTED'
  | 'SUBTASK_COMPLETED'
  | 'SUBTASK_FAILED'
  | 'SUBTASK_RETRY'
  | 'AGGREGATION_STARTED'
  | 'AGGREGATION_COMPLETED';

export interface AgentActivityLog {
  id: string;
  userId: string;
  planId?: string;
  subtaskId?: string;
  agentType?: string;
  type: AgentActivityType;
  details: Record<string, unknown>;
  timestamp: string;
}

export class AgentActivityService {
  private static logs: AgentActivityLog[] = [];
  private static readonly MAX_LOGS = 1000;

  /**
   * Log an agent activity event into the in-memory ring buffer.
   */
  logActivity(
    userId: string,
    type: AgentActivityType,
    details: Record<string, unknown>,
    planId?: string,
    subtaskId?: string,
    agentType?: string,
  ): AgentActivityLog {
    const entry: AgentActivityLog = {
      id: `aglog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      planId,
      subtaskId,
      agentType,
      type,
      details,
      timestamp: new Date().toISOString(),
    };

    AgentActivityService.logs.unshift(entry);
    if (AgentActivityService.logs.length > AgentActivityService.MAX_LOGS) {
      AgentActivityService.logs.pop();
    }

    logger.debug(`[AgentActivityService] Recorded event '${type}' for user '${userId}'`);
    return entry;
  }

  /**
   * Returns activity logs for a user.
   */
  getLogs(userId: string, limit = 50): AgentActivityLog[] {
    return AgentActivityService.logs
      .filter((log) => log.userId === userId)
      .slice(0, limit);
  }

  /**
   * Returns activity logs for a specific execution plan.
   */
  getPlanLogs(planId: string): AgentActivityLog[] {
    return AgentActivityService.logs.filter((log) => log.planId === planId);
  }

  /**
   * Clears logs (used for testing).
   */
  static clear(): void {
    AgentActivityService.logs = [];
  }
}

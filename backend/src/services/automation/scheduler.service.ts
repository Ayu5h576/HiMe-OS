import { CronEngineService } from './cron-engine.service';
import { ScheduleEvaluatorService } from './schedule-evaluator.service';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AutomationExecution } from '@prisma/client';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;
  private static lastTickAt: Date | null = null;
  private static totalTicksExecuted = 0;
  private static cronEngineService = new CronEngineService();

  /**
   * Validates schedule syntax using ScheduleEvaluatorService.
   */
  static validateSchedule(schedule?: string | null): boolean {
    return ScheduleEvaluatorService.validate(schedule);
  }

  /**
   * Starts the background scheduler loop.
   */
  static start(intervalMs: number = env.SCHEDULER_INTERVAL_MS): boolean {
    if (!env.SCHEDULER_ENABLED) {
      logger.info('[SchedulerService] Scheduler is disabled via SCHEDULER_ENABLED config.');
      return false;
    }

    if (this.isRunning) {
      logger.warn('[SchedulerService] Scheduler is already running.');
      return true;
    }

    this.isRunning = true;
    logger.info(
      `[SchedulerService] Starting background scheduler loop (Interval: ${intervalMs}ms)...`,
    );

    this.timer = setInterval(async () => {
      await this.tick();
    }, intervalMs);

    return true;
  }

  /**
   * Stops the background scheduler loop.
   */
  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('[SchedulerService] Background scheduler stopped.');
  }

  /**
   * Triggers a single scheduler tick immediately.
   */
  static async tick(targetTime: Date = new Date()): Promise<AutomationExecution[]> {
    this.lastTickAt = targetTime;
    this.totalTicksExecuted += 1;

    logger.debug(`[SchedulerService] Tick #${this.totalTicksExecuted} at ${targetTime.toISOString()}`);
    return await this.cronEngineService.processDueAutomations(targetTime, {
      missedExecutionPolicy: env.MISSED_EXECUTION_POLICY,
    });
  }

  /**
   * Returns current scheduler status.
   */
  static getStatus() {
    return {
      enabled: env.SCHEDULER_ENABLED,
      isRunning: this.isRunning,
      intervalMs: env.SCHEDULER_INTERVAL_MS,
      missedExecutionPolicy: env.MISSED_EXECUTION_POLICY,
      lastTickAt: this.lastTickAt,
      totalTicksExecuted: this.totalTicksExecuted,
    };
  }
}

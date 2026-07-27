import { Automation, AutomationExecution, TriggerType } from '@prisma/client';
import { AutomationRepository } from '../../repositories/automation.repository';
import { ProjectRepository } from '../../repositories/project.repository';
import { ActionRunnerService } from './action-runner.service';
import { AutomationExecutionService } from './automation-execution.service';
import { ScheduleEvaluatorService } from './schedule-evaluator.service';
import { ExecutionLockService } from './execution-lock.service';
import { logger } from '../../config/logger';

export interface ProcessTickOptions {
  missedExecutionPolicy?: 'skip' | 'catchup';
  maxCatchupWindowMinutes?: number;
}

export class CronEngineService {
  private automationRepository: AutomationRepository;
  private projectRepository: ProjectRepository;
  private actionRunnerService: ActionRunnerService;
  private executionService: AutomationExecutionService;

  constructor(
    automationRepository: AutomationRepository = new AutomationRepository(),
    projectRepository: ProjectRepository = new ProjectRepository(),
    actionRunnerService: ActionRunnerService = new ActionRunnerService(),
    executionService: AutomationExecutionService = new AutomationExecutionService(),
  ) {
    this.automationRepository = automationRepository;
    this.projectRepository = projectRepository;
    this.actionRunnerService = actionRunnerService;
    this.executionService = executionService;
  }

  /**
   * Processes all due scheduled automations at the specified target time.
   */
  async processDueAutomations(
    targetTime: Date = new Date(),
    options: ProcessTickOptions = {},
  ): Promise<AutomationExecution[]> {
    const automations = await this.automationRepository.findScheduledAutomations();
    const executedResults: AutomationExecution[] = [];

    // Filter enabled SCHEDULED automations with valid schedule
    const candidateAutomations = automations.filter(
      (auto) => auto.enabled && auto.triggerType === TriggerType.SCHEDULED && !!auto.schedule,
    );

    for (const automation of candidateAutomations) {
      try {
        const executions = await this.executionService.getExecutionsForAutomation(automation.id);
        const lastExecution = executions.length > 0 ? executions[0] : null;
        const lastExecutedAt = lastExecution ? lastExecution.executedAt : null;

        const isDue = ScheduleEvaluatorService.isDue(
          automation.schedule!,
          targetTime,
          lastExecutedAt,
        );

        if (!isDue) {
          continue;
        }

        // Acquire concurrency lock
        const locked = ExecutionLockService.acquireLock(automation.id);
        if (!locked) {
          logger.warn(
            `[CronEngine] Skipping execution for automation '${automation.name}' (${automation.id}) - execution lock active.`,
          );
          continue;
        }

        try {
          const execution = await this.executeAutomation(automation, targetTime);
          executedResults.push(execution);
        } finally {
          ExecutionLockService.releaseLock(automation.id);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error(
          `[CronEngine] Error processing scheduled automation '${automation.name}': ${errorMsg}`,
        );
      }
    }

    return executedResults;
  }

  /**
   * Executes a single scheduled automation and records logs.
   */
  private async executeAutomation(
    automation: Automation,
    tickTime: Date,
  ): Promise<AutomationExecution> {
    const project = await this.projectRepository.findById(automation.projectId);
    const userId = project ? project.ownerId : 'system';

    const inputData = {
      trigger: 'SCHEDULED',
      schedule: automation.schedule,
      tickTime: tickTime.toISOString(),
    };

    const execution = await this.executionService.startExecution(automation.id, inputData);

    try {
      const output = await this.actionRunnerService.runAction(automation, userId, inputData);
      const successRecord = await this.executionService.recordSuccess(execution.id, output);
      logger.info(
        `[CronEngine] Successfully executed scheduled automation '${automation.name}' (${automation.id})`,
      );
      return successRecord;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      const failRecord = await this.executionService.recordFailure(execution.id, errorMessage);
      logger.error(
        `[CronEngine] Scheduled automation '${automation.name}' failed: ${errorMessage}`,
      );
      return failRecord;
    }
  }
}

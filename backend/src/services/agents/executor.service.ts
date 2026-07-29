import { ExecutionPlan, AgentContext, AgentSubTaskResult, SubTask } from './agent.interface';
import { AgentRegistry } from './registry.service';
import { AgentActivityService } from './activity.service';
import { logger } from '../../config/logger';

export interface ExecutorOptions {
  maxRetries?: number;
}

export class AgentExecutorService {
  private registry: AgentRegistry;
  private activityService: AgentActivityService;
  private maxRetries: number;

  constructor(
    registry: AgentRegistry = AgentRegistry.getInstance(),
    activityService: AgentActivityService = new AgentActivityService(),
    options?: ExecutorOptions,
  ) {
    this.registry = registry;
    this.activityService = activityService;
    this.maxRetries = options?.maxRetries ?? 2;
  }

  /**
   * Executes all subtasks in an ExecutionPlan, resolving dependencies and executing ready tasks in parallel.
   */
  async executePlan(plan: ExecutionPlan, context: AgentContext): Promise<AgentSubTaskResult[]> {
    logger.info(`[AgentExecutorService] Starting execution of plan '${plan.id}' with ${plan.subtasks.length} subtasks`);

    const results: AgentSubTaskResult[] = [];
    const completedTaskIds = new Set<string>();
    const failedTaskIds = new Set<string>();

    const subtasks = [...plan.subtasks];

    while (completedTaskIds.size + failedTaskIds.size < subtasks.length) {
      // Find all subtasks that are PENDING and have all dependencies met
      const readyTasks = subtasks.filter((task) => {
        if (task.status !== 'PENDING') return false;
        const dependenciesMet = task.dependencies.every((depId) => completedTaskIds.has(depId));
        const dependencyFailed = task.dependencies.some((depId) => failedTaskIds.has(depId));
        return dependenciesMet && !dependencyFailed;
      });

      // Handle unresolvable tasks due to dependency failures
      if (readyTasks.length === 0) {
        const remainingPending = subtasks.filter((t) => t.status === 'PENDING');
        if (remainingPending.length > 0) {
          logger.warn(
            `[AgentExecutorService] ${remainingPending.length} subtasks blocked due to dependency failures. Marking as FAILED.`,
          );
          for (const task of remainingPending) {
            task.status = 'FAILED';
            task.error = 'Dependency failed';
            failedTaskIds.add(task.id);

            results.push({
              subtaskId: task.id,
              agentType: task.agentType,
              success: false,
              output: null,
              error: task.error,
              executedAt: new Date().toISOString(),
            });

            this.activityService.logActivity(
              context.userId,
              'SUBTASK_FAILED',
              { error: task.error },
              plan.id,
              task.id,
              task.agentType,
            );
          }
        }
        break;
      }

      // Execute ready tasks in parallel
      const waveResults = await Promise.all(
        readyTasks.map((task) => this.executeSubTaskWithRetry(task, context, plan.id)),
      );

      for (const res of waveResults) {
        results.push(res);
        if (res.success) {
          completedTaskIds.add(res.subtaskId);
        } else {
          failedTaskIds.add(res.subtaskId);
        }
      }
    }

    plan.updatedAt = new Date().toISOString();
    return results;
  }

  /**
   * Executes a single subtask with automatic retries on failure.
   */
  private async executeSubTaskWithRetry(
    task: SubTask,
    context: AgentContext,
    planId: string,
  ): Promise<AgentSubTaskResult> {
    task.status = 'RUNNING';
    this.activityService.logActivity(
      context.userId,
      'SUBTASK_STARTED',
      { title: task.title, description: task.description },
      planId,
      task.id,
      task.agentType,
    );

    let attempts = 0;
    let lastError = '';

    while (attempts <= this.maxRetries) {
      attempts++;
      try {
        const agent = this.registry.getAgent(task.agentType);
        const result = await agent.execute(task, context, context.userId);

        task.status = 'COMPLETED';
        task.result = result.output;
        context.subtaskResults[task.id] = result.output;

        this.activityService.logActivity(
          context.userId,
          'SUBTASK_COMPLETED',
          { success: true, toolsUsed: result.toolsUsed ?? [] },
          planId,
          task.id,
          task.agentType,
        );

        return result;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        task.retryCount = attempts;

        if (attempts <= this.maxRetries) {
          logger.warn(
            `[AgentExecutorService] Retry ${attempts}/${this.maxRetries} for subtask '${task.id}' (${task.agentType}): ${lastError}`,
          );
          this.activityService.logActivity(
            context.userId,
            'SUBTASK_RETRY',
            { attempt: attempts, maxRetries: this.maxRetries, error: lastError },
            planId,
            task.id,
            task.agentType,
          );
        }
      }
    }

    task.status = 'FAILED';
    task.error = lastError;

    this.activityService.logActivity(
      context.userId,
      'SUBTASK_FAILED',
      { error: lastError, attempts },
      planId,
      task.id,
      task.agentType,
    );

    return {
      subtaskId: task.id,
      agentType: task.agentType,
      success: false,
      output: null,
      error: lastError,
      executedAt: new Date().toISOString(),
    };
  }
}

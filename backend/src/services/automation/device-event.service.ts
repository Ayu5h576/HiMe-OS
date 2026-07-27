import { AutomationExecution } from '@prisma/client';
import { AutomationRepository } from '../../repositories/automation.repository';
import { ProjectService } from '../project.service';
import { TriggerEvaluatorService } from './trigger-evaluator.service';
import { ActionRunnerService } from './action-runner.service';
import { AutomationExecutionService } from './automation-execution.service';
import { DeviceEventInput, deviceEventSchema } from '../../schemas/automation.schema';

export class DeviceEventService {
  private automationRepository: AutomationRepository;
  private projectService: ProjectService;
  private actionRunnerService: ActionRunnerService;
  private executionService: AutomationExecutionService;

  constructor(
    automationRepository: AutomationRepository = new AutomationRepository(),
    projectService: ProjectService = new ProjectService(),
    actionRunnerService: ActionRunnerService = new ActionRunnerService(),
    executionService: AutomationExecutionService = new AutomationExecutionService(),
  ) {
    this.automationRepository = automationRepository;
    this.projectService = projectService;
    this.actionRunnerService = actionRunnerService;
    this.executionService = executionService;
  }

  async dispatchDeviceEvent(
    userId: string,
    projectId: string,
    eventPayload: DeviceEventInput,
  ): Promise<AutomationExecution[]> {
    // 1. Validate Project Ownership
    await this.projectService.getProjectById(userId, projectId);

    // 2. Validate Zod Schema
    const parsedEvent = deviceEventSchema.parse(eventPayload);

    // 3. Find matching automations in the project workspace
    const paginated = await this.automationRepository.findProjectAutomations(projectId, {
      enabled: true,
      triggerType: parsedEvent.eventType,
      page: 1,
      limit: 100,
    });

    const executions: AutomationExecution[] = [];

    for (const automation of paginated.data) {
      if (!automation.enabled) continue;

      const metadata = (automation.metadata as Record<string, unknown>) ?? {};
      const shouldTrigger = TriggerEvaluatorService.evaluate(automation, {
        triggerType: parsedEvent.eventType,
        value: parsedEvent.currentState ?? parsedEvent.batteryLevel ?? parsedEvent.error,
        targetValue: metadata.targetValue ?? metadata.expectedValue,
      });

      if (shouldTrigger) {
        const execution = await this.executionService.startExecution(
          automation.id,
          parsedEvent as unknown as Record<string, unknown>,
        );

        try {
          const output = await this.actionRunnerService.runAction(
            automation,
            userId,
            parsedEvent as unknown as Record<string, unknown>,
          );
          const successExecution = await this.executionService.recordSuccess(execution.id, output);
          executions.push(successExecution);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Execution failed';
          const failedExecution = await this.executionService.recordFailure(
            execution.id,
            errorMessage,
          );
          executions.push(failedExecution);
        }
      }
    }

    return executions;
  }
}

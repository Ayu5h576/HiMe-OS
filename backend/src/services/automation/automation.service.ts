import { Automation, AutomationExecution, TriggerType, Prisma } from '@prisma/client';
import { AutomationRepository } from '../../repositories/automation.repository';
import { ProjectService } from '../project.service';
import { SchedulerService } from './scheduler.service';
import { TriggerEvaluatorService } from './trigger-evaluator.service';
import { ActionRunnerService } from './action-runner.service';
import { AutomationExecutionService } from './automation-execution.service';
import {
  CreateAutomationInput,
  UpdateAutomationInput,
  GetAutomationsQueryInput,
} from '../../schemas/automation.schema';
import { PaginatedResult } from '../../repositories/memory.repository';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class AutomationService {
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

  async createAutomation(
    userId: string,
    projectId: string,
    data: CreateAutomationInput,
  ): Promise<Automation> {
    await this.projectService.getProjectById(userId, projectId);
    SchedulerService.validateSchedule(data.schedule);

    return this.automationRepository.create(data, projectId);
  }

  async getProjectAutomations(
    userId: string,
    projectId: string,
    query: GetAutomationsQueryInput,
  ): Promise<PaginatedResult<Automation>> {
    await this.projectService.getProjectById(userId, projectId);
    return this.automationRepository.findProjectAutomations(projectId, query);
  }

  async getAutomationById(userId: string, automationId: string): Promise<Automation> {
    const automation = await this.automationRepository.findById(automationId);
    if (!automation) {
      throw new NotFoundError('Automation rule not found');
    }

    await this.projectService.getProjectById(userId, automation.projectId);
    return automation;
  }

  async updateAutomation(
    userId: string,
    automationId: string,
    data: UpdateAutomationInput,
  ): Promise<Automation> {
    const automation = await this.getAutomationById(userId, automationId);

    if (data.schedule !== undefined) {
      SchedulerService.validateSchedule(data.schedule);
    }

    const updateData: Prisma.AutomationUpdateInput = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.triggerType ? { triggerType: data.triggerType } : {}),
      ...(data.conditionType ? { conditionType: data.conditionType } : {}),
      ...(data.actionType ? { actionType: data.actionType } : {}),
      ...(data.schedule !== undefined ? { schedule: data.schedule } : {}),
      ...(data.metadata !== undefined ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
    };

    return this.automationRepository.update(automation.id, updateData);
  }

  async deleteAutomation(userId: string, automationId: string): Promise<void> {
    const automation = await this.getAutomationById(userId, automationId);
    await this.automationRepository.delete(automation.id);
  }

  async runAutomation(
    userId: string,
    automationId: string,
    input?: Record<string, unknown>,
  ): Promise<AutomationExecution> {
    const automation = await this.getAutomationById(userId, automationId);

    if (!automation.enabled) {
      throw new BadRequestError(`Automation '${automation.name}' is disabled and cannot be run.`);
    }

    const shouldTrigger = TriggerEvaluatorService.evaluate(automation, {
      triggerType: TriggerType.MANUAL,
      ...(input || {}),
    });

    if (!shouldTrigger) {
      throw new BadRequestError(`Trigger evaluation failed for automation '${automation.name}'.`);
    }

    const execution = await this.executionService.startExecution(automation.id, input);

    try {
      const output = await this.actionRunnerService.runAction(automation, userId, input);
      return await this.executionService.recordSuccess(execution.id, output);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      await this.executionService.recordFailure(execution.id, errorMessage);
      throw err;
    }
  }

  async getAutomationExecutions(
    userId: string,
    automationId: string,
  ): Promise<AutomationExecution[]> {
    const automation = await this.getAutomationById(userId, automationId);
    return this.executionService.getExecutionsForAutomation(automation.id);
  }
}

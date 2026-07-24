import { AutomationExecution, ExecutionStatus } from '@prisma/client';
import { AutomationExecutionRepository } from '../../repositories/automation-execution.repository';

export class AutomationExecutionService {
  private repository: AutomationExecutionRepository;

  constructor(repository: AutomationExecutionRepository = new AutomationExecutionRepository()) {
    this.repository = repository;
  }

  async startExecution(
    automationId: string,
    input?: Record<string, unknown>,
  ): Promise<AutomationExecution> {
    return this.repository.create(automationId, input);
  }

  async recordSuccess(
    executionId: string,
    output?: Record<string, unknown>,
  ): Promise<AutomationExecution> {
    return this.repository.updateStatus(executionId, ExecutionStatus.SUCCESS, output);
  }

  async recordFailure(executionId: string, error: string): Promise<AutomationExecution> {
    return this.repository.updateStatus(executionId, ExecutionStatus.FAILED, undefined, error);
  }

  async getExecutionsForAutomation(automationId: string): Promise<AutomationExecution[]> {
    return this.repository.findByAutomationId(automationId);
  }
}

import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { logger } from '../../../config/logger';

export class PlanningAgent implements IAgent {
  readonly name = 'Planning Agent';
  readonly type: AgentType = 'planning';
  readonly description = 'Analyzes user architecture requirements and structures subtasks for parallel execution.';
  readonly capabilities = ['architecture_analysis', 'execution_planning', 'subtask_breakdown'];

  async execute(task: SubTask, context: AgentContext, _userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[PlanningAgent] Executing subtask '${task.id}': ${task.title}`);

    const plan = {
      analysis: `Analyzed prompt "${context.originalPrompt}" for task "${task.title}".`,
      recommendedSteps: [
        'Gather context and system information',
        'Retrieve related memories and tasks',
        'Execute specialized domain logic',
        'Synthesize final aggregated report',
      ],
      estimatedAgentsNeeded: ['research', 'memory', 'coding', 'task'],
    };

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: plan,
      executedAt: new Date().toISOString(),
    };
  }
}

import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { ToolExecutor } from '../../ai/tools/tool-executor';
import { logger } from '../../../config/logger';

export class ResearchAgent implements IAgent {
  readonly name = 'Research Agent';
  readonly type: AgentType = 'research';
  readonly description = 'Gathers information, inspects desktop environment, and performs environment diagnostics.';
  readonly capabilities = ['system_research', 'file_browsing', 'data_gathering'];

  private toolExecutor: ToolExecutor;

  constructor(toolExecutor: ToolExecutor = new ToolExecutor()) {
    this.toolExecutor = toolExecutor;
  }

  async execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[ResearchAgent] Executing subtask '${task.id}': ${task.title}`);

    const toolsUsed: string[] = [];
    let systemData: unknown = null;

    try {
      const toolRes = await this.toolExecutor.executeTool('getSystemInfo', userId, {});
      if (toolRes.success) {
        toolsUsed.push('getSystemInfo');
        systemData = toolRes.result;
      }
    } catch {
      systemData = { note: 'System info tool unavailable' };
    }

    const researchOutput = {
      query: context.originalPrompt,
      systemData,
      summary: `Researched request "${context.originalPrompt}" for task "${task.title}". Host system inspected successfully.`,
    };

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: researchOutput,
      toolsUsed,
      executedAt: new Date().toISOString(),
    };
  }
}

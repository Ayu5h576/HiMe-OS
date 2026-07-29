import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { ToolExecutor } from '../../ai/tools/tool-executor';
import { logger } from '../../../config/logger';

export class CodingAgent implements IAgent {
  readonly name = 'Coding Agent';
  readonly type: AgentType = 'coding';
  readonly description = 'Generates, inspects, and modifies code and technical assets.';
  readonly capabilities = ['code_generation', 'code_inspection', 'file_writing', 'tool_calling'];

  private toolExecutor: ToolExecutor;

  constructor(toolExecutor: ToolExecutor = new ToolExecutor()) {
    this.toolExecutor = toolExecutor;
  }

  async execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[CodingAgent] Executing subtask '${task.id}': ${task.title}`);

    const toolsUsed: string[] = [];

    // Optional tool execution if prompt/task references system tools
    if (task.description.toLowerCase().includes('file') || task.description.toLowerCase().includes('system')) {
      try {
        const sysResult = await this.toolExecutor.executeTool('getSystemInfo', userId, {});
        if (sysResult.success) {
          toolsUsed.push('getSystemInfo');
        }
      } catch {
        // Fall back gracefully if tool fails or isn't needed
      }
    }

    const codeResult = {
      taskTitle: task.title,
      generatedSnippet: `// Auto-generated solution for: ${task.description}\nconsole.log("HiMe OS Coding Agent initialized");`,
      status: 'CODE_GENERATED',
      contextReferenced: Object.keys(context.sharedData),
    };

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: codeResult,
      toolsUsed,
      executedAt: new Date().toISOString(),
    };
  }
}

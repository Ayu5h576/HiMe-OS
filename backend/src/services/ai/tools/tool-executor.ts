import { ToolRegistry } from './tool-registry';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { AppError } from '../../../utils/errors';

export class ToolExecutor {
  private registry: ToolRegistry;

  constructor(registry: ToolRegistry = ToolRegistry.getInstance()) {
    this.registry = registry;
  }

  async executeTool(toolName: string, userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const tool = this.registry.getTool(toolName);
      return await tool.execute(userId, params);
    } catch (err) {
      if (err instanceof AppError) {
        return ToolResponseFormatter.error(toolName, err.message);
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown tool execution error';
      return ToolResponseFormatter.error(toolName, errorMessage);
    }
  }
}

import { ITool, IToolDefinition } from './tool.interface';
import { NotFoundError } from '../../../utils/errors';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ITool> = new Map();

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  registerTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ITool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new NotFoundError(`Tool '${name}' is not registered in HiMe OS Tool Registry.`);
    }
    return tool;
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  listTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  getToolDefinitions(): IToolDefinition[] {
    return this.listTools().map((t) => t.getDefinition());
  }

  clear(): void {
    this.tools.clear();
  }
}

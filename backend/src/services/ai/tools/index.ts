import { ToolRegistry } from './tool-registry';
import { CreateTaskTool, UpdateTaskTool, DeleteTaskTool, ListTasksTool } from './task.tools';
import { CreateMemoryTool, SearchMemoryTool } from './memory.tools';
import { ListProjectsTool, GetProjectTool } from './project.tools';
import { CreateConversationTool, GetConversationTool } from './conversation.tools';
import { RunAutomationTool, ListAutomationsTool } from './automation.tools';

export * from './tool.interface';
export * from './tool-response';
export * from './tool-validator';
export * from './tool-registry';
export * from './tool-executor';
export * from './task.tools';
export * from './memory.tools';
export * from './project.tools';
export * from './conversation.tools';
export * from './automation.tools';

export function initializeSystemTools(
  registry: ToolRegistry = ToolRegistry.getInstance(),
): ToolRegistry {
  registry.registerTool(new CreateTaskTool());
  registry.registerTool(new UpdateTaskTool());
  registry.registerTool(new DeleteTaskTool());
  registry.registerTool(new ListTasksTool());

  registry.registerTool(new CreateMemoryTool());
  registry.registerTool(new SearchMemoryTool());

  registry.registerTool(new ListProjectsTool());
  registry.registerTool(new GetProjectTool());

  registry.registerTool(new CreateConversationTool());
  registry.registerTool(new GetConversationTool());

  registry.registerTool(new RunAutomationTool());
  registry.registerTool(new ListAutomationsTool());

  return registry;
}

initializeSystemTools();

import { ToolRegistry } from './tool-registry';
import { CreateTaskTool, UpdateTaskTool, DeleteTaskTool, ListTasksTool } from './task.tools';
import { CreateMemoryTool, SearchMemoryTool } from './memory.tools';
import { ListProjectsTool, GetProjectTool } from './project.tools';
import { CreateConversationTool, GetConversationTool } from './conversation.tools';
import { RunAutomationTool, ListAutomationsTool } from './automation.tools';
import {
  ListDevicesTool,
  GetDeviceTool,
  ConnectDeviceTool,
  DisconnectDeviceTool,
  TurnOnDeviceTool,
  TurnOffDeviceTool,
  SetBrightnessTool,
  SetTemperatureTool,
  LockDeviceTool,
  UnlockDeviceTool,
} from './device.tools';
import {
  GetSystemInfoTool,
  ListFilesTool,
  ReadFileTool,
  CopyFileTool,
  LaunchApplicationTool,
  GetClipboardTool,
  SetClipboardTool,
  TakeScreenshotTool,
} from './desktop.tools';
import {
  StartVoiceSessionTool,
  TranscribeAudioTool,
  SynthesizeSpeechTool,
} from './voice.tools';
import {
  AnalyzeImageTool,
  ExtractTextTool,
  DescribeSceneTool,
  DetectObjectsTool,
  ScanQRCodeTool,
  AnalyzeScreenshotTool,
} from './vision.tools';

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
export * from './device.tools';
export * from './desktop.tools';
export * from './voice.tools';
export * from './vision.tools';

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

  registry.registerTool(new ListDevicesTool());
  registry.registerTool(new GetDeviceTool());
  registry.registerTool(new ConnectDeviceTool());
  registry.registerTool(new DisconnectDeviceTool());
  registry.registerTool(new TurnOnDeviceTool());
  registry.registerTool(new TurnOffDeviceTool());
  registry.registerTool(new SetBrightnessTool());
  registry.registerTool(new SetTemperatureTool());
  registry.registerTool(new LockDeviceTool());
  registry.registerTool(new UnlockDeviceTool());

  // Desktop Agent Tools
  registry.registerTool(new GetSystemInfoTool());
  registry.registerTool(new ListFilesTool());
  registry.registerTool(new ReadFileTool());
  registry.registerTool(new CopyFileTool());
  registry.registerTool(new LaunchApplicationTool());
  registry.registerTool(new GetClipboardTool());
  registry.registerTool(new SetClipboardTool());
  registry.registerTool(new TakeScreenshotTool());

  // Voice Interface Tools
  registry.registerTool(new StartVoiceSessionTool());
  registry.registerTool(new TranscribeAudioTool());
  registry.registerTool(new SynthesizeSpeechTool());

  // Computer Vision Tools
  registry.registerTool(new AnalyzeImageTool());
  registry.registerTool(new ExtractTextTool());
  registry.registerTool(new DescribeSceneTool());
  registry.registerTool(new DetectObjectsTool());
  registry.registerTool(new ScanQRCodeTool());
  registry.registerTool(new AnalyzeScreenshotTool());

  return registry;
}

initializeSystemTools();

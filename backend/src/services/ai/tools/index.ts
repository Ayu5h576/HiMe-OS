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
import {
  OpenWebsiteTool,
  ClickElementTool,
  FillFormTool,
  ExtractDOMTool,
  TakeBrowserScreenshotTool,
  DownloadFileTool,
  UploadFileTool,
} from './browser.tools';
import {
  GetBatteryStatusTool,
  GetCpuUsageTool,
  GetRamUsageTool,
  GetRunningAppsTool,
  NativeLaunchAppTool,
  NativeCloseAppTool,
  LockComputerTool,
  ShutdownComputerTool,
  RestartComputerTool,
  SetVolumeTool,
  SetDesktopBrightnessTool,
  WatchFolderTool,
} from './runtime-agent.tools';

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
export * from './browser.tools';
export * from './runtime-agent.tools';

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

  // Browser Automation Tools
  registry.registerTool(new OpenWebsiteTool());
  registry.registerTool(new ClickElementTool());
  registry.registerTool(new FillFormTool());
  registry.registerTool(new ExtractDOMTool());
  registry.registerTool(new TakeBrowserScreenshotTool());
  registry.registerTool(new DownloadFileTool());
  registry.registerTool(new UploadFileTool());

  // Native Runtime Agent Tools
  registry.registerTool(new GetBatteryStatusTool());
  registry.registerTool(new GetCpuUsageTool());
  registry.registerTool(new GetRamUsageTool());
  registry.registerTool(new GetRunningAppsTool());
  registry.registerTool(new NativeLaunchAppTool());
  registry.registerTool(new NativeCloseAppTool());
  registry.registerTool(new LockComputerTool());
  registry.registerTool(new ShutdownComputerTool());
  registry.registerTool(new RestartComputerTool());
  registry.registerTool(new SetVolumeTool());
  registry.registerTool(new SetDesktopBrightnessTool());
  registry.registerTool(new WatchFolderTool());

  return registry;
}

initializeSystemTools();

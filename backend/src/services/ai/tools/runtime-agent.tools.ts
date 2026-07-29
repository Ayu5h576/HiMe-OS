import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { NativeRuntimeAgentService } from '../../runtime-agent/runtime-agent.service';

const defaultAgentService = new NativeRuntimeAgentService();

// ─────────────────────────────────────────────────────────────────────────────
// 1. GetBatteryStatusTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetBatteryStatusTool implements ITool {
  readonly name = 'getBatteryStatus';
  readonly description = 'Get native system battery percentage, charging state, and remaining runtime.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const battery = await this.agentService.getBatteryInfo();
      return ToolResponseFormatter.success(this.name, battery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GetCpuUsageTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetCpuUsageTool implements ITool {
  readonly name = 'getCpuUsage';
  readonly description = 'Get CPU model, core count, load averages, and current CPU usage percentage.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const cpu = await this.agentService.getCpuInfo();
      return ToolResponseFormatter.success(this.name, cpu);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GetRamUsageTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetRamUsageTool implements ITool {
  readonly name = 'getRamUsage';
  readonly description = 'Get system RAM memory total, free, used bytes, and percentage.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const ram = await this.agentService.getRamInfo();
      return ToolResponseFormatter.success(this.name, ram);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GetRunningAppsTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetRunningAppsTool implements ITool {
  readonly name = 'getRunningApps';
  readonly description = 'Get a list of currently active running processes and applications.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const procs = await this.agentService.getRunningProcesses();
      return ToolResponseFormatter.success(this.name, { processes: procs, count: procs.length });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NativeLaunchAppTool
// ─────────────────────────────────────────────────────────────────────────────

export class NativeLaunchAppTool implements ITool {
  readonly name = 'launchNativeApp';
  readonly description = 'Launch an allowlisted native application on the local desktop machine.';
  readonly parameterSchema = z.object({
    appName: z.string().min(1, 'appName is required'),
  });

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'Application executable name (e.g. notepad, calc, code, chrome)' },
        },
        required: ['appName'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const res = await this.agentService.launchApplication(validated.appName);
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NativeCloseAppTool
// ─────────────────────────────────────────────────────────────────────────────

export class NativeCloseAppTool implements ITool {
  readonly name = 'closeNativeApp';
  readonly description = 'Close or terminate a running application or process by name or PID.';
  readonly parameterSchema = z.object({
    target: z.string().min(1, 'Target app name or PID is required'),
  });

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Application name or PID to close' },
        },
        required: ['target'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const targetVal = /^\d+$/.test(validated.target) ? parseInt(validated.target, 10) : validated.target;
      const res = await this.agentService.closeApplication(targetVal);
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. LockComputerTool
// ─────────────────────────────────────────────────────────────────────────────

export class LockComputerTool implements ITool {
  readonly name = 'lockComputer';
  readonly description = 'Lock the local workstation for security.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const res = await this.agentService.executeCommand({ action: 'lock' });
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ShutdownComputerTool
// ─────────────────────────────────────────────────────────────────────────────

export class ShutdownComputerTool implements ITool {
  readonly name = 'shutdownComputer';
  readonly description = 'Initiate system shutdown sequence for local computer.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const res = await this.agentService.executeCommand({ action: 'shutdown' });
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. RestartComputerTool
// ─────────────────────────────────────────────────────────────────────────────

export class RestartComputerTool implements ITool {
  readonly name = 'restartComputer';
  readonly description = 'Initiate system restart sequence for local computer.';
  readonly parameterSchema = z.object({});

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, _params: unknown): Promise<IToolResponse> {
    try {
      const res = await this.agentService.executeCommand({ action: 'restart' });
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. SetVolumeTool
// ─────────────────────────────────────────────────────────────────────────────

export class SetVolumeTool implements ITool {
  readonly name = 'setVolume';
  readonly description = 'Adjust master audio volume level (0-100) or toggle mute state.';
  readonly parameterSchema = z.object({
    direction: z.enum(['up', 'down', 'mute']),
    value: z.number().optional(),
  });

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['up', 'down', 'mute'], description: 'Volume control action' },
          value: { type: 'number', description: 'Volume step or level (0-100)' },
        },
        required: ['direction'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const actionMap = { up: 'volume_up', down: 'volume_down', mute: 'mute' } as const;
      const res = await this.agentService.executeCommand({
        action: actionMap[validated.direction],
        value: validated.value,
      });
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. SetBrightnessTool
// ─────────────────────────────────────────────────────────────────────────────

export class SetBrightnessTool implements ITool {
  readonly name = 'setBrightness';
  readonly description = 'Adjust display brightness percentage (0-100).';
  readonly parameterSchema = z.object({
    value: z.number().min(0).max(100),
  });

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Target display brightness percentage (0-100)' },
        },
        required: ['value'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const res = await this.agentService.executeCommand({
        action: 'brightness',
        value: validated.value,
      });
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. WatchFolderTool
// ─────────────────────────────────────────────────────────────────────────────

export class WatchFolderTool implements ITool {
  readonly name = 'watchFolder';
  readonly description = 'Start or stop watching a local folder (Desktop, Downloads, Documents) for file events.';
  readonly parameterSchema = z.object({
    folder: z.string().min(1, 'Target folder name or path is required'),
    action: z.enum(['watch', 'unwatch']).default('watch'),
  });

  private agentService: NativeRuntimeAgentService;

  constructor(agentService: NativeRuntimeAgentService = defaultAgentService) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          folder: { type: 'string', description: 'Folder name or path (e.g. desktop, downloads, documents)' },
          action: { type: 'string', enum: ['watch', 'unwatch'], description: 'Watch action' },
        },
        required: ['folder'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const res =
        validated.action === 'unwatch'
          ? this.agentService.unwatchFolder(validated.folder)
          : this.agentService.watchFolder(validated.folder);
      return ToolResponseFormatter.success(this.name, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

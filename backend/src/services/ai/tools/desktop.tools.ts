import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { DesktopAgentService } from '../../desktop/desktop-agent.service';

const desktopAgent = new DesktopAgentService();

// ─────────────────────────────────────────────────────────────────────────────
// GetSystemInfoTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetSystemInfoTool implements ITool {
  readonly name = 'getSystemInfo';
  readonly description =
    'Retrieve host system information including OS, CPU, RAM, network interfaces, and uptime.';
  readonly parameterSchema = z.object({});

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      ToolValidator.validate(this.parameterSchema, params, this.name);
      const info = this.agentService.getSystemInfo();
      return ToolResponseFormatter.success(this.name, info);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ListFilesTool
// ─────────────────────────────────────────────────────────────────────────────

export class ListFilesTool implements ITool {
  readonly name = 'listFiles';
  readonly description =
    'List the contents of a directory within the scoped desktop filesystem.';
  readonly parameterSchema = z.object({
    path: z.string().default('.'),
  });

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path relative to desktop root. Defaults to "."' },
        },
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const entries = await this.agentService.listFiles(validated.path ?? '.');
      return ToolResponseFormatter.success(this.name, entries);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ReadFileTool
// ─────────────────────────────────────────────────────────────────────────────

export class ReadFileTool implements ITool {
  readonly name = 'readFile';
  readonly description =
    'Read the text content of a file within the scoped desktop filesystem (max 1 MB).';
  readonly parameterSchema = z.object({
    path: z.string().min(1, 'path is required'),
  });

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative file path within the desktop root' },
        },
        required: ['path'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.agentService.readFile(validated.path);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CopyFileTool
// ─────────────────────────────────────────────────────────────────────────────

export class CopyFileTool implements ITool {
  readonly name = 'copyFile';
  readonly description =
    'Copy a file from a source path to a destination path within the scoped filesystem.';
  readonly parameterSchema = z.object({
    source: z.string().min(1, 'source path is required'),
    destination: z.string().min(1, 'destination path is required'),
  });

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          source: { type: 'string', description: 'Source file path' },
          destination: { type: 'string', description: 'Destination file path' },
        },
        required: ['source', 'destination'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.agentService.copyFile(validated.source, validated.destination);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LaunchApplicationTool
// ─────────────────────────────────────────────────────────────────────────────

export class LaunchApplicationTool implements ITool {
  readonly name = 'launchApplication';
  readonly description =
    'Launch a desktop application by name. Only applications in the HiMe OS allowlist are permitted.';
  readonly parameterSchema = z.object({
    name: z.string().min(1, 'application name is required'),
  });

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Application name (e.g., "notepad", "calc", "code")',
          },
        },
        required: ['name'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.agentService.launchApplication(validated.name);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GetClipboardTool
// ─────────────────────────────────────────────────────────────────────────────

export class GetClipboardTool implements ITool {
  readonly name = 'getClipboard';
  readonly description = 'Read the current clipboard content from the HiMe OS clipboard service.';
  readonly parameterSchema = z.object({});

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = this.agentService.readClipboard();
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SetClipboardTool
// ─────────────────────────────────────────────────────────────────────────────

export class SetClipboardTool implements ITool {
  readonly name = 'setClipboard';
  readonly description = 'Write text content to the HiMe OS clipboard (max 10 KB).';
  readonly parameterSchema = z.object({
    content: z.string().min(1, 'content is required').max(10_000),
  });

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Text to write to the clipboard (max 10 KB)' },
        },
        required: ['content'],
      },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = this.agentService.writeClipboard(validated.content);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TakeScreenshotTool
// ─────────────────────────────────────────────────────────────────────────────

export class TakeScreenshotTool implements ITool {
  readonly name = 'takeScreenshot';
  readonly description =
    'Capture a screenshot of the full desktop. Returns metadata and base64 PNG data when a capture adapter is installed.';
  readonly parameterSchema = z.object({});

  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = desktopAgent) {
    this.agentService = agentService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: { type: 'object', properties: {} },
    };
  }

  async execute(_userId: string, params: unknown): Promise<IToolResponse> {
    try {
      ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.agentService.takeScreenshot();
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

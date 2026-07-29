import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { BrowserService } from '../../browser/browser.service';

const defaultBrowserService = new BrowserService();

// ─────────────────────────────────────────────────────────────────────────────
// OpenWebsiteTool
// ─────────────────────────────────────────────────────────────────────────────

export class OpenWebsiteTool implements ITool {
  readonly name = 'openWebsite';
  readonly description = 'Open a web browser session and navigate to a target website URL.';
  readonly parameterSchema = z.object({
    url: z.string().min(1, 'Target URL is required'),
    sessionId: z.string().optional(),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Target website URL (e.g. https://example.com)' },
          sessionId: { type: 'string', description: 'Optional existing browser session ID' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['url'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      let session;
      if (validated.sessionId) {
        session = await this.browserService.navigate(userId, validated.sessionId, validated.url, 'navigate', validated.provider);
      } else {
        session = await this.browserService.openSession(userId, validated.url, undefined, validated.provider);
      }
      return ToolResponseFormatter.success(this.name, session);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ClickElementTool
// ─────────────────────────────────────────────────────────────────────────────

export class ClickElementTool implements ITool {
  readonly name = 'clickElement';
  readonly description = 'Click an element or button on the web page using a CSS selector.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    selector: z.string().min(1, 'CSS selector is required'),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          selector: { type: 'string', description: 'CSS selector of target element to click' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId', 'selector'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.performAction(
        userId,
        validated.sessionId,
        { action: 'click', selector: validated.selector },
        validated.provider,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FillFormTool
// ─────────────────────────────────────────────────────────────────────────────

export class FillFormTool implements ITool {
  readonly name = 'fillForm';
  readonly description = 'Populate input fields and submit a web form.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    formSelector: z.string().optional(),
    fields: z.record(z.union([z.string(), z.boolean(), z.number()])),
    submit: z.boolean().default(true),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          formSelector: { type: 'string', description: 'Optional parent form CSS selector' },
          fields: { type: 'object', description: 'Key-value map of field names and input values' },
          submit: { type: 'boolean', description: 'Whether to automatically submit the form' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId', 'fields'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.fillForm(
        userId,
        validated.sessionId,
        {
          formSelector: validated.formSelector,
          fields: validated.fields,
          submit: validated.submit,
        },
        validated.provider,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ExtractDOMTool
// ─────────────────────────────────────────────────────────────────────────────

export class ExtractDOMTool implements ITool {
  readonly name = 'extractDOM';
  readonly description = 'Extract structured DOM metadata, headings, forms, links, and text content from a web page.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.extractDOM(userId, validated.sessionId, undefined, validated.provider);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TakeBrowserScreenshotTool
// ─────────────────────────────────────────────────────────────────────────────

export class TakeBrowserScreenshotTool implements ITool {
  readonly name = 'takeBrowserScreenshot';
  readonly description = 'Capture a visual screenshot of the current browser page, viewport, or element.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    type: z.enum(['full_page', 'viewport', 'element']).default('viewport'),
    selector: z.string().optional(),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          type: { type: 'string', enum: ['full_page', 'viewport', 'element'], description: 'Screenshot region type' },
          selector: { type: 'string', description: 'CSS selector if type is element' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.takeScreenshot(
        userId,
        validated.sessionId,
        { type: validated.type, selector: validated.selector },
        validated.provider,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DownloadFileTool
// ─────────────────────────────────────────────────────────────────────────────

export class DownloadFileTool implements ITool {
  readonly name = 'downloadFile';
  readonly description = 'Download a file from a URL using the active browser session.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    url: z.string().min(1, 'Download file URL is required'),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          url: { type: 'string', description: 'Target file download URL' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId', 'url'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.downloadFile(userId, validated.sessionId, validated.url, validated.provider);
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UploadFileTool
// ─────────────────────────────────────────────────────────────────────────────

export class UploadFileTool implements ITool {
  readonly name = 'uploadFile';
  readonly description = 'Upload a local disk file to an input[type="file"] element in the browser session.';
  readonly parameterSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    selector: z.string().min(1, 'File input CSS selector is required'),
    filePath: z.string().min(1, 'Local file path is required'),
    provider: z.string().optional(),
  });

  private browserService: BrowserService;

  constructor(browserService: BrowserService = defaultBrowserService) {
    this.browserService = browserService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: 'Active browser session ID' },
          selector: { type: 'string', description: 'CSS selector of target file input element' },
          filePath: { type: 'string', description: 'Path to local file' },
          provider: { type: 'string', description: 'Optional browser provider name' },
        },
        required: ['sessionId', 'selector', 'filePath'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.browserService.performAction(
        userId,
        validated.sessionId,
        { action: 'upload', selector: validated.selector, filePath: validated.filePath },
        validated.provider,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { VisionService } from '../../vision/vision.service';

const defaultVisionService = new VisionService();

// ─────────────────────────────────────────────────────────────────────────────
// AnalyzeImageTool
// ─────────────────────────────────────────────────────────────────────────────

export class AnalyzeImageTool implements ITool {
  readonly name = 'analyzeImage';
  readonly description = 'Perform complete multi-modal vision perception analysis on an image payload.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.analyzeImage(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
        undefined,
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
// ExtractTextTool
// ─────────────────────────────────────────────────────────────────────────────

export class ExtractTextTool implements ITool {
  readonly name = 'extractText';
  readonly description = 'Extract text and OCR transcription from document, whiteboard, receipt, or screen image.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    language: z.string().optional(),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          language: { type: 'string', description: 'Target language code' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.extractText(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
        { language: validated.language },
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
// DescribeSceneTool
// ─────────────────────────────────────────────────────────────────────────────

export class DescribeSceneTool implements ITool {
  readonly name = 'describeScene';
  readonly description = 'Generate structured scene description, environment context, and object relationships.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.describeScene(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
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
// DetectObjectsTool
// ─────────────────────────────────────────────────────────────────────────────

export class DetectObjectsTool implements ITool {
  readonly name = 'detectObjects';
  readonly description = 'Detect and locate physical or UI objects with bounding boxes and categories.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.detectObjects(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
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
// ScanQRCodeTool
// ─────────────────────────────────────────────────────────────────────────────

export class ScanQRCodeTool implements ITool {
  readonly name = 'scanQRCode';
  readonly description = 'Scan and decode QR codes or barcodes from an image.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.scanQR(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
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
// AnalyzeScreenshotTool
// ─────────────────────────────────────────────────────────────────────────────

export class AnalyzeScreenshotTool implements ITool {
  readonly name = 'analyzeScreenshot';
  readonly description = 'Analyze desktop screenshots, code editors, terminal output, and error dialogs.';
  readonly parameterSchema = z.object({
    imageData: z.string().min(1, 'imageData base64 string is required'),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
    provider: z.string().optional(),
  });

  private visionService: VisionService;

  constructor(visionService: VisionService = defaultVisionService) {
    this.visionService = visionService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          imageData: { type: 'string', description: 'Base64-encoded image string' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], description: 'Image format' },
          provider: { type: 'string', description: 'Optional vision provider name' },
        },
        required: ['imageData'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.visionService.analyzeScreenshot(
        userId,
        { data: validated.imageData, format: validated.format || 'png', encoding: 'base64' },
        validated.provider,
      );
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

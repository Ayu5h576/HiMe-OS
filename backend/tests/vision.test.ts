import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { VisionService } from '../src/services/vision/vision.service';
import { ImageService } from '../src/services/vision/image.service';
import { VisionProviderRegistry } from '../src/services/vision/provider-registry';
import { VisionActivityService } from '../src/services/vision/activity.service';
import { MockVisionProvider } from '../src/services/vision/providers/mock.provider';
import { ToolExecutor, initializeSystemTools, ToolRegistry } from '../src/services/ai/tools';
import { SupervisorAgentService } from '../src/services/agents/supervisor.service';
import { IVisionProvider, ImagePayload } from '../src/services/vision/provider.interface';

describe('Computer Vision Platform (Phase 22)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';

  let visionService: VisionService;
  let registry: VisionProviderRegistry;
  let toolExecutor: ToolExecutor;
  let sampleImagePayload: ImagePayload;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    toolExecutor = new ToolExecutor();
    registry = VisionProviderRegistry.getInstance();
    visionService = new VisionService();

    // Sample valid base64 1x1 pixel PNG
    sampleImagePayload = {
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      format: 'png',
      encoding: 'base64',
    };

    // Register test user & token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Vision Test User',
        email: `vision-user-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;
  });

  beforeEach(() => {
    VisionActivityService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Image Validation & Processing Pipeline
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. Image Validation & Processing Pipeline', () => {
    const imageService = new ImageService();

    it('should validate and process valid PNG image payload', () => {
      const processed = imageService.processImagePayload(sampleImagePayload);
      expect(processed.format).toBe('png');
      expect(processed.width).toBe(1920);
    });

    it('should normalize GIF format to PNG first frame abstraction', () => {
      const gifPayload: ImagePayload = {
        data: sampleImagePayload.data,
        format: 'gif',
        encoding: 'base64',
      };

      const processed = imageService.processImagePayload(gifPayload);
      expect(processed.format).toBe('png');
    });

    it('should reject unsupported image format with HTTP 400 error', () => {
      const invalidPayload: any = {
        data: 'validdata==',
        format: 'bmp',
        encoding: 'base64',
      };

      expect(() => imageService.processImagePayload(invalidPayload)).toThrow(/Unsupported image format/i);
    });

    it('should reject corrupted/empty image data string', () => {
      const emptyPayload: ImagePayload = {
        data: '   ',
        format: 'png',
        encoding: 'base64',
      };

      expect(() => imageService.processImagePayload(emptyPayload)).toThrow(/cannot be empty/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Vision Perception Features (OCR, Objects, Scene, QR, Screenshot)
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. Vision Perception Features', () => {
    it('should perform OCR transcription and extract text', async () => {
      const result = await visionService.extractText(userId, sampleImagePayload);
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.provider).toBe('mock');
    });

    it('should detect objects and return bounding boxes', async () => {
      const result = await visionService.detectObjects(userId, sampleImagePayload);
      expect(result.objects.length).toBeGreaterThan(0);
      expect(result.objects[0]).toHaveProperty('label');
      expect(result.objects[0]).toHaveProperty('boundingBox');
      expect(result.objects[0].boundingBox).toHaveProperty('ymin');
    });

    it('should describe scene environment and relationships', async () => {
      const result = await visionService.describeScene(userId, sampleImagePayload);
      expect(result.summary).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(Array.isArray(result.objects)).toBe(true);
    });

    it('should scan and decode QR code / barcode data', async () => {
      const result = await visionService.scanQR(userId, sampleImagePayload);
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('type');
    });

    it('should analyze screenshot for UI layout and code', async () => {
      const result = await visionService.analyzeScreenshot(userId, sampleImagePayload);
      expect(result.type).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should perform comprehensive multi-modal analysis via analyzeImage', async () => {
      const result = await visionService.analyzeImage(userId, sampleImagePayload);
      expect(result).toHaveProperty('ocr');
      expect(result).toHaveProperty('objects');
      expect(result).toHaveProperty('scene');
      expect(result).toHaveProperty('screenshot');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Vision Provider Registry
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. Vision Provider Registry', () => {
    it('should list registered vision providers', () => {
      const providers = registry.listProviders();
      expect(providers.length).toBeGreaterThan(0);
      expect(providers[0].name).toBe('mock');
    });

    it('should allow registering a custom vision provider dynamically', async () => {
      const customProvider: IVisionProvider = {
        name: 'custom-vision',
        displayName: 'Custom Vision Perception Engine',
        isAvailable: true,
        analyze: async () => ({ provider: 'custom-vision', analyzedAt: new Date().toISOString() }),
        ocr: async () => ({
          text: 'Custom OCR output',
          confidence: 0.99,
          language: 'en',
          wordCount: 3,
          lines: ['Custom OCR output'],
          provider: 'custom-vision',
          processedAt: new Date().toISOString(),
        }),
        detectObjects: async () => ({ objects: [], count: 0, provider: 'custom-vision', processedAt: new Date().toISOString() }),
        describeScene: async () => ({
          summary: 'Custom scene',
          environment: 'indoor',
          objects: [],
          relationships: [],
          peopleCount: 0,
          dominantColors: [],
          textDetected: false,
          provider: 'custom-vision',
          processedAt: new Date().toISOString(),
        }),
        scanQR: async () => ({ content: '', type: 'unknown', format: 'none', provider: 'custom-vision', processedAt: new Date().toISOString() }),
        analyzeScreenshot: async () => ({
          type: 'desktop',
          summary: 'Custom screenshot',
          detectedText: '',
          uiElements: [],
          errorDetected: false,
          provider: 'custom-vision',
          processedAt: new Date().toISOString(),
        }),
      };

      registry.registerProvider(customProvider);
      expect(registry.hasProvider('custom-vision')).toBe(true);

      const ocrRes = await visionService.extractText(userId, sampleImagePayload, undefined, 'custom-vision');
      expect(ocrRes.text).toBe('Custom OCR output');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Tool Calling Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. Tool Calling Framework Integration', () => {
    it('should register all 6 vision tools in ToolRegistry', () => {
      const toolReg = ToolRegistry.getInstance();
      expect(toolReg.hasTool('analyzeImage')).toBe(true);
      expect(toolReg.hasTool('extractText')).toBe(true);
      expect(toolReg.hasTool('describeScene')).toBe(true);
      expect(toolReg.hasTool('detectObjects')).toBe(true);
      expect(toolReg.hasTool('scanQRCode')).toBe(true);
      expect(toolReg.hasTool('analyzeScreenshot')).toBe(true);
    });

    it('should execute extractText tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('extractText', userId, {
        imageData: sampleImagePayload.data,
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('text');
    });

    it('should execute analyzeScreenshot tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('analyzeScreenshot', userId, {
        imageData: sampleImagePayload.data,
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('summary');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Multi-Agent Framework Vision Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. Multi-Agent Framework Integration', () => {
    it('should allow SupervisorAgent to execute multi-agent orchestration for vision prompts', async () => {
      const supervisor = new SupervisorAgentService();
      const orchestration = await supervisor.executeOrchestration({
        userId,
        prompt: 'Inspect system info and analyze screenshot image data',
      });

      expect(orchestration.subtaskResults.length).toBeGreaterThan(0);
      expect(orchestration.aggregatedResult).toContain('Multi-Agent Orchestration Summary');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. HTTP API Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. HTTP API Endpoints', () => {
    it('POST /vision/analyze should perform full vision perception analysis', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/vision/analyze',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { image: sampleImagePayload },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('ocr');
      expect(body.data).toHaveProperty('objects');
    });

    it('POST /vision/ocr should return extracted text', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/vision/ocr',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { image: sampleImagePayload },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('text');
    });

    it('POST /vision/objects should return detected objects', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/vision/objects',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { image: sampleImagePayload },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('objects');
    });

    it('POST /vision/scene should return scene description', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/vision/scene',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { image: sampleImagePayload },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('summary');
    });

    it('POST /vision/screenshot should return screenshot analysis', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/vision/screenshot',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { image: sampleImagePayload },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('type');
    });

    it('GET /vision/providers should list vision providers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/vision/providers',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/vision/providers',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

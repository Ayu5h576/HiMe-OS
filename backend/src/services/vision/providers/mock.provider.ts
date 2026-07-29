import {
  IVisionProvider,
  ImagePayload,
  VisionAnalysisOptions,
  VisionAnalysisResult,
  OCRResult,
  OCROptions,
  ObjectDetectionResult,
  SceneDescriptionResult,
  QRScanResult,
  ScreenshotAnalysisResult,
} from '../provider.interface';
import { logger } from '../../../config/logger';

export class MockVisionProvider implements IVisionProvider {
  readonly name = 'mock';
  readonly displayName = 'HiMe OS Mock Vision Provider (Development)';
  readonly isAvailable = true;

  async analyze(image: ImagePayload, options?: VisionAnalysisOptions): Promise<VisionAnalysisResult> {
    logger.debug(`[MockVisionProvider] Analyzing image payload (${image.format}, ${image.data.length} chars)`);

    const opt = options ?? {
      includeOCR: true,
      includeObjects: true,
      includeScene: true,
      includeQR: true,
      includeScreenshot: true,
    };

    const now = new Date().toISOString();

    return {
      ocr: opt.includeOCR !== false ? await this.ocr(image) : undefined,
      objects: opt.includeObjects !== false ? await this.detectObjects(image) : undefined,
      scene: opt.includeScene !== false ? await this.describeScene(image) : undefined,
      qr: opt.includeQR !== false ? await this.scanQR(image) : undefined,
      screenshot: opt.includeScreenshot !== false ? await this.analyzeScreenshot(image) : undefined,
      provider: this.name,
      analyzedAt: now,
    };
  }

  async ocr(image: ImagePayload, options?: OCROptions): Promise<OCRResult> {
    logger.debug(`[MockVisionProvider] Performing OCR transcription`);

    const lang = options?.language ?? 'en';
    const dataHash = image.data.length;

    // Generate deterministic mock text based on image payload hash
    const textSamples = [
      'HiMe OS Vision System Online.\nStatus: 200 OK\nAll modules operational.',
      'INVOICE #1042\nTotal: $149.99\nDate: 2026-07-29\nStatus: PAID',
      'Meeting Notes:\n1. Architecture review\n2. Sub-agent coordination\n3. Vision platform integration',
      'TypeError: Cannot read properties of undefined (reading \'id\')\n  at Controller.handle (server.ts:42)',
    ];

    const sample = textSamples[dataHash % textSamples.length];
    const lines = sample.split('\n');

    return {
      text: sample,
      confidence: 0.98,
      language: lang,
      wordCount: sample.split(/\s+/).length,
      lines,
      provider: this.name,
      processedAt: new Date().toISOString(),
    };
  }

  async detectObjects(image: ImagePayload): Promise<ObjectDetectionResult> {
    logger.debug(`[MockVisionProvider] Detecting objects in image`);

    const dataHash = image.data.length;
    const count = (dataHash % 3) + 1;

    const mockObjects = [
      {
        label: 'Monitor',
        confidence: 0.96,
        boundingBox: { ymin: 0.1, xmin: 0.15, ymax: 0.7, xmax: 0.85 },
        category: 'electronics',
      },
      {
        label: 'Keyboard',
        confidence: 0.94,
        boundingBox: { ymin: 0.72, xmin: 0.2, ymax: 0.9, xmax: 0.8 },
        category: 'electronics',
      },
      {
        label: 'Coffee Cup',
        confidence: 0.89,
        boundingBox: { ymin: 0.65, xmin: 0.82, ymax: 0.85, xmax: 0.95 },
        category: 'container',
      },
    ];

    const detected = mockObjects.slice(0, count);

    return {
      objects: detected,
      count: detected.length,
      provider: this.name,
      processedAt: new Date().toISOString(),
    };
  }

  async describeScene(image: ImagePayload): Promise<SceneDescriptionResult> {
    logger.debug(`[MockVisionProvider] Generating scene description`);

    const isDesktop = image.filename?.includes('screenshot') || image.data.length > 500;

    return {
      summary: isDesktop
        ? 'A modern developer desktop workspace displaying a code editor, terminal output, and system health status.'
        : 'An organized indoor workspace environment containing office equipment and notes.',
      environment: isDesktop ? 'desktop' : 'indoor',
      objects: ['laptop', 'monitor', 'keyboard', 'notes', 'desk'],
      relationships: [
        'Keyboard is situated in front of the primary display monitor',
        'Coffee cup is placed on the right side of the desk workspace',
      ],
      peopleCount: 0,
      dominantColors: ['#1e1e1e', '#007acc', '#ffffff'],
      textDetected: true,
      provider: this.name,
      processedAt: new Date().toISOString(),
    };
  }

  async scanQR(image: ImagePayload): Promise<QRScanResult> {
    logger.debug(`[MockVisionProvider] Scanning image for QR / Barcodes`);

    const dataHash = image.data.length;
    const hasQR = dataHash % 2 === 0;

    if (!hasQR) {
      return {
        content: '',
        type: 'unknown',
        format: 'none',
        provider: this.name,
        processedAt: new Date().toISOString(),
      };
    }

    return {
      content: 'https://github.com/Ayu5h576/HiMe-OS',
      type: 'qr',
      format: 'QR_CODE',
      boundingBox: { ymin: 0.3, xmin: 0.3, ymax: 0.6, xmax: 0.6 },
      provider: this.name,
      processedAt: new Date().toISOString(),
    };
  }

  async analyzeScreenshot(image: ImagePayload): Promise<ScreenshotAnalysisResult> {
    logger.debug(`[MockVisionProvider] Analyzing screenshot payload`);

    const isCode = image.data.length % 2 === 0;

    return {
      type: isCode ? 'code' : 'desktop',
      summary: isCode
        ? 'VS Code workspace displaying TypeScript backend controller code with active linter output.'
        : 'Windows desktop session showing running applications and system tray metrics.',
      detectedText: 'import { FastifyRequest } from \'fastify\';\nexport class VisionController { ... }',
      uiElements: ['editor_window', 'sidebar_tree', 'integrated_terminal', 'status_bar'],
      errorDetected: false,
      provider: this.name,
      processedAt: new Date().toISOString(),
    };
  }
}

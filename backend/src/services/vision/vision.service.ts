import { ImageService } from './image.service';
import { VisionProviderRegistry } from './provider-registry';
import { OCRService } from './ocr.service';
import { ObjectDetectionService } from './object-detection.service';
import { SceneService } from './scene.service';
import { QRService } from './qr.service';
import { VisionScreenshotService } from './screenshot.service';
import { VisionActivityService, VisionActivityLog } from './activity.service';
import { MockVisionProvider } from './providers/mock.provider';
import {
  ImagePayload,
  VisionAnalysisOptions,
  VisionAnalysisResult,
  OCRResult,
  OCROptions,
  ObjectDetectionResult,
  SceneDescriptionResult,
  QRScanResult,
  ScreenshotAnalysisResult,
  VisionProviderInfo,
} from './provider.interface';
import { logger } from '../../config/logger';

export class VisionService {
  private imageService: ImageService;
  private registry: VisionProviderRegistry;
  private ocrService: OCRService;
  private objectDetectionService: ObjectDetectionService;
  private sceneService: SceneService;
  private qrService: QRService;
  private screenshotService: VisionScreenshotService;
  private activityService: VisionActivityService;

  constructor(
    imageService: ImageService = new ImageService(),
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    ocrService: OCRService = new OCRService(),
    objectDetectionService: ObjectDetectionService = new ObjectDetectionService(),
    sceneService: SceneService = new SceneService(),
    qrService: QRService = new QRService(),
    screenshotService: VisionScreenshotService = new VisionScreenshotService(),
    activityService: VisionActivityService = new VisionActivityService(),
  ) {
    this.imageService = imageService;
    this.registry = registry;
    this.ocrService = ocrService;
    this.objectDetectionService = objectDetectionService;
    this.sceneService = sceneService;
    this.qrService = qrService;
    this.screenshotService = screenshotService;
    this.activityService = activityService;

    // Register default mock vision provider if registry is empty
    if (this.registry.listProviders().length === 0) {
      this.registry.registerProvider(new MockVisionProvider(), true);
    }
  }

  // ── Provider Listing ──────────────────────────────────────────────────────

  getProviders(): VisionProviderInfo[] {
    return this.registry.listProviders();
  }

  // ── Vision Operations ─────────────────────────────────────────────────────

  async analyzeImage(
    userId: string,
    payload: ImagePayload,
    options?: VisionAnalysisOptions,
    providerName?: string,
  ): Promise<VisionAnalysisResult> {
    logger.info(`[VisionService] Analyzing image payload for user '${userId}'`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    const result = await provider.analyze(processed, options);

    this.activityService.logActivity(userId, 'ANALYZE', result.provider, {
      format: processed.format,
      hasOCR: !!result.ocr,
      objectCount: result.objects?.count ?? 0,
    });

    return result;
  }

  async extractText(
    userId: string,
    payload: ImagePayload,
    options?: OCROptions,
    providerName?: string,
  ): Promise<OCRResult> {
    logger.info(`[VisionService] Extracting text for user '${userId}'`);
    const result = await this.ocrService.extractText(payload, options, providerName);

    this.activityService.logActivity(userId, 'OCR', result.provider, {
      wordCount: result.wordCount,
      confidence: result.confidence,
    });

    return result;
  }

  async detectObjects(
    userId: string,
    payload: ImagePayload,
    providerName?: string,
  ): Promise<ObjectDetectionResult> {
    logger.info(`[VisionService] Detecting objects for user '${userId}'`);
    const result = await this.objectDetectionService.detectObjects(payload, providerName);

    this.activityService.logActivity(userId, 'DETECT_OBJECTS', result.provider, {
      count: result.count,
    });

    return result;
  }

  async describeScene(
    userId: string,
    payload: ImagePayload,
    providerName?: string,
  ): Promise<SceneDescriptionResult> {
    logger.info(`[VisionService] Describing scene for user '${userId}'`);
    const result = await this.sceneService.describeScene(payload, providerName);

    this.activityService.logActivity(userId, 'DESCRIBE_SCENE', result.provider, {
      environment: result.environment,
      peopleCount: result.peopleCount,
    });

    return result;
  }

  async scanQR(
    userId: string,
    payload: ImagePayload,
    providerName?: string,
  ): Promise<QRScanResult> {
    logger.info(`[VisionService] Scanning QR / Barcode for user '${userId}'`);
    const result = await this.qrService.scanQR(payload, providerName);

    this.activityService.logActivity(userId, 'SCAN_QR', result.provider, {
      type: result.type,
      found: result.type !== 'unknown',
    });

    return result;
  }

  async analyzeScreenshot(
    userId: string,
    payload: ImagePayload,
    providerName?: string,
  ): Promise<ScreenshotAnalysisResult> {
    logger.info(`[VisionService] Analyzing screenshot for user '${userId}'`);
    const result = await this.screenshotService.analyzeScreenshot(payload, providerName);

    this.activityService.logActivity(userId, 'ANALYZE_SCREENSHOT', result.provider, {
      type: result.type,
      errorDetected: result.errorDetected,
    });

    return result;
  }

  getLogs(userId: string, limit?: number): VisionActivityLog[] {
    return this.activityService.getLogs(userId, limit);
  }
}

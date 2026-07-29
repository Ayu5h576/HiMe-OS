import { ImagePayload, ScreenshotAnalysisResult } from './provider.interface';
import { VisionProviderRegistry } from './provider-registry';
import { ImageService } from './image.service';
import { logger } from '../../config/logger';

export class VisionScreenshotService {
  private registry: VisionProviderRegistry;
  private imageService: ImageService;

  constructor(
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    imageService: ImageService = new ImageService(),
  ) {
    this.registry = registry;
    this.imageService = imageService;
  }

  async analyzeScreenshot(payload: ImagePayload, providerName?: string): Promise<ScreenshotAnalysisResult> {
    logger.debug(`[VisionScreenshotService] Analyzing screenshot payload for code, errors, and UI layout`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    return provider.analyzeScreenshot(processed);
  }
}

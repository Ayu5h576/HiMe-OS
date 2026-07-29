import { ImagePayload, OCRResult, OCROptions } from './provider.interface';
import { VisionProviderRegistry } from './provider-registry';
import { ImageService } from './image.service';
import { logger } from '../../config/logger';

export class OCRService {
  private registry: VisionProviderRegistry;
  private imageService: ImageService;

  constructor(
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    imageService: ImageService = new ImageService(),
  ) {
    this.registry = registry;
    this.imageService = imageService;
  }

  async extractText(
    payload: ImagePayload,
    options?: OCROptions,
    providerName?: string,
  ): Promise<OCRResult> {
    logger.debug(`[OCRService] Extracting text from image payload`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    return provider.ocr(processed, options);
  }
}

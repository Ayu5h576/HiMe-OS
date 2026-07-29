import { ImagePayload, ObjectDetectionResult } from './provider.interface';
import { VisionProviderRegistry } from './provider-registry';
import { ImageService } from './image.service';
import { logger } from '../../config/logger';

export class ObjectDetectionService {
  private registry: VisionProviderRegistry;
  private imageService: ImageService;

  constructor(
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    imageService: ImageService = new ImageService(),
  ) {
    this.registry = registry;
    this.imageService = imageService;
  }

  async detectObjects(payload: ImagePayload, providerName?: string): Promise<ObjectDetectionResult> {
    logger.debug(`[ObjectDetectionService] Detecting objects in image payload`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    return provider.detectObjects(processed);
  }
}

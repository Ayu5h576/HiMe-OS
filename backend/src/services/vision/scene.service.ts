import { ImagePayload, SceneDescriptionResult } from './provider.interface';
import { VisionProviderRegistry } from './provider-registry';
import { ImageService } from './image.service';
import { logger } from '../../config/logger';

export class SceneService {
  private registry: VisionProviderRegistry;
  private imageService: ImageService;

  constructor(
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    imageService: ImageService = new ImageService(),
  ) {
    this.registry = registry;
    this.imageService = imageService;
  }

  async describeScene(payload: ImagePayload, providerName?: string): Promise<SceneDescriptionResult> {
    logger.debug(`[SceneService] Generating scene description for image payload`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    return provider.describeScene(processed);
  }
}

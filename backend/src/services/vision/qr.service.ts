import { ImagePayload, QRScanResult } from './provider.interface';
import { VisionProviderRegistry } from './provider-registry';
import { ImageService } from './image.service';
import { logger } from '../../config/logger';

export class QRService {
  private registry: VisionProviderRegistry;
  private imageService: ImageService;

  constructor(
    registry: VisionProviderRegistry = VisionProviderRegistry.getInstance(),
    imageService: ImageService = new ImageService(),
  ) {
    this.registry = registry;
    this.imageService = imageService;
  }

  async scanQR(payload: ImagePayload, providerName?: string): Promise<QRScanResult> {
    logger.debug(`[QRService] Scanning image payload for QR/Barcode data`);
    const processed = this.imageService.processImagePayload(payload);
    const provider = this.registry.getProvider(providerName);
    return provider.scanQR(processed);
  }
}

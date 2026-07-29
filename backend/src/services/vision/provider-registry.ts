import { IVisionProvider, VisionProviderInfo } from './provider.interface';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

export class VisionProviderRegistry {
  private static instance: VisionProviderRegistry;
  private providers: Map<string, IVisionProvider> = new Map();
  private defaultProviderName: string | null = null;

  static getInstance(): VisionProviderRegistry {
    if (!VisionProviderRegistry.instance) {
      VisionProviderRegistry.instance = new VisionProviderRegistry();
    }
    return VisionProviderRegistry.instance;
  }

  registerProvider(provider: IVisionProvider, setAsDefault = false): void {
    logger.info(`[VisionProviderRegistry] Registering vision provider: ${provider.name}`);
    this.providers.set(provider.name, provider);

    if (setAsDefault || this.defaultProviderName === null) {
      this.defaultProviderName = provider.name;
    }
  }

  getProvider(name?: string): IVisionProvider {
    const resolvedName = name ?? this.defaultProviderName;
    if (!resolvedName) {
      throw new BadRequestError('No vision provider is registered in VisionProviderRegistry.');
    }

    const provider = this.providers.get(resolvedName);
    if (!provider) {
      throw new NotFoundError(
        `Vision provider '${resolvedName}' is not registered. Available: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  listProviders(): VisionProviderInfo[] {
    return Array.from(this.providers.values()).map((provider) => ({
      name: provider.name,
      displayName: provider.displayName,
      isAvailable: provider.isAvailable,
      capabilities: ['ocr', 'object_detection', 'scene_description', 'qr_code', 'screenshot_analysis'],
    }));
  }

  getDefaultProviderName(): string | null {
    return this.defaultProviderName;
  }

  clear(): void {
    this.providers.clear();
    this.defaultProviderName = null;
  }
}

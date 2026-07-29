import { IBrowserProvider, BrowserProviderInfo } from './provider.interface';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

export class BrowserProviderRegistry {
  private static instance: BrowserProviderRegistry;
  private providers: Map<string, IBrowserProvider> = new Map();
  private defaultProviderName: string | null = null;

  static getInstance(): BrowserProviderRegistry {
    if (!BrowserProviderRegistry.instance) {
      BrowserProviderRegistry.instance = new BrowserProviderRegistry();
    }
    return BrowserProviderRegistry.instance;
  }

  registerProvider(provider: IBrowserProvider, setAsDefault = false): void {
    logger.info(`[BrowserProviderRegistry] Registering browser provider: ${provider.name}`);
    this.providers.set(provider.name, provider);

    if (setAsDefault || this.defaultProviderName === null) {
      this.defaultProviderName = provider.name;
    }
  }

  getProvider(name?: string): IBrowserProvider {
    const resolvedName = name ?? this.defaultProviderName;
    if (!resolvedName) {
      throw new BadRequestError('No browser provider is registered in BrowserProviderRegistry.');
    }

    const provider = this.providers.get(resolvedName);
    if (!provider) {
      throw new NotFoundError(
        `Browser provider '${resolvedName}' is not registered. Available: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  listProviders(): BrowserProviderInfo[] {
    return Array.from(this.providers.values()).map((provider) => ({
      name: provider.name,
      displayName: provider.displayName,
      isAvailable: provider.isAvailable,
      capabilities: [
        'navigation',
        'dom_extraction',
        'form_automation',
        'screenshot_capture',
        'cookie_management',
        'file_download',
        'file_upload',
      ],
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

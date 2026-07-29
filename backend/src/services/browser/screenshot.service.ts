import { BrowserScreenshotOptions, BrowserScreenshotResult } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class BrowserScreenshotService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async takeScreenshot(
    sessionId: string,
    options?: BrowserScreenshotOptions,
    providerName?: string,
  ): Promise<BrowserScreenshotResult> {
    logger.debug(`[BrowserScreenshotService] Capturing ${options?.type ?? 'viewport'} screenshot for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.takeScreenshot(sessionId, options);
  }
}

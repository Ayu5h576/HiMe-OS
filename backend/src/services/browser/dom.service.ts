import { DOMExtractionOptions, DOMExtractionResult } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class DOMService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async extractDOM(
    sessionId: string,
    options?: DOMExtractionOptions,
    providerName?: string,
  ): Promise<DOMExtractionResult> {
    logger.debug(`[DOMService] Extracting DOM structure for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.extractDOM(sessionId, options);
  }
}

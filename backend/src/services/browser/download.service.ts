import { DownloadRecord } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class DownloadService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async downloadFile(
    sessionId: string,
    url: string,
    providerName?: string,
  ): Promise<DownloadRecord> {
    logger.debug(`[DownloadService] Downloading file from ${url} in session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.downloadFile(sessionId, url);
  }
}

import { BrowserSessionState, NavigationAction } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

export class BrowserNavigationService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async navigate(
    sessionId: string,
    url: string,
    action: NavigationAction = 'navigate',
    providerName?: string,
  ): Promise<BrowserSessionState> {
    if (action === 'navigate' || action === 'open') {
      this.validateUrl(url);
    }

    logger.debug(`[BrowserNavigationService] Action '${action}' on ${url} for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.navigate(sessionId, url, action);
  }

  private validateUrl(url: string): void {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new BadRequestError('Target URL string is required.');
    }
    if (url !== 'about:blank' && !url.startsWith('http://') && !url.startsWith('https://')) {
      throw new BadRequestError(`Invalid URL '${url}'. Must begin with 'http://' or 'https://'.`);
    }
  }
}

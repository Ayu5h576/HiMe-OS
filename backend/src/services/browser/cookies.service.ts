import { BrowserCookie } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class CookieService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async getCookies(sessionId: string, providerName?: string): Promise<BrowserCookie[]> {
    logger.debug(`[CookieService] Reading cookies for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.getCookies(sessionId);
  }

  async setCookies(sessionId: string, cookies: BrowserCookie[], providerName?: string): Promise<void> {
    logger.debug(`[CookieService] Storing ${cookies.length} cookies for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.setCookies(sessionId, cookies);
  }

  async clearCookies(sessionId: string, providerName?: string): Promise<void> {
    logger.debug(`[CookieService] Clearing cookies for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.clearCookies(sessionId);
  }
}

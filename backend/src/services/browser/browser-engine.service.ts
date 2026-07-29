import { ElementActionPayload, BrowserSessionState } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class BrowserEngineService {
  private registry: BrowserProviderRegistry;

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async performAction(
    sessionId: string,
    payload: ElementActionPayload,
    providerName?: string,
  ): Promise<{ success: boolean; message: string; state: BrowserSessionState }> {
    logger.debug(`[BrowserEngineService] Executing action '${payload.action}' for session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    return provider.performAction(sessionId, payload);
  }
}

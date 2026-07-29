import { BrowserSessionOptions, BrowserSessionState } from './provider.interface';
import { BrowserProviderRegistry } from './provider-registry';
import { logger } from '../../config/logger';

export class BrowserSessionService {
  private registry: BrowserProviderRegistry;
  private activeSessions: Map<string, BrowserSessionState> = new Map();

  constructor(registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance()) {
    this.registry = registry;
  }

  async createSession(
    userId: string,
    options?: BrowserSessionOptions,
    providerName?: string,
  ): Promise<BrowserSessionState> {
    logger.info(`[BrowserSessionService] Creating new session for user ${userId}`);
    const provider = this.registry.getProvider(providerName);
    const session = await provider.createSession(userId, options);
    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  async closeSession(sessionId: string, providerName?: string): Promise<void> {
    logger.info(`[BrowserSessionService] Closing session ${sessionId}`);
    const provider = this.registry.getProvider(providerName);
    await provider.closeSession(sessionId);
    this.activeSessions.delete(sessionId);
  }

  async getSession(sessionId: string, providerName?: string): Promise<BrowserSessionState | null> {
    const provider = this.registry.getProvider(providerName);
    const state = await provider.getSession(sessionId);
    if (state) {
      this.activeSessions.set(sessionId, state);
    }
    return state;
  }

  getUserSessions(userId: string): BrowserSessionState[] {
    return Array.from(this.activeSessions.values()).filter((s) => s.userId === userId && s.status === 'active');
  }
}

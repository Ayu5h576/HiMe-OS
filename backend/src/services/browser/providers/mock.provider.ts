import {
  IBrowserProvider,
  BrowserSessionOptions,
  BrowserSessionState,
  NavigationAction,
  ElementActionPayload,
  DOMExtractionOptions,
  DOMExtractionResult,
  BrowserScreenshotOptions,
  BrowserScreenshotResult,
  BrowserCookie,
  DownloadRecord,
} from '../provider.interface';
import { NotFoundError } from '../../../utils/errors';
import { logger } from '../../../config/logger';

export class MockBrowserProvider implements IBrowserProvider {
  readonly name = 'mock';
  readonly displayName = 'HiMe OS Mock Browser Provider (Development)';
  readonly isAvailable = true;

  private sessions: Map<string, BrowserSessionState> = new Map();
  private cookiesStore: Map<string, BrowserCookie[]> = new Map();
  private historyStore: Map<string, string[]> = new Map();

  async createSession(userId: string, options?: BrowserSessionOptions): Promise<BrowserSessionState> {
    const sessionId = `browsess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const state: BrowserSessionState = {
      sessionId,
      userId,
      currentUrl: 'about:blank',
      pageTitle: 'New Tab',
      status: 'active',
      viewport: options?.viewport ?? { width: 1280, height: 800 },
      userAgent: options?.userAgent ?? 'HiMe-OS-BrowserAgent/1.0 (Headless)',
      createdAt: now,
      lastActiveAt: now,
    };

    this.sessions.set(sessionId, state);
    this.cookiesStore.set(sessionId, options?.cookies ?? []);
    this.historyStore.set(sessionId, ['about:blank']);

    logger.debug(`[MockBrowserProvider] Created session ${sessionId} for user ${userId}`);
    return state;
  }

  async closeSession(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new NotFoundError(`Browser session '${sessionId}' not found.`);
    }
    state.status = 'closed';
    this.sessions.delete(sessionId);
    this.cookiesStore.delete(sessionId);
    this.historyStore.delete(sessionId);
    logger.debug(`[MockBrowserProvider] Closed session ${sessionId}`);
  }

  async getSession(sessionId: string): Promise<BrowserSessionState | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async navigate(
    sessionId: string,
    url: string,
    action: NavigationAction = 'navigate',
  ): Promise<BrowserSessionState> {
    const state = this.sessions.get(sessionId);
    if (!state || state.status !== 'active') {
      throw new NotFoundError(`Active browser session '${sessionId}' not found.`);
    }

    const history = this.historyStore.get(sessionId) ?? [];

    let targetUrl = url;
    if (action === 'back' && history.length > 1) {
      history.pop();
      targetUrl = history[history.length - 1];
    } else if (action === 'refresh') {
      targetUrl = state.currentUrl;
    } else {
      history.push(targetUrl);
    }

    state.currentUrl = targetUrl;
    state.pageTitle = this.extractTitleFromUrl(targetUrl);
    state.lastActiveAt = new Date().toISOString();

    logger.debug(`[MockBrowserProvider] Navigated session ${sessionId} (${action}) -> ${targetUrl}`);
    return state;
  }

  async performAction(
    sessionId: string,
    payload: ElementActionPayload,
  ): Promise<{ success: boolean; message: string; state: BrowserSessionState }> {
    const state = this.sessions.get(sessionId);
    if (!state || state.status !== 'active') {
      throw new NotFoundError(`Active browser session '${sessionId}' not found.`);
    }

    state.lastActiveAt = new Date().toISOString();

    let msg = `Executed action '${payload.action}'`;
    if (payload.selector) msg += ` on selector '${payload.selector}'`;
    if (payload.text) msg += ` with text '${payload.text}'`;

    logger.debug(`[MockBrowserProvider] Session ${sessionId} action: ${msg}`);

    return {
      success: true,
      message: msg,
      state,
    };
  }

  async extractDOM(sessionId: string, _options?: DOMExtractionOptions): Promise<DOMExtractionResult> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new NotFoundError(`Browser session '${sessionId}' not found.`);
    }

    return {
      url: state.currentUrl,
      title: state.pageTitle,
      meta: {
        description: 'Mock web page for HiMe OS browser perception testing',
        keywords: 'hime, ai, browser, automation',
        viewport: 'width=device-width, initial-scale=1.0',
      },
      links: [
        { text: 'Documentation', href: `${state.currentUrl}/docs` },
        { text: 'Login', href: `${state.currentUrl}/login` },
        { text: 'About', href: `${state.currentUrl}/about` },
      ],
      buttons: [
        { text: 'Submit', selector: '#submit-btn', disabled: false },
        { text: 'Cancel', selector: '#cancel-btn', disabled: false },
      ],
      forms: [
        {
          action: '/login',
          method: 'POST',
          fields: [
            { name: 'email', type: 'email', label: 'Email Address' },
            { name: 'password', type: 'password', label: 'Password' },
          ],
        },
      ],
      tables: [
        { headers: ['ID', 'Name', 'Status'], rowsCount: 5 },
      ],
      lists: [
        { itemCount: 3, sample: ['Feature 1', 'Feature 2', 'Feature 3'] },
      ],
      images: [
        { alt: 'Logo', src: '/assets/logo.png' },
      ],
      extractedAt: new Date().toISOString(),
    };
  }

  async takeScreenshot(
    sessionId: string,
    options?: BrowserScreenshotOptions,
  ): Promise<BrowserScreenshotResult> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new NotFoundError(`Browser session '${sessionId}' not found.`);
    }

    const format = options?.format ?? 'png';
    const sampleBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    return {
      data: sampleBase64,
      format,
      width: state.viewport.width,
      height: state.viewport.height,
      capturedAt: new Date().toISOString(),
    };
  }

  async getCookies(sessionId: string): Promise<BrowserCookie[]> {
    return this.cookiesStore.get(sessionId) ?? [];
  }

  async setCookies(sessionId: string, cookies: BrowserCookie[]): Promise<void> {
    const existing = this.cookiesStore.get(sessionId) ?? [];
    this.cookiesStore.set(sessionId, [...existing, ...cookies]);
  }

  async clearCookies(sessionId: string): Promise<void> {
    this.cookiesStore.set(sessionId, []);
  }

  async downloadFile(sessionId: string, url: string): Promise<DownloadRecord> {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new NotFoundError(`Browser session '${sessionId}' not found.`);
    }

    const filename = url.split('/').pop() || 'downloaded-file.bin';

    return {
      id: `dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url,
      filename,
      sizeBytes: 1024 * 42,
      mimeType: 'application/octet-stream',
      localPath: `C:\\Users\\ayush\\.gemini\\antigravity\\scratch\\hime-os\\downloads\\${filename}`,
      downloadedAt: new Date().toISOString(),
    };
  }

  private extractTitleFromUrl(url: string): string {
    if (url === 'about:blank') return 'New Tab';
    try {
      const parsed = new URL(url);
      return `${parsed.hostname} - Page`;
    } catch {
      return 'Web Page';
    }
  }
}

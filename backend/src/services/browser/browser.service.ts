import { BrowserProviderRegistry } from './provider-registry';
import { BrowserSessionService } from './browser-session.service';
import { BrowserContextService } from './browser-context.service';
import { BrowserNavigationService } from './navigation.service';
import { BrowserEngineService } from './browser-engine.service';
import { DOMService } from './dom.service';
import { FormService } from './forms.service';
import { BrowserScreenshotService } from './screenshot.service';
import { DownloadService } from './download.service';
import { CookieService } from './cookies.service';
import { BrowserActivityService, BrowserActivityLog } from './activity.service';
import { MockBrowserProvider } from './providers/mock.provider';
import {
  BrowserSessionOptions,
  BrowserSessionState,
  NavigationAction,
  ElementActionPayload,
  DOMExtractionOptions,
  DOMExtractionResult,
  BrowserScreenshotOptions,
  BrowserScreenshotResult,
  DownloadRecord,
  BrowserCookie,
  FormFillPayload,
  BrowserProviderInfo,
} from './provider.interface';
import { logger } from '../../config/logger';

export class BrowserService {
  private registry: BrowserProviderRegistry;
  private sessionService: BrowserSessionService;
  private contextService: BrowserContextService;
  private navigationService: BrowserNavigationService;
  private engineService: BrowserEngineService;
  private domService: DOMService;
  private formService: FormService;
  private screenshotService: BrowserScreenshotService;
  private downloadService: DownloadService;
  private cookieService: CookieService;
  private activityService: BrowserActivityService;

  constructor(
    registry: BrowserProviderRegistry = BrowserProviderRegistry.getInstance(),
    sessionService: BrowserSessionService = new BrowserSessionService(),
    contextService: BrowserContextService = new BrowserContextService(),
    navigationService: BrowserNavigationService = new BrowserNavigationService(),
    engineService: BrowserEngineService = new BrowserEngineService(),
    domService: DOMService = new DOMService(),
    formService: FormService = new FormService(),
    screenshotService: BrowserScreenshotService = new BrowserScreenshotService(),
    downloadService: DownloadService = new DownloadService(),
    cookieService: CookieService = new CookieService(),
    activityService: BrowserActivityService = new BrowserActivityService(),
  ) {
    this.registry = registry;
    this.sessionService = sessionService;
    this.contextService = contextService;
    this.navigationService = navigationService;
    this.engineService = engineService;
    this.domService = domService;
    this.formService = formService;
    this.screenshotService = screenshotService;
    this.downloadService = downloadService;
    this.cookieService = cookieService;
    this.activityService = activityService;

    // Register default mock browser provider if registry is empty
    if (this.registry.listProviders().length === 0) {
      this.registry.registerProvider(new MockBrowserProvider(), true);
    }
  }

  getProviders(): BrowserProviderInfo[] {
    return this.registry.listProviders();
  }

  async openSession(
    userId: string,
    url?: string,
    options?: BrowserSessionOptions,
    providerName?: string,
  ): Promise<BrowserSessionState> {
    const preparedOpts = this.contextService.prepareContextOptions(options);
    const session = await this.sessionService.createSession(userId, preparedOpts, providerName);

    if (url && url !== 'about:blank') {
      await this.navigationService.navigate(session.sessionId, url, 'open', providerName);
      session.currentUrl = url;
    }

    this.activityService.logActivity(userId, session.sessionId, 'OPEN_SESSION', providerName ?? 'mock', {
      url: session.currentUrl,
    });

    return session;
  }

  async closeSession(userId: string, sessionId: string, providerName?: string): Promise<void> {
    await this.sessionService.closeSession(sessionId, providerName);
    this.activityService.logActivity(userId, sessionId, 'CLOSE_SESSION', providerName ?? 'mock', {});
  }

  async getSession(sessionId: string, providerName?: string): Promise<BrowserSessionState | null> {
    return this.sessionService.getSession(sessionId, providerName);
  }

  async navigate(
    userId: string,
    sessionId: string,
    url: string,
    action: NavigationAction = 'navigate',
    providerName?: string,
  ): Promise<BrowserSessionState> {
    const state = await this.navigationService.navigate(sessionId, url, action, providerName);
    this.activityService.logActivity(userId, sessionId, 'NAVIGATE', providerName ?? 'mock', {
      action,
      url: state.currentUrl,
    });
    return state;
  }

  async performAction(
    userId: string,
    sessionId: string,
    payload: ElementActionPayload,
    providerName?: string,
  ): Promise<{ success: boolean; message: string; state: BrowserSessionState }> {
    const res = await this.engineService.performAction(sessionId, payload, providerName);
    this.activityService.logActivity(userId, sessionId, 'ELEMENT_ACTION', providerName ?? 'mock', {
      action: payload.action,
      selector: payload.selector,
    });
    return res;
  }

  async extractDOM(
    userId: string,
    sessionId: string,
    options?: DOMExtractionOptions,
    providerName?: string,
  ): Promise<DOMExtractionResult> {
    const result = await this.domService.extractDOM(sessionId, options, providerName);
    this.activityService.logActivity(userId, sessionId, 'EXTRACT_DOM', providerName ?? 'mock', {
      url: result.url,
      linkCount: result.links.length,
      buttonCount: result.buttons.length,
    });
    return result;
  }

  async fillForm(
    userId: string,
    sessionId: string,
    payload: FormFillPayload,
    providerName?: string,
  ): Promise<{ success: boolean; fieldsFilled: number; submitted: boolean; state: BrowserSessionState }> {
    const res = await this.formService.fillForm(sessionId, payload, providerName);
    this.activityService.logActivity(userId, sessionId, 'ELEMENT_ACTION', providerName ?? 'mock', {
      action: 'fillForm',
      fieldsFilled: res.fieldsFilled,
      submitted: res.submitted,
    });
    return res;
  }

  async takeScreenshot(
    userId: string,
    sessionId: string,
    options?: BrowserScreenshotOptions,
    providerName?: string,
  ): Promise<BrowserScreenshotResult> {
    const result = await this.screenshotService.takeScreenshot(sessionId, options, providerName);
    this.activityService.logActivity(userId, sessionId, 'TAKE_SCREENSHOT', providerName ?? 'mock', {
      type: options?.type ?? 'viewport',
      format: result.format,
    });
    return result;
  }

  async downloadFile(
    userId: string,
    sessionId: string,
    url: string,
    providerName?: string,
  ): Promise<DownloadRecord> {
    const record = await this.downloadService.downloadFile(sessionId, url, providerName);
    this.activityService.logActivity(userId, sessionId, 'DOWNLOAD_FILE', providerName ?? 'mock', {
      url,
      filename: record.filename,
      sizeBytes: record.sizeBytes,
    });
    return record;
  }

  async getCookies(userId: string, sessionId: string, providerName?: string): Promise<BrowserCookie[]> {
    return this.cookieService.getCookies(sessionId, providerName);
  }

  async setCookies(
    userId: string,
    sessionId: string,
    cookies: BrowserCookie[],
    providerName?: string,
  ): Promise<void> {
    await this.cookieService.setCookies(sessionId, cookies, providerName);
    this.activityService.logActivity(userId, sessionId, 'COOKIES_MODIFIED', providerName ?? 'mock', {
      count: cookies.length,
      action: 'set',
    });
  }

  async clearCookies(userId: string, sessionId: string, providerName?: string): Promise<void> {
    await this.cookieService.clearCookies(sessionId, providerName);
    this.activityService.logActivity(userId, sessionId, 'COOKIES_MODIFIED', providerName ?? 'mock', {
      action: 'clear',
    });
  }

  getLogs(userId: string, limit?: number): BrowserActivityLog[] {
    return this.activityService.getLogs(userId, limit);
  }
}

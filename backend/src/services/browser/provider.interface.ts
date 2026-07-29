/**
 * Browser Automation Platform Contracts & Interfaces for HiMe OS.
 *
 * Decouples browser automation logic from Playwright, Puppeteer, Selenium, or Chromium.
 */

export interface BrowserCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface BrowserSessionOptions {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  cookies?: BrowserCookie[];
}

export interface BrowserSessionState {
  sessionId: string;
  userId: string;
  currentUrl: string;
  pageTitle: string;
  status: 'active' | 'paused' | 'closed';
  viewport: { width: number; height: number };
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
}

export type NavigationAction = 'open' | 'navigate' | 'back' | 'forward' | 'refresh';

export type ElementActionType =
  | 'click'
  | 'type'
  | 'select'
  | 'hover'
  | 'scroll'
  | 'wait'
  | 'upload';

export interface ElementActionPayload {
  action: ElementActionType;
  selector?: string;
  text?: string;
  value?: string;
  filePath?: string;
  scrollOffset?: { x: number; y: number };
  waitTimeMs?: number;
}

export interface DOMExtractionOptions {
  includeTitle?: boolean;
  includeMeta?: boolean;
  includeLinks?: boolean;
  includeButtons?: boolean;
  includeForms?: boolean;
  includeTables?: boolean;
  includeLists?: boolean;
  includeImages?: boolean;
}

export interface DOMLink {
  text: string;
  href: string;
}

export interface DOMButton {
  text: string;
  selector: string;
  disabled: boolean;
}

export interface DOMFormField {
  name: string;
  type: string;
  label?: string;
  value?: string;
}

export interface DOMForm {
  action: string;
  method: string;
  fields: DOMFormField[];
}

export interface DOMTable {
  headers: string[];
  rowsCount: number;
}

export interface DOMList {
  itemCount: number;
  sample: string[];
}

export interface DOMImage {
  alt: string;
  src: string;
}

export interface DOMExtractionResult {
  url: string;
  title: string;
  meta: Record<string, string>;
  links: DOMLink[];
  buttons: DOMButton[];
  forms: DOMForm[];
  tables: DOMTable[];
  lists: DOMList[];
  images: DOMImage[];
  extractedAt: string;
}

export interface BrowserScreenshotOptions {
  type?: 'full_page' | 'viewport' | 'element';
  selector?: string;
  format?: 'png' | 'jpeg' | 'webp';
}

export interface BrowserScreenshotResult {
  data: string; // base64
  format: string;
  width: number;
  height: number;
  capturedAt: string;
}

export interface DownloadRecord {
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  localPath: string;
  downloadedAt: string;
}

export interface FormFillPayload {
  formSelector?: string;
  fields: Record<string, string | boolean | number>;
  submit?: boolean;
}

export interface IBrowserProvider {
  readonly name: string;
  readonly displayName: string;
  readonly isAvailable: boolean;

  createSession(userId: string, options?: BrowserSessionOptions): Promise<BrowserSessionState>;
  closeSession(sessionId: string): Promise<void>;
  getSession(sessionId: string): Promise<BrowserSessionState | null>;

  navigate(sessionId: string, url: string, action?: NavigationAction): Promise<BrowserSessionState>;
  performAction(
    sessionId: string,
    payload: ElementActionPayload,
  ): Promise<{ success: boolean; message: string; state: BrowserSessionState }>;

  extractDOM(sessionId: string, options?: DOMExtractionOptions): Promise<DOMExtractionResult>;
  takeScreenshot(sessionId: string, options?: BrowserScreenshotOptions): Promise<BrowserScreenshotResult>;

  getCookies(sessionId: string): Promise<BrowserCookie[]>;
  setCookies(sessionId: string, cookies: BrowserCookie[]): Promise<void>;
  clearCookies(sessionId: string): Promise<void>;

  downloadFile(sessionId: string, url: string): Promise<DownloadRecord>;
}

export interface BrowserProviderInfo {
  name: string;
  displayName: string;
  isAvailable: boolean;
  capabilities: string[];
}

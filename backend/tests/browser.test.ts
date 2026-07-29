import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { BrowserService } from '../src/services/browser/browser.service';
import { BrowserProviderRegistry } from '../src/services/browser/provider-registry';
import { BrowserActivityService } from '../src/services/browser/activity.service';
import { MockBrowserProvider } from '../src/services/browser/providers/mock.provider';
import { ToolExecutor, initializeSystemTools, ToolRegistry } from '../src/services/ai/tools';
import { SupervisorAgentService } from '../src/services/agents/supervisor.service';

describe('Browser Automation Platform (Phase 23)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';

  let browserService: BrowserService;
  let registry: BrowserProviderRegistry;
  let toolExecutor: ToolExecutor;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    toolExecutor = new ToolExecutor();
    registry = BrowserProviderRegistry.getInstance();
    browserService = new BrowserService();

    // Register test user & token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Browser Test User',
        email: `browser-user-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;
  });

  beforeEach(() => {
    BrowserActivityService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Session Lifecycle & Context Management
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. Session Lifecycle & Context Management', () => {
    it('should open a new browser session with default options', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      expect(session.sessionId).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.status).toBe('active');
      expect(session.currentUrl).toBe('https://example.com');
    });

    it('should retrieve active user session details', async () => {
      const session = await browserService.openSession(userId, 'https://example.com/login');
      const retrieved = await browserService.getSession(session.sessionId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.sessionId).toBe(session.sessionId);
    });

    it('should close an active browser session', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      await browserService.closeSession(userId, session.sessionId);
      const retrieved = await browserService.getSession(session.sessionId);
      expect(retrieved).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Navigation Controls
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. Navigation Controls', () => {
    it('should navigate to a new URL and update page title', async () => {
      const session = await browserService.openSession(userId);
      const updated = await browserService.navigate(userId, session.sessionId, 'https://example.org');
      expect(updated.currentUrl).toBe('https://example.org');
      expect(updated.pageTitle).toBe('example.org - Page');
    });

    it('should reject invalid URL strings with HTTP 400', async () => {
      const session = await browserService.openSession(userId);
      await expect(
        browserService.navigate(userId, session.sessionId, 'ftp://invalid-url.com'),
      ).rejects.toThrow(/Invalid URL/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. DOM Extraction & Form Automation
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. DOM Extraction & Form Automation', () => {
    it('should extract structured DOM elements from current page', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      const dom = await browserService.extractDOM(userId, session.sessionId);
      expect(dom.url).toBe('https://example.com');
      expect(dom.title).toBeDefined();
      expect(Array.isArray(dom.links)).toBe(true);
      expect(Array.isArray(dom.buttons)).toBe(true);
      expect(Array.isArray(dom.forms)).toBe(true);
    });

    it('should fill form input fields and submit form', async () => {
      const session = await browserService.openSession(userId, 'https://example.com/login');
      const result = await browserService.fillForm(userId, session.sessionId, {
        formSelector: '#login-form',
        fields: {
          email: 'user@example.com',
          password: 'Password123!',
        },
        submit: true,
      });

      expect(result.success).toBe(true);
      expect(result.fieldsFilled).toBe(2);
      expect(result.submitted).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Screenshots, Cookies, & Downloads
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. Screenshots, Cookies, & Downloads', () => {
    it('should capture a viewport screenshot in base64 format', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      const screenshot = await browserService.takeScreenshot(userId, session.sessionId, {
        type: 'viewport',
        format: 'png',
      });

      expect(screenshot.data).toBeDefined();
      expect(screenshot.format).toBe('png');
      expect(screenshot.width).toBeGreaterThan(0);
    });

    it('should set, retrieve, and clear browser cookies', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');

      await browserService.setCookies(userId, session.sessionId, [
        { name: 'session_id', value: 'xyz123', domain: 'example.com', path: '/' },
      ]);

      const cookies = await browserService.getCookies(userId, session.sessionId);
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies[0].name).toBe('session_id');

      await browserService.clearCookies(userId, session.sessionId);
      const emptyCookies = await browserService.getCookies(userId, session.sessionId);
      expect(emptyCookies.length).toBe(0);
    });

    it('should track file downloads and return metadata record', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      const record = await browserService.downloadFile(userId, session.sessionId, 'https://example.com/report.pdf');

      expect(record.filename).toBe('report.pdf');
      expect(record.localPath).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Tool Calling Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. Tool Calling Framework Integration', () => {
    it('should register all 7 browser tools in ToolRegistry', () => {
      const toolReg = ToolRegistry.getInstance();
      expect(toolReg.hasTool('openWebsite')).toBe(true);
      expect(toolReg.hasTool('clickElement')).toBe(true);
      expect(toolReg.hasTool('fillForm')).toBe(true);
      expect(toolReg.hasTool('extractDOM')).toBe(true);
      expect(toolReg.hasTool('takeBrowserScreenshot')).toBe(true);
      expect(toolReg.hasTool('downloadFile')).toBe(true);
      expect(toolReg.hasTool('uploadFile')).toBe(true);
    });

    it('should execute openWebsite tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('openWebsite', userId, {
        url: 'https://example.com',
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('sessionId');
    });

    it('should execute extractDOM tool via ToolExecutor', async () => {
      const session = await browserService.openSession(userId, 'https://example.com');
      const response = await toolExecutor.executeTool('extractDOM', userId, {
        sessionId: session.sessionId,
      });

      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('title');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Multi-Agent Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. Multi-Agent Framework Integration', () => {
    it('should allow SupervisorAgent to execute multi-agent orchestration for browser tasks', async () => {
      const supervisor = new SupervisorAgentService();
      const orchestration = await supervisor.executeOrchestration({
        userId,
        prompt: 'Search web page, extract links, and automate form submission',
      });

      expect(orchestration.subtaskResults.length).toBeGreaterThan(0);
      expect(orchestration.aggregatedResult).toContain('Multi-Agent Orchestration Summary');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. HTTP API Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  describe('7. HTTP API Endpoints', () => {
    let activeSessionId = '';

    it('POST /browser/open should open a browser session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/browser/open',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { url: 'https://example.com' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('sessionId');
      activeSessionId = body.data.sessionId;
    });

    it('POST /browser/navigate should navigate active session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/browser/navigate',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: activeSessionId, url: 'https://example.org' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.currentUrl).toBe('https://example.org');
    });

    it('POST /browser/action should execute element action', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/browser/action',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: activeSessionId, action: 'click', selector: '#login-btn' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
    });

    it('POST /browser/extract should extract DOM elements', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/browser/extract',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: activeSessionId },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('links');
    });

    it('POST /browser/screenshot should return screenshot payload', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/browser/screenshot',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: activeSessionId, type: 'viewport' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('data');
    });

    it('GET /browser/session should return active user sessions', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/browser/session',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('DELETE /browser/session should close session', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/browser/session',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { sessionId: activeSessionId },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.closed).toBe(true);
    });

    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/browser/session',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

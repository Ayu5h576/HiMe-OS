import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { SystemInfoService } from '../src/services/desktop/system-info.service';
import { FilesystemService } from '../src/services/desktop/filesystem.service';
import { ApplicationService } from '../src/services/desktop/application.service';
import { ClipboardService } from '../src/services/desktop/clipboard.service';
import { ScreenshotService } from '../src/services/desktop/screenshot.service';
import { DesktopHealthService } from '../src/services/desktop/desktop-health.service';
import { DesktopAgentService } from '../src/services/desktop/desktop-agent.service';
import { DesktopNotificationService } from '../src/services/desktop/desktop-notification.service';
import { ToolRegistry, ToolExecutor, initializeSystemTools } from '../src/services/ai/tools';
import path from 'path';
import os from 'os';
import fs from 'fs';

describe('Desktop Agent Infrastructure (Phase 19)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';

  let systemInfoService: SystemInfoService;
  let filesystemService: FilesystemService;
  let applicationService: ApplicationService;
  let clipboardService: ClipboardService;
  let screenshotService: ScreenshotService;
  let healthService: DesktopHealthService;
  let desktopAgent: DesktopAgentService;
  let toolExecutor: ToolExecutor;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    toolExecutor = new ToolExecutor();

    systemInfoService = new SystemInfoService();
    filesystemService = new FilesystemService(os.tmpdir()); // scoped to tmp for testing
    applicationService = new ApplicationService();
    clipboardService = new ClipboardService();
    screenshotService = new ScreenshotService();
    healthService = new DesktopHealthService();
    desktopAgent = new DesktopAgentService(
      systemInfoService,
      filesystemService,
      applicationService,
      clipboardService,
      screenshotService,
      new DesktopNotificationService(),
      healthService,
    );

    // Register & get test token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Desktop Agent Test User',
        email: `desktop-agent-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;
  });

  beforeEach(() => {
    ClipboardService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. System Information
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. System Information', () => {
    it('should collect system info with OS, CPU, memory, and network', () => {
      const info = systemInfoService.getSystemInfo();

      expect(info).toHaveProperty('os');
      expect(info.os).toHaveProperty('platform');
      expect(info.os).toHaveProperty('type');
      expect(info.os).toHaveProperty('arch');
      expect(info.os).toHaveProperty('hostname');

      expect(info).toHaveProperty('cpu');
      expect(info.cpu.cores).toBeGreaterThan(0);

      expect(info).toHaveProperty('memory');
      expect(info.memory.totalBytes).toBeGreaterThan(0);
      expect(info.memory.usagePercent).toBeGreaterThanOrEqual(0);
      expect(info.memory.usagePercent).toBeLessThanOrEqual(100);

      expect(info).toHaveProperty('uptime');
      expect(info.uptime).toBeGreaterThan(0);
      expect(info).toHaveProperty('collectedAt');
    });

    it('should expose system info via GET /desktop/system/info', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/system/info',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('os');
      expect(body.data).toHaveProperty('cpu');
      expect(body.data).toHaveProperty('memory');
    });

    it('should require authentication for system info endpoint', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/system/info',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. File Browsing
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. File System Operations', () => {
    it('should list directory contents within scoped root', async () => {
      const entries = await filesystemService.listDirectory('.');
      expect(Array.isArray(entries)).toBe(true);
      // tmpdir should be listable
    });

    it('should reject path traversal attempts', async () => {
      await expect(filesystemService.listDirectory('../../etc')).rejects.toThrow(
        /traversal|restricted/i,
      );
    });

    it('should create a folder and verify existence', async () => {
      const folderName = `hime-test-dir-${Date.now()}`;
      const result = await filesystemService.createFolder(folderName);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('createFolder');

      // Cleanup
      try {
        await fs.promises.rmdir(path.join(os.tmpdir(), folderName));
      } catch {
        // ignore cleanup errors
      }
    });

    it('should write, copy, and search a file', async () => {
      const fileName = `hime-test-${Date.now()}.txt`;
      const filePath = path.join(os.tmpdir(), fileName);
      await fs.promises.writeFile(filePath, 'HiMe OS Desktop Agent test file');

      // Read
      const readResult = await filesystemService.readFile(fileName);
      expect(readResult.content).toBe('HiMe OS Desktop Agent test file');
      expect(readResult.sizeBytes).toBeGreaterThan(0);

      // Copy
      const copyName = `hime-copy-${Date.now()}.txt`;
      const copyResult = await filesystemService.copyFile(fileName, copyName);
      expect(copyResult.success).toBe(true);

      // Search
      const searchResults = await filesystemService.searchFiles('.', 'hime-test', 1);
      expect(Array.isArray(searchResults)).toBe(true);

      // Cleanup
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(path.join(os.tmpdir(), copyName));
      } catch {
        // ignore
      }
    });

    it('should block deleting executable files', async () => {
      // We can't easily create a .exe in tmp, but we can verify the logic
      const service = new FilesystemService(os.tmpdir());
      await expect(service.deleteFile('someFile.exe')).rejects.toThrow(/executable|not permitted/i);
    });

    it('should expose file listing via GET /desktop/files', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/files?path=.',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Clipboard
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. Clipboard', () => {
    it('should write content to clipboard and read it back', () => {
      const writeResult = clipboardService.write('Hello from HiMe OS Desktop Agent!');
      expect(writeResult.success).toBe(true);
      expect(writeResult.contentLength).toBeGreaterThan(0);

      const readResult = clipboardService.read();
      expect(readResult.content).toBe('Hello from HiMe OS Desktop Agent!');
      expect(readResult.source).toBe('in-memory');
    });

    it('should maintain clipboard history in order', () => {
      clipboardService.write('first entry');
      clipboardService.write('second entry');
      clipboardService.write('third entry');

      const history = clipboardService.getHistory(5);
      expect(history.length).toBe(3);
      expect(history[0].content).toBe('third entry');
      expect(history[1].content).toBe('second entry');
      expect(history[2].content).toBe('first entry');
    });

    it('should expose clipboard read via GET /desktop/clipboard', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/clipboard',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('content');
    });

    it('should expose clipboard write via POST /desktop/clipboard', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/desktop/clipboard',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { content: 'Written via HTTP API' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.success).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Screenshot
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. Screenshot', () => {
    it('should return screenshot abstraction metadata', async () => {
      const result = await screenshotService.captureDesktop();

      expect(result.success).toBe(true);
      expect(result.metadata).toHaveProperty('capturedAt');
      expect(result.metadata).toHaveProperty('platform');
      expect(result.metadata.format).toBe('png');
      expect(result.data).toBeNull(); // stub — adapter not installed
    });

    it('should expose screenshot backend status', () => {
      const status = screenshotService.getBackendStatus();
      expect(status).toHaveProperty('available');
      expect(status.available).toBe(false); // no adapter yet
      expect(status).toHaveProperty('adapterRequired');
    });

    it('should expose screenshot capture via POST /desktop/screenshot', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/desktop/screenshot',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('metadata');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Application Listing
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. Application Manager', () => {
    it('should list running processes (at least the current node process)', async () => {
      const processes = await applicationService.listRunningProcesses();
      expect(Array.isArray(processes)).toBe(true);
      expect(processes.length).toBeGreaterThan(0);
      processes.forEach((p) => {
        expect(p).toHaveProperty('pid');
        expect(p).toHaveProperty('name');
        expect(typeof p.pid).toBe('number');
      });
    });

    it('should check that the current process is running', async () => {
      const result = await applicationService.checkProcessState(process.pid);
      expect(result.running).toBe(true);
      expect(result.pid).toBe(process.pid);
    });

    it('should reject launching unlisted applications', async () => {
      await expect(applicationService.launchApplication('rm')).rejects.toThrow(/allowlist/i);
    });

    it('should expose process list via GET /desktop/apps', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/apps',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Tool Registration
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. Tool Registration', () => {
    it('should register all 8 desktop tools in the ToolRegistry', () => {
      const registry = ToolRegistry.getInstance();

      expect(registry.hasTool('getSystemInfo')).toBe(true);
      expect(registry.hasTool('listFiles')).toBe(true);
      expect(registry.hasTool('readFile')).toBe(true);
      expect(registry.hasTool('copyFile')).toBe(true);
      expect(registry.hasTool('launchApplication')).toBe(true);
      expect(registry.hasTool('getClipboard')).toBe(true);
      expect(registry.hasTool('setClipboard')).toBe(true);
      expect(registry.hasTool('takeScreenshot')).toBe(true);
    });

    it('should include desktop tools in tool definitions advertised to AI', () => {
      const registry = ToolRegistry.getInstance();
      const definitions = registry.getToolDefinitions();
      const names = definitions.map((d) => d.name);

      expect(names).toContain('getSystemInfo');
      expect(names).toContain('listFiles');
      expect(names).toContain('getClipboard');
      expect(names).toContain('takeScreenshot');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Tool Execution
  // ─────────────────────────────────────────────────────────────────────────

  describe('7. Tool Execution via ToolExecutor', () => {
    it('should execute getSystemInfo tool', async () => {
      const response = await toolExecutor.executeTool('getSystemInfo', userId, {});

      expect(response.success).toBe(true);
      const result = response.result as any;
      expect(result).toHaveProperty('os');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('memory');
    });

    it('should execute getClipboard tool', async () => {
      const response = await toolExecutor.executeTool('getClipboard', userId, {});

      expect(response.success).toBe(true);
      const result = response.result as any;
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('source');
    });

    it('should execute setClipboard tool and verify write', async () => {
      const response = await toolExecutor.executeTool('setClipboard', userId, {
        content: 'AI wrote this to the clipboard',
      });

      expect(response.success).toBe(true);
      const result = response.result as any;
      expect(result.success).toBe(true);
      expect(result.contentLength).toBeGreaterThan(0);
    });

    it('should execute takeScreenshot tool', async () => {
      const response = await toolExecutor.executeTool('takeScreenshot', userId, {});

      expect(response.success).toBe(true);
      const result = response.result as any;
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('platform');
    });

    it('should execute listFiles tool', async () => {
      const response = await toolExecutor.executeTool('listFiles', userId, { path: '.' });

      expect(response.success).toBe(true);
      expect(Array.isArray(response.result)).toBe(true);
    });

    it('should return error for invalid setClipboard parameters', async () => {
      const response = await toolExecutor.executeTool('setClipboard', userId, {
        // missing required content
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid parameters');
    });

    it('should return error when launchApplication is called with unlisted app', async () => {
      const response = await toolExecutor.executeTool('launchApplication', userId, {
        name: 'malicious-script',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('allowlist');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Notification Bridge
  // ─────────────────────────────────────────────────────────────────────────

  describe('8. Desktop Notification Bridge', () => {
    it('should send a desktop notification through the Notification Gateway', async () => {
      const notifService = new DesktopNotificationService();
      const result = await notifService.sendDesktopNotification(userId, {
        title: 'Desktop Agent Alert',
        message: 'Your AI assistant has completed a task.',
        type: 'SUCCESS',
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('notificationId');
      expect(result.channel).toBe('in-app');
    });

    it('should expose notification bridge via POST /desktop/notify', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/desktop/notify',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          title: 'HiMe OS Desktop Alert',
          message: 'Desktop Agent is fully operational.',
          type: 'INFO',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('notificationId');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Error Handling
  // ─────────────────────────────────────────────────────────────────────────

  describe('9. Error Handling', () => {
    it('should return 404 when reading a non-existent file', async () => {
      await expect(filesystemService.readFile('definitely-does-not-exist-xyz.txt')).rejects.toThrow(
        /not found/i,
      );
    });

    it('should return 400 when creating a folder with empty path via API', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/desktop/files/folder',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { path: '' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when writeClipboard receives empty content via API', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/desktop/clipboard',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { content: '' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 for all desktop endpoints without auth', async () => {
      const endpoints = [
        { method: 'GET' as const, url: '/desktop/system/info' },
        { method: 'GET' as const, url: '/desktop/clipboard' },
        { method: 'POST' as const, url: '/desktop/screenshot' },
        { method: 'GET' as const, url: '/desktop/apps' },
      ];

      for (const { method, url } of endpoints) {
        const res = await app.inject({ method, url });
        expect(res.statusCode).toBe(401);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Desktop Health
  // ─────────────────────────────────────────────────────────────────────────

  describe('10. Desktop Health Monitor', () => {
    it('should generate a valid health report', () => {
      const report = healthService.getHealthReport();

      expect(report).toHaveProperty('overall');
      expect(['HEALTHY', 'DEGRADED', 'CRITICAL']).toContain(report.overall);
      expect(report).toHaveProperty('metrics');
      expect(report.metrics).toHaveProperty('cpu');
      expect(report.metrics).toHaveProperty('memory');
      expect(report.metrics).toHaveProperty('uptime');
      expect(report.metrics).toHaveProperty('processMemory');
      expect(Array.isArray(report.warnings)).toBe(true);
    });

    it('should expose health via GET /desktop/system/health', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/system/health',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('overall');
      expect(body.data).toHaveProperty('metrics');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 11. Agent Status
  // ─────────────────────────────────────────────────────────────────────────

  describe('11. Agent Status & Capabilities', () => {
    it('should expose agent status with capability list via GET /desktop/status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/desktop/status',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.online).toBe(true);
      expect(Array.isArray(body.data.capabilities)).toBe(true);
      expect(body.data.capabilities.length).toBeGreaterThan(0);
    });
  });
});

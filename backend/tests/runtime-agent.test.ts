import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { NativeRuntimeAgentService } from '../src/services/runtime-agent/runtime-agent.service';
import { CommandChannelService } from '../src/services/runtime-agent/command-channel.service';
import { EventStreamService } from '../src/services/runtime-agent/event-stream.service';
import { ToolExecutor, initializeSystemTools, ToolRegistry } from '../src/services/ai/tools';
import { SupervisorAgentService } from '../src/services/agents/supervisor.service';

describe('Native Desktop Runtime Agent (Phase 24)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';

  let agentService: NativeRuntimeAgentService;
  let commandChannel: CommandChannelService;
  let toolExecutor: ToolExecutor;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    toolExecutor = new ToolExecutor();
    commandChannel = new CommandChannelService();
    agentService = new NativeRuntimeAgentService();

    // Register test user & token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Runtime Agent User',
        email: `runtime-user-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;
  });

  beforeEach(() => {
    EventStreamService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Agent Status & Health Reporting
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. Agent Status & Health Reporting', () => {
    it('should return agent status with operational health metrics', async () => {
      const status = await agentService.getStatus();
      expect(status.agentName).toBe('HiMe OS Native Runtime Agent');
      expect(status.isOnline).toBe(true);
      expect(status.health.status).toBeDefined();
      expect(status.health.cpuUsagePercent).toBeGreaterThanOrEqual(0);
    });

    it('should generate detailed health report', async () => {
      const health = await agentService.getHealthReport();
      expect(health.version).toBe('1.0.0-native');
      expect(health.lastHeartbeat).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. System Monitoring Metrics
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. System Monitoring Metrics', () => {
    it('should fetch complete system info (OS, CPU, RAM, Storage, Battery)', async () => {
      const info = await agentService.getSystemInfo();
      expect(info.system.os).toBeDefined();
      expect(info.cpu.cores).toBeGreaterThan(0);
      expect(info.ram.totalBytes).toBeGreaterThan(0);
      expect(info.storage.mountPoint).toBeDefined();
      expect(info.battery.percent).toBeGreaterThanOrEqual(0);
    });

    it('should fetch individual battery info', async () => {
      const battery = await agentService.getBatteryInfo();
      expect(battery.percent).toBeGreaterThanOrEqual(0);
      expect(typeof battery.isCharging).toBe('boolean');
    });

    it('should fetch individual CPU info', async () => {
      const cpu = await agentService.getCpuInfo();
      expect(cpu.cores).toBeGreaterThan(0);
      expect(cpu.model).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Process Management & Allowlist Security
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. Process Management & Allowlist Security', () => {
    it('should list running processes', async () => {
      const procs = await agentService.getRunningProcesses();
      expect(procs.length).toBeGreaterThan(0);
      expect(procs[0]).toHaveProperty('pid');
      expect(procs[0]).toHaveProperty('name');
    });

    it('should launch an allowlisted application', async () => {
      const res = await agentService.launchApplication('notepad');
      expect(res.success).toBe(true);
      expect(res.pid).toBeGreaterThan(0);
      expect(res.appName).toBe('notepad');
    });

    it('should reject unlisted application launch with HTTP 400', async () => {
      await expect(agentService.launchApplication('malicious_hack.exe')).rejects.toThrow(
        /not in the desktop allowlist/i,
      );
    });

    it('should close a running application', async () => {
      const launch = await agentService.launchApplication('calc');
      const close = await agentService.closeApplication(launch.pid);
      expect(close.success).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. System Commands Execution
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. System Commands Execution', () => {
    it('should execute volume control command', async () => {
      const res = await agentService.executeCommand({ action: 'volume_up', value: 15 });
      expect(res.success).toBe(true);
      expect(res.message).toContain('Volume increased');
    });

    it('should execute brightness control command', async () => {
      const res = await agentService.executeCommand({ action: 'brightness', value: 75 });
      expect(res.success).toBe(true);
      expect(res.message).toContain('Brightness adjusted');
    });

    it('should execute lock workstation command', async () => {
      const res = await agentService.executeCommand({ action: 'lock' });
      expect(res.success).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. File Watching, Event Streaming & Command Channel
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. File Watching, Event Streaming & Command Channel', () => {
    it('should watch and unwatch folders', () => {
      const watch = agentService.watchFolder('custom_folder');
      expect(watch.watchedFolders).toContain('custom_folder');

      const unwatch = agentService.unwatchFolder('custom_folder');
      expect(unwatch.watchedFolders).not.toContain('custom_folder');
    });

    it('should record simulated file events in event stream', () => {
      agentService.simulateFileChange('created', 'desktop', 'C:\\Users\\test\\Desktop\\report.txt');
      const events = agentService.getRecentEvents('file');
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('file');
    });

    it('should verify HMAC signed command channel tokens', () => {
      const payload = 'lock_workstation';
      const token = commandChannel.generateChannelToken(payload);
      expect(commandChannel.verifyChannelToken(payload, token)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Tool Calling Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. Tool Calling Framework Integration', () => {
    it('should register all 12 native runtime agent tools in ToolRegistry', () => {
      const toolReg = ToolRegistry.getInstance();
      expect(toolReg.hasTool('getBatteryStatus')).toBe(true);
      expect(toolReg.hasTool('getCpuUsage')).toBe(true);
      expect(toolReg.hasTool('getRamUsage')).toBe(true);
      expect(toolReg.hasTool('getRunningApps')).toBe(true);
      expect(toolReg.hasTool('launchNativeApp')).toBe(true);
      expect(toolReg.hasTool('closeNativeApp')).toBe(true);
      expect(toolReg.hasTool('lockComputer')).toBe(true);
      expect(toolReg.hasTool('shutdownComputer')).toBe(true);
      expect(toolReg.hasTool('restartComputer')).toBe(true);
      expect(toolReg.hasTool('setVolume')).toBe(true);
      expect(toolReg.hasTool('setBrightness')).toBe(true);
      expect(toolReg.hasTool('watchFolder')).toBe(true);
    });

    it('should execute getBatteryStatus tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('getBatteryStatus', userId, {});
      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('percent');
    });

    it('should execute launchNativeApp tool via ToolExecutor', async () => {
      const response = await toolExecutor.executeTool('launchNativeApp', userId, { appName: 'calc' });
      expect(response.success).toBe(true);
      const result: any = response.result;
      expect(result).toHaveProperty('pid');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Multi-Agent Framework Integration
  // ─────────────────────────────────────────────────────────────────────────

  describe('7. Multi-Agent Framework Integration', () => {
    it('should execute multi-agent orchestration for runtime agent prompts', async () => {
      const supervisor = new SupervisorAgentService();
      const orchestration = await supervisor.executeOrchestration({
        userId,
        prompt: 'Check CPU usage, inspect running apps, and lock workstation',
      });

      expect(orchestration.subtaskResults.length).toBeGreaterThan(0);
      expect(orchestration.aggregatedResult).toContain('Multi-Agent Orchestration Summary');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8. HTTP API Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  describe('8. HTTP API Endpoints', () => {
    it('GET /runtime-agent/status should return agent status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime-agent/status',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('agentName');
    });

    it('GET /runtime-agent/system should return system metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime-agent/system',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('cpu');
    });

    it('GET /runtime-agent/processes should return process list', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime-agent/processes',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('POST /runtime-agent/apps/launch should launch allowlisted app', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/runtime-agent/apps/launch',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { appName: 'notepad' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.appName).toBe('notepad');
    });

    it('POST /runtime-agent/system/action should execute system command', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/runtime-agent/system/action',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { action: 'volume_up', value: 10 },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
    });

    it('GET /runtime-agent/battery should return battery metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime-agent/battery',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('percent');
    });

    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime-agent/status',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

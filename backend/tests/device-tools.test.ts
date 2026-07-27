import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { ToolRegistry, ToolExecutor, initializeSystemTools } from '../src/services/ai/tools';
import { DeviceService } from '../src/services/device.service';

describe('Device Tool Integration Module', () => {
  let app: FastifyInstance;
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let projectId = '';
  let lightDeviceId = '';
  let lockDeviceId = '';
  let thermostatDeviceId = '';

  let toolRegistry: ToolRegistry;
  let toolExecutor: ToolExecutor;
  const deviceService = new DeviceService();

  beforeAll(async () => {
    app = await buildApp();
    toolRegistry = initializeSystemTools();
    toolExecutor = new ToolExecutor(toolRegistry);

    // Register User A
    const resA = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Device Tool User A',
        email: `dev-tool-a-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const bodyA = JSON.parse(resA.payload);
    userAToken = bodyA.accessToken;
    userAId = bodyA.user.id;

    // Register User B
    const resB = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Device Tool User B',
        email: `dev-tool-b-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const bodyB = JSON.parse(resB.payload);
    userBToken = bodyB.accessToken;
    userBId = bodyB.user.id;

    // Create Project for User A
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { name: 'Smart Home Automation' },
    });
    projectId = JSON.parse(projRes.payload).data.id;

    // Create Light Device
    const light = await deviceService.createDevice(userAId, projectId, {
      name: 'Living Room Ceiling Light',
      type: 'LIGHT',
    });
    lightDeviceId = light.id;

    // Connect Light Device so it is ONLINE
    await deviceService.connectDevice(userAId, lightDeviceId);

    // Create Lock Device
    const lock = await deviceService.createDevice(userAId, projectId, {
      name: 'Front Door Lock',
      type: 'LOCK',
    });
    lockDeviceId = lock.id;
    await deviceService.connectDevice(userAId, lockDeviceId);

    // Create Thermostat Device
    const temp = await deviceService.createDevice(userAId, projectId, {
      name: 'Main Thermostat',
      type: 'THERMOSTAT',
    });
    thermostatDeviceId = temp.id;
    await deviceService.connectDevice(userAId, thermostatDeviceId);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tool Registration', () => {
    it('should register all 10 device tools in ToolRegistry', () => {
      const toolNames = toolRegistry.getToolDefinitions().map((d) => d.name);
      expect(toolNames).toContain('listDevices');
      expect(toolNames).toContain('getDevice');
      expect(toolNames).toContain('connectDevice');
      expect(toolNames).toContain('disconnectDevice');
      expect(toolNames).toContain('turnOnDevice');
      expect(toolNames).toContain('turnOffDevice');
      expect(toolNames).toContain('setBrightness');
      expect(toolNames).toContain('setTemperature');
      expect(toolNames).toContain('lockDevice');
      expect(toolNames).toContain('unlockDevice');
    });
  });

  describe('Device Listing & Lookup Tools', () => {
    it('should list devices for a project via listDevices tool', async () => {
      const res = await toolExecutor.executeTool('listDevices', userAId, {
        projectId,
      });

      expect(res.success).toBe(true);
      expect(res.toolName).toBe('listDevices');
      const data = res.result as { data: Array<{ name: string }> };
      expect(data.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should get single device details via getDevice tool', async () => {
      const res = await toolExecutor.executeTool('getDevice', userAId, {
        deviceId: lightDeviceId,
      });

      expect(res.success).toBe(true);
      const data = res.result as { id: string; name: string };
      expect(data.id).toBe(lightDeviceId);
      expect(data.name).toBe('Living Room Ceiling Light');
    });
  });

  describe('Device Power State Tools (turnOnDevice / turnOffDevice)', () => {
    it('should turn on light device via turnOnDevice tool', async () => {
      const res = await toolExecutor.executeTool('turnOnDevice', userAId, {
        deviceId: lightDeviceId,
      });

      expect(res.success).toBe(true);
      const data = res.result as { status: string; metadata: { powerState: string } };
      expect(data.status).toBe('ONLINE');
      expect(data.metadata.powerState).toBe('ON');
    });

    it('should turn off light device via turnOffDevice tool', async () => {
      const res = await toolExecutor.executeTool('turnOffDevice', userAId, {
        deviceId: lightDeviceId,
      });

      expect(res.success).toBe(true);
      const data = res.result as { metadata: { powerState: string } };
      expect(data.metadata.powerState).toBe('OFF');
    });
  });

  describe('Capability Control Tools (Brightness, Temperature, Lock)', () => {
    it('should update brightness on light device via setBrightness tool', async () => {
      // Ensure light is online
      await deviceService.connectDevice(userAId, lightDeviceId);

      const res = await toolExecutor.executeTool('setBrightness', userAId, {
        deviceId: lightDeviceId,
        brightness: 75,
      });

      expect(res.success).toBe(true);
      const data = res.result as { metadata: { brightness: number } };
      expect(data.metadata.brightness).toBe(75);
    });

    it('should update temperature on thermostat device via setTemperature tool', async () => {
      const res = await toolExecutor.executeTool('setTemperature', userAId, {
        deviceId: thermostatDeviceId,
        temperature: 22.5,
      });

      expect(res.success).toBe(true);
      const data = res.result as { metadata: { temperature: number } };
      expect(data.metadata.temperature).toBe(22.5);
    });

    it('should lock smart lock device via lockDevice tool', async () => {
      const res = await toolExecutor.executeTool('lockDevice', userAId, {
        deviceId: lockDeviceId,
      });

      expect(res.success).toBe(true);
      const data = res.result as { metadata: { lockState: string } };
      expect(data.metadata.lockState).toBe('LOCKED');
    });

    it('should unlock smart lock device via unlockDevice tool', async () => {
      const res = await toolExecutor.executeTool('unlockDevice', userAId, {
        deviceId: lockDeviceId,
      });

      expect(res.success).toBe(true);
      const data = res.result as { metadata: { lockState: string } };
      expect(data.metadata.lockState).toBe('UNLOCKED');
    });
  });

  describe('Capability Validation & Offline Error Handling', () => {
    it('should return error when setting brightness on a LOCK device lacking brightness capability', async () => {
      const res = await toolExecutor.executeTool('setBrightness', userAId, {
        deviceId: lockDeviceId,
        brightness: 50,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/does not support capability/);
    });

    it('should return error when executing command on an OFFLINE device', async () => {
      // Disconnect light device
      await deviceService.disconnectDevice(userAId, lightDeviceId);

      const res = await toolExecutor.executeTool('turnOnDevice', userAId, {
        deviceId: lightDeviceId,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/currently offline/);
    });
  });

  describe('Ownership & Error Boundary Testing', () => {
    it('should reject execution by unauthorized User B on User A device', async () => {
      const res = await toolExecutor.executeTool('turnOnDevice', userBId, {
        deviceId: lockDeviceId,
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/do not have access/i);
    });

    it('should reject execution with non-existent device ID', async () => {
      const res = await toolExecutor.executeTool('turnOnDevice', userAId, {
        deviceId: 'non-existent-device-id',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/not found/i);
    });

    it('should reject execution with invalid parameter schema', async () => {
      const res = await toolExecutor.executeTool('setBrightness', userAId, {
        deviceId: lightDeviceId,
        brightness: 999, // exceeds max 100
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Invalid parameters/i);
    });
  });
});

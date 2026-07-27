import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { NotificationService } from '../src/services/notification/notification.service';
import { DeviceSimulatorService } from '../src/services/runtime/device-simulator.service';
import { VirtualSensorService } from '../src/services/runtime/virtual-sensor.service';
import { RuntimeEventBusService } from '../src/services/runtime/event-bus.service';
import { ActivityFeedService } from '../src/services/runtime/activity-feed.service';
import { RuntimeMonitoringService } from '../src/services/runtime/monitoring.service';
import { DeviceType } from '@prisma/client';

describe('Runtime & User Interaction Platform Module (Phase 18)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';
  let projectId = '';
  let deviceId = '';
  let notificationId = '';

  let notificationService: NotificationService;
  let deviceSimulatorService: DeviceSimulatorService;
  let virtualSensorService: VirtualSensorService;
  let activityFeedService: ActivityFeedService;
  let monitoringService: RuntimeMonitoringService;

  beforeAll(async () => {
    app = await buildApp();

    notificationService = new NotificationService();
    deviceSimulatorService = new DeviceSimulatorService();
    virtualSensorService = new VirtualSensorService();
    activityFeedService = new ActivityFeedService();
    monitoringService = new RuntimeMonitoringService();

    // Register User
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Runtime Test Platform User',
        email: `runtime-platform-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;

    // Create Project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        name: 'Runtime Platform Workspace',
        description: 'Testing runtime platform features',
      },
    });
    projectId = JSON.parse(projRes.payload).data.id;

    // Create Virtual Device
    const devRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/devices`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        name: 'Living Room Smart Light',
        type: 'LIGHT',
        manufacturer: 'HiMe Virtual Labs',
        model: 'Simulated LED v1',
      },
    });
    deviceId = JSON.parse(devRes.payload).data.id;
  });

  beforeEach(() => {
    RuntimeEventBusService.clearHistory();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Notification Gateway (Service & API)', () => {
    it('should create an in-app notification', async () => {
      const notif = await notificationService.createNotification(userId, {
        title: 'System Alert',
        message: 'High CPU utilization detected',
        type: 'SYSTEM',
      });

      expect(notif).toHaveProperty('id');
      expect(notif.title).toBe('System Alert');
      expect(notif.read).toBe(false);
    });

    it('should list notifications via GET /notifications', async () => {
      await notificationService.createNotification(userId, {
        title: 'API Test Alert',
        message: 'Hello World',
        type: 'INFO',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should mark notification as read via PATCH /notifications/:id/read', async () => {
      const res1 = await app.inject({
        method: 'GET',
        url: '/notifications',
        headers: { authorization: `Bearer ${userToken}` },
      });
      const items = JSON.parse(res1.payload).data;

      if (items.length > 0) {
        notificationId = items[0].id;
        const patchRes = await app.inject({
          method: 'PATCH',
          url: `/notifications/${notificationId}/read`,
          headers: { authorization: `Bearer ${userToken}` },
        });

        expect(patchRes.statusCode).toBe(200);
        const body = JSON.parse(patchRes.payload);
        expect(body.data.read).toBe(true);
      }
    });

    it('should delete notification via DELETE /notifications/:id', async () => {
      if (notificationId) {
        const delRes = await app.inject({
          method: 'DELETE',
          url: `/notifications/${notificationId}`,
          headers: { authorization: `Bearer ${userToken}` },
        });
        expect(delRes.statusCode).toBe(204);
      }
    });
  });

  describe('2. Device Simulator & Virtual Sensors', () => {
    it('should generate initial state presets for device types', () => {
      const lightState = DeviceSimulatorService.getInitialStateForType(DeviceType.LIGHT);
      expect(lightState).toMatchObject({ power: false, brightness: 80 });

      const thermostatState = DeviceSimulatorService.getInitialStateForType(
        DeviceType.THERMOSTAT,
      );
      expect(thermostatState).toMatchObject({ currentTemp: 22, targetTemp: 24 });
    });

    it('should simulate device state updates via DeviceSimulatorService', async () => {
      const updated = await deviceSimulatorService.simulateDeviceUpdate(userId, deviceId, {
        power: true,
        brightness: 95,
      });

      expect(updated.id).toBe(deviceId);
      expect((updated.metadata as any).brightness).toBe(95);
    });

    it('should trigger virtual sensor events via POST /runtime/events/simulate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/runtime/events/simulate',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          deviceId,
          eventType: 'MOTION_DETECTED',
          payload: { intensity: 'HIGH' },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.event).toBe('MOTION_DETECTED');
    });
  });

  describe('3. Runtime Event Bus & Activity Feed', () => {
    it('should publish and subscribe to Runtime Event Bus', async () => {
      let received = false;
      RuntimeEventBusService.subscribe('DeviceChanged', (evt) => {
        if (evt.payload.deviceId === deviceId) {
          received = true;
        }
      });

      RuntimeEventBusService.publish('DeviceChanged', userId, { deviceId, state: 'ON' });

      // Allow setImmediate loop
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(received).toBe(true);
      expect(RuntimeEventBusService.getRecentEvents().length).toBeGreaterThan(0);
    });

    it('should record and list activity feed via GET /runtime/activity', async () => {
      await activityFeedService.recordManualActivity(userId, {
        category: 'DEVICE',
        action: 'STATE_CHANGE',
        description: 'Light turned ON manually',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/runtime/activity',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('4. Runtime Monitoring & Diagnostics', () => {
    it('should expose system status via GET /runtime/status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/runtime/status',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('HEALTHY');
      expect(body.data).toHaveProperty('metrics');
      expect(body.data.metrics).toHaveProperty('counts');
      expect(body.data.metrics).toHaveProperty('scheduler');
    });
  });
});

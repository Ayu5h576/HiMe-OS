import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { TriggerType, ActionType, ConditionType } from '@prisma/client';

describe('Device Automation Triggers Module', () => {
  let app: FastifyInstance;
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let projectIdUserA = '';
  let deviceIdUserA = '';

  let connectedAutomationId = '';
  let disconnectedAutomationId = '';
  let stateChangedAutomationId = '';
  let disabledAutomationId = '';
  let multiAutomation1Id = '';
  let multiAutomation2Id = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User A
    const resA = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Device Automation User A',
        email: `dev-auto-a-${Date.now()}@example.com`,
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
        name: 'Device Automation User B',
        email: `dev-auto-b-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const bodyB = JSON.parse(resB.payload);
    userBToken = bodyB.accessToken;
    userBId = bodyB.user.id;

    // User A creates project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { name: 'Automated Smart Workspace' },
    });
    projectIdUserA = JSON.parse(projRes.payload).data.id;

    // User A creates virtual device
    const devRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/devices`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { name: 'Smart Security Light', type: 'LIGHT' },
    });
    deviceIdUserA = JSON.parse(devRes.payload).data.id;

    // Create Automation 1: DEVICE_CONNECTED trigger -> LOG_EVENT
    const auto1 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Log Device Connected',
        triggerType: TriggerType.DEVICE_CONNECTED,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.LOG_EVENT,
      },
    });
    connectedAutomationId = JSON.parse(auto1.payload).data.id;

    // Create Automation 2: DEVICE_DISCONNECTED trigger -> CREATE_TASK
    const auto2 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Create Task on Device Disconnect',
        triggerType: TriggerType.DEVICE_DISCONNECTED,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.CREATE_TASK,
        metadata: { title: 'Check Disconnected Device' },
      },
    });
    disconnectedAutomationId = JSON.parse(auto2.payload).data.id;

    // Create Automation 3: DEVICE_STATE_CHANGED trigger -> CREATE_MEMORY
    const auto3 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Record Device State Change Memory',
        triggerType: TriggerType.DEVICE_STATE_CHANGED,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.CREATE_MEMORY,
        metadata: { title: 'Device State Log', content: 'State updated automatically' },
      },
    });
    stateChangedAutomationId = JSON.parse(auto3.payload).data.id;

    // Create Automation 4: Disabled Automation
    const auto4 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Disabled Device Online Logger',
        triggerType: TriggerType.DEVICE_ONLINE,
        enabled: false,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.LOG_EVENT,
      },
    });
    disabledAutomationId = JSON.parse(auto4.payload).data.id;

    // Create Automations 5 & 6 for Multiple Execution testing
    const auto5 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Multi Action 1 on Battery Low',
        triggerType: TriggerType.DEVICE_BATTERY_LOW,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.SEND_INTERNAL_NOTIFICATION,
        metadata: { message: 'Battery Low Warning Notification' },
      },
    });
    multiAutomation1Id = JSON.parse(auto5.payload).data.id;

    const auto6 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUserA}/automations`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        name: 'Multi Action 2 on Battery Low',
        triggerType: TriggerType.DEVICE_BATTERY_LOW,
        conditionType: ConditionType.ALWAYS,
        actionType: ActionType.CREATE_TASK,
        metadata: { title: 'Replace Device Battery' },
      },
    });
    multiAutomation2Id = JSON.parse(auto6.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Device State Change Triggers & Event Dispatching', () => {
    it('should trigger DEVICE_CONNECTED automation when device connects', async () => {
      const connectRes = await app.inject({
        method: 'POST',
        url: `/devices/${deviceIdUserA}/connect`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(connectRes.statusCode).toBe(200);

      // Verify execution log created for connectedAutomationId
      const execRes = await app.inject({
        method: 'GET',
        url: `/automations/${connectedAutomationId}/executions`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(execRes.statusCode).toBe(200);
      const execBody = JSON.parse(execRes.payload);
      expect(execBody.data.length).toBeGreaterThanOrEqual(1);
      expect(execBody.data[0].status).toBe('SUCCESS');
    });

    it('should trigger DEVICE_DISCONNECTED automation when device disconnects', async () => {
      const disconnectRes = await app.inject({
        method: 'POST',
        url: `/devices/${deviceIdUserA}/disconnect`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(disconnectRes.statusCode).toBe(200);

      const execRes = await app.inject({
        method: 'GET',
        url: `/automations/${disconnectedAutomationId}/executions`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(execRes.statusCode).toBe(200);
      const execBody = JSON.parse(execRes.payload);
      expect(execBody.data.length).toBeGreaterThanOrEqual(1);
      expect(execBody.data[0].status).toBe('SUCCESS');
    });

    it('should trigger DEVICE_STATE_CHANGED automation when device metadata is updated', async () => {
      const updateRes = await app.inject({
        method: 'PATCH',
        url: `/devices/${deviceIdUserA}`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: { metadata: { brightness: 90, colorTemp: 'Warm White' } },
      });
      expect(updateRes.statusCode).toBe(200);

      const execRes = await app.inject({
        method: 'GET',
        url: `/automations/${stateChangedAutomationId}/executions`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(execRes.statusCode).toBe(200);
      const execBody = JSON.parse(execRes.payload);
      expect(execBody.data.length).toBeGreaterThanOrEqual(1);
      expect(execBody.data[0].status).toBe('SUCCESS');
    });
  });

  describe('Disabled Automations & Multiple Automation Executions', () => {
    it('should NOT execute disabled automations when event triggers', async () => {
      await app.inject({
        method: 'POST',
        url: `/devices/${deviceIdUserA}/connect`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      const execRes = await app.inject({
        method: 'GET',
        url: `/automations/${disabledAutomationId}/executions`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(execRes.statusCode).toBe(200);
      const execBody = JSON.parse(execRes.payload);
      expect(execBody.data.length).toBe(0);
    });

    it('should execute multiple matching automations independently on event simulation', async () => {
      const simRes = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUserA}/automations/events/device`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          deviceId: deviceIdUserA,
          eventType: TriggerType.DEVICE_BATTERY_LOW,
          batteryLevel: 15,
        },
      });

      expect(simRes.statusCode).toBe(200);
      const body = JSON.parse(simRes.payload);
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2); // Multi automation 1 & 2 executed
    });
  });

  describe('Validation & Ownership Testing', () => {
    it('should reject event simulation by unauthorized User B on User A project (HTTP 403 / 404)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUserA}/automations/events/device`,
        headers: { authorization: `Bearer ${userBToken}` },
        payload: {
          deviceId: deviceIdUserA,
          eventType: TriggerType.DEVICE_ONLINE,
        },
      });

      expect([403, 404]).toContain(res.statusCode);
    });

    it('should reject invalid event payload schema with HTTP 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUserA}/automations/events/device`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          deviceId: '', // invalid empty string
          eventType: 'INVALID_EVENT_TYPE',
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});

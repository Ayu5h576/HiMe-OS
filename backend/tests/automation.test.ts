import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { TriggerEvaluatorService } from '../src/services/automation/trigger-evaluator.service';
import { SchedulerService } from '../src/services/automation/scheduler.service';
import { TriggerType, ConditionType, ActionType } from '@prisma/client';

describe('Automation Engine Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let automationId1 = '';
  let disabledAutomationId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Automation Owner 1',
        email: `auto-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Automation Owner 2',
        email: `auto-user2-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser2 = JSON.parse(res2.payload).accessToken;

    // Create a Project for User 1
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        name: 'Automation Workflow Workspace',
        description: 'Testing automation rules',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unit Services (TriggerEvaluator & Scheduler)', () => {
    it('should validate cron schedule format', () => {
      expect(() => SchedulerService.validateSchedule('0 9 * * *')).not.toThrow();
      expect(() => SchedulerService.validateSchedule('invalid cron')).toThrow();
    });

    it('should evaluate trigger conditions correctly', () => {
      const activeRule: any = {
        enabled: true,
        triggerType: TriggerType.MANUAL,
        conditionType: ConditionType.ALWAYS,
      };

      const disabledRule: any = {
        enabled: false,
        triggerType: TriggerType.MANUAL,
        conditionType: ConditionType.ALWAYS,
      };

      expect(TriggerEvaluatorService.evaluate(activeRule, { triggerType: TriggerType.MANUAL })).toBe(true);
      expect(TriggerEvaluatorService.evaluate(disabledRule, { triggerType: TriggerType.MANUAL })).toBe(false);
    });
  });

  describe('POST /projects/:projectId/automations', () => {
    it('should reject unauthenticated request with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/automations`,
        payload: {
          name: 'Unauthenticated Rule',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create an active automation rule for project', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/automations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          name: 'Auto-Task Generator',
          description: 'Automatically creates a task on manual run',
          enabled: true,
          triggerType: 'MANUAL',
          conditionType: 'ALWAYS',
          actionType: 'CREATE_TASK',
          metadata: {
            title: 'Automated Daily Cleanup',
            description: 'Task created via automation rule',
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('Auto-Task Generator');
      automationId1 = body.data.id;
    });

    it('should create a disabled automation rule', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/automations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          name: 'Disabled Log Rule',
          enabled: false,
          triggerType: 'MANUAL',
          actionType: 'LOG_EVENT',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.data.enabled).toBe(false);
      disabledAutomationId = body.data.id;
    });

    it('should reject creation on another user project with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/automations`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: {
          name: 'Unauthorized Rule',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:projectId/automations', () => {
    it('should list project automations', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/automations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /automations/:id & PATCH /automations/:id', () => {
    it('should retrieve a single automation rule by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/automations/${automationId1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(automationId1);
    });

    it('should update automation rule details', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/automations/${automationId1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          name: 'Auto-Task Generator Updated',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.name).toBe('Auto-Task Generator Updated');
    });
  });

  describe('POST /automations/:id/run & GET /automations/:id/executions', () => {
    it('should reject running a disabled automation with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/automations/${disabledAutomationId}/run`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should execute active automation and record SUCCESS execution log', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/automations/${automationId1}/run`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          input: { triggerSource: 'Manual Test Run' },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('SUCCESS');
      expect(body.data).toHaveProperty('output');
    });

    it('should retrieve execution logs for an automation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/automations/${automationId1}/executions`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].status).toBe('SUCCESS');
    });
  });

  describe('DELETE /automations/:id', () => {
    it('should delete automation rule', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/automations/${disabledAutomationId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(204);
    });
  });
});

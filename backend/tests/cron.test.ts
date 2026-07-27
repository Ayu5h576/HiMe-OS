import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { ScheduleEvaluatorService } from '../src/services/automation/schedule-evaluator.service';
import { ExecutionLockService } from '../src/services/automation/execution-lock.service';
import { CronEngineService } from '../src/services/automation/cron-engine.service';
import { SchedulerService } from '../src/services/automation/scheduler.service';
import { AutomationRepository } from '../src/repositories/automation.repository';
import { TriggerType, ActionType, ConditionType } from '@prisma/client';

describe('Scheduled Cron Engine Module (Phase 17)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let projectId = '';
  let automationRepo: AutomationRepository;
  let cronEngine: CronEngineService;

  beforeAll(async () => {
    app = await buildApp();
    automationRepo = new AutomationRepository();
    cronEngine = new CronEngineService(automationRepo);

    // Register test user
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Cron Test Engineer',
        email: `cron-test-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    userToken = JSON.parse(regRes.payload).accessToken;

    // Create test project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        name: 'Cron Engine Test Workspace',
        description: 'Testing scheduled background automations',
      },
    });
    projectId = JSON.parse(projRes.payload).data.id;
  });

  beforeEach(() => {
    ExecutionLockService.clearAllLocks();
  });

  afterAll(async () => {
    SchedulerService.stop();
    await app.close();
  });

  describe('1. ScheduleEvaluatorService (Syntax & Due Evaluation)', () => {
    it('should validate every-minute schedule and presets', () => {
      expect(ScheduleEvaluatorService.validate('* * * * *')).toBe(true);
      expect(ScheduleEvaluatorService.validate('every-minute')).toBe(true);
      expect(ScheduleEvaluatorService.validate('hourly')).toBe(true);
      expect(ScheduleEvaluatorService.validate('daily')).toBe(true);
      expect(ScheduleEvaluatorService.validate('weekly')).toBe(true);
      expect(ScheduleEvaluatorService.validate('monthly')).toBe(true);
    });

    it('should reject invalid cron expressions', () => {
      expect(() => ScheduleEvaluatorService.validate('invalid cron expression')).toThrow();
      expect(() => ScheduleEvaluatorService.validate('99 * * * *')).toThrow();
      expect(() => ScheduleEvaluatorService.validate('* * * * * * *')).toThrow();
    });

    it('should evaluate every-minute schedule as due on any minute', () => {
      const date = new Date('2026-07-27T12:30:00Z');
      expect(ScheduleEvaluatorService.isDue('* * * * *', date)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('every-minute', date)).toBe(true);
    });

    it('should evaluate hourly schedule correctly', () => {
      const topOfHour = new Date('2026-07-27T14:00:00Z');
      const midHour = new Date('2026-07-27T14:15:00Z');

      expect(ScheduleEvaluatorService.isDue('0 * * * *', topOfHour)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('hourly', topOfHour)).toBe(true);

      expect(ScheduleEvaluatorService.isDue('0 * * * *', midHour)).toBe(false);
      expect(ScheduleEvaluatorService.isDue('hourly', midHour)).toBe(false);
    });

    it('should evaluate daily schedule correctly', () => {
      const midnight = new Date('2026-07-27T00:00:00Z');
      const noon = new Date('2026-07-27T12:00:00Z');

      expect(ScheduleEvaluatorService.isDue('0 0 * * *', midnight)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('daily', midnight)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('daily', noon)).toBe(false);
    });

    it('should evaluate weekly schedule correctly (Sunday 00:00)', () => {
      // 2026-07-26 is Sunday
      const sundayMidnight = new Date('2026-07-26T00:00:00Z');
      // 2026-07-27 is Monday
      const mondayMidnight = new Date('2026-07-27T00:00:00Z');

      expect(ScheduleEvaluatorService.isDue('0 0 * * 0', sundayMidnight)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('weekly', sundayMidnight)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('weekly', mondayMidnight)).toBe(false);
    });

    it('should evaluate monthly schedule correctly (1st day of month 00:00)', () => {
      const firstOfMonth = new Date('2026-08-01T00:00:00Z');
      const secondOfMonth = new Date('2026-08-02T00:00:00Z');

      expect(ScheduleEvaluatorService.isDue('0 0 1 * *', firstOfMonth)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('monthly', firstOfMonth)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('monthly', secondOfMonth)).toBe(false);
    });

    it('should evaluate custom cron expressions (step & range syntax)', () => {
      const min15 = new Date('2026-07-27T14:15:00Z');
      const min17 = new Date('2026-07-27T14:17:00Z');

      // Step: every 5 minutes
      expect(ScheduleEvaluatorService.isDue('*/5 * * * *', min15)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('*/5 * * * *', min17)).toBe(false);

      // Range: 14:30 on weekdays (Mon-Fri, 1-5)
      const mondayWorktime = new Date('2026-07-27T14:30:00Z'); // Mon
      const sundayWorktime = new Date('2026-07-26T14:30:00Z'); // Sun
      expect(ScheduleEvaluatorService.isDue('30 14 * * 1-5', mondayWorktime)).toBe(true);
      expect(ScheduleEvaluatorService.isDue('30 14 * * 1-5', sundayWorktime)).toBe(false);
    });

    it('should compute next execution date correctly', () => {
      const from = new Date('2026-07-27T10:15:30Z');
      const next = ScheduleEvaluatorService.getNextExecution('0 11 * * *', from);

      expect(next.getUTCHours()).toBe(11);
      expect(next.getUTCMinutes()).toBe(0);
    });
  });

  describe('2. ExecutionLockService (Concurrency & Duplicate Prevention)', () => {
    it('should acquire lock and prevent duplicate lock acquisition', () => {
      const autoId = 'auto-lock-test-1';
      expect(ExecutionLockService.acquireLock(autoId, 5000)).toBe(true);
      expect(ExecutionLockService.isLocked(autoId)).toBe(true);

      // Second attempt while locked must fail
      expect(ExecutionLockService.acquireLock(autoId, 5000)).toBe(false);

      // Release lock
      ExecutionLockService.releaseLock(autoId);
      expect(ExecutionLockService.isLocked(autoId)).toBe(false);
      expect(ExecutionLockService.acquireLock(autoId, 5000)).toBe(true);
    });
  });

  describe('3. CronEngineService (Execution & Business Rules)', () => {
    it('should ignore disabled automations during tick execution', async () => {
      const disabledAuto = await automationRepo.create(
        {
          name: 'Disabled Scheduled Rule',
          enabled: false,
          triggerType: TriggerType.SCHEDULED,
          conditionType: ConditionType.ALWAYS,
          actionType: ActionType.LOG_EVENT,
          schedule: '* * * * *',
        },
        projectId,
      );

      const targetTime = new Date('2026-07-27T12:00:00Z');
      const executions = await cronEngine.processDueAutomations(targetTime);

      const found = executions.find((e) => e.automationId === disabledAuto.id);
      expect(found).toBeUndefined();
    });

    it('should execute due SCHEDULED automation and record SUCCESS log', async () => {
      const activeAuto = await automationRepo.create(
        {
          name: 'Active Scheduled Rule',
          enabled: true,
          triggerType: TriggerType.SCHEDULED,
          conditionType: ConditionType.ALWAYS,
          actionType: ActionType.LOG_EVENT,
          schedule: '* * * * *',
          metadata: { message: 'Cron Engine Tick Logged' },
        },
        projectId,
      );

      const targetTime = new Date('2026-07-27T12:00:00Z');
      const executions = await cronEngine.processDueAutomations(targetTime);

      const found = executions.find((e) => e.automationId === activeAuto.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe('SUCCESS');
      expect(found?.input).toMatchObject({ trigger: 'SCHEDULED', schedule: '* * * * *' });
    });

    it('should prevent duplicate execution if two scheduler ticks overlap in same minute', async () => {
      const activeAuto = await automationRepo.create(
        {
          name: 'Overlap Prevention Rule',
          enabled: true,
          triggerType: TriggerType.SCHEDULED,
          conditionType: ConditionType.ALWAYS,
          actionType: ActionType.LOG_EVENT,
          schedule: '* * * * *',
        },
        projectId,
      );

      const targetTime = new Date('2026-07-27T12:05:00Z');
      const firstTickExecs = await cronEngine.processDueAutomations(targetTime);
      expect(firstTickExecs.some((e) => e.automationId === activeAuto.id)).toBe(true);

      // Immediate second tick in same minute should skip due to same-minute duplicate check
      const secondTickExecs = await cronEngine.processDueAutomations(targetTime);
      expect(secondTickExecs.some((e) => e.automationId === activeAuto.id)).toBe(false);
    });
  });

  describe('4. SchedulerService Lifecycle & Restart Recovery', () => {
    it('should start, report status, tick, and stop gracefully', async () => {
      expect(SchedulerService.getStatus().isRunning).toBe(false);

      const started = SchedulerService.start(60000);
      expect(started).toBe(true);
      expect(SchedulerService.getStatus().isRunning).toBe(true);

      const tickExecs = await SchedulerService.tick(new Date('2026-07-27T15:00:00Z'));
      expect(Array.isArray(tickExecs)).toBe(true);
      expect(SchedulerService.getStatus().totalTicksExecuted).toBeGreaterThan(0);

      SchedulerService.stop();
      expect(SchedulerService.getStatus().isRunning).toBe(false);
    });
  });
});

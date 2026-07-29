import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { SupervisorAgentService } from '../src/services/agents/supervisor.service';
import { AgentRegistry } from '../src/services/agents/registry.service';
import { AgentPlannerService } from '../src/services/agents/planner.service';
import { AgentExecutorService } from '../src/services/agents/executor.service';
import { AgentContextService } from '../src/services/agents/context.service';
import { AgentAggregatorService } from '../src/services/agents/aggregator.service';
import { AgentActivityService } from '../src/services/agents/activity.service';
import { IAgent, SubTask, AgentContext, AgentSubTaskResult } from '../src/services/agents/agent.interface';
import { initializeSystemTools } from '../src/services/ai/tools';

describe('Multi-Agent Orchestration Framework (Phase 21)', () => {
  let app: FastifyInstance;
  let userToken = '';
  let userId = '';
  let projectId = '';
  let conversationId = '';

  let supervisorService: SupervisorAgentService;
  let registry: AgentRegistry;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    registry = AgentRegistry.getInstance();
    supervisorService = new SupervisorAgentService();

    // Register test user & token
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Agent Framework User',
        email: `agent-user-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const regBody = JSON.parse(regRes.payload);
    userToken = regBody.accessToken;
    userId = regBody.user.id;

    // Create test project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userToken}` },
      payload: { name: 'Agent Workspace' },
    });
    projectId = JSON.parse(projRes.payload).data.id;

    // Create test conversation
    const convRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectId}/conversations`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: { title: 'Agent Collaboration Session' },
    });
    conversationId = JSON.parse(convRes.payload).data.id;
  });

  beforeEach(() => {
    AgentActivityService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Agent Registration & Management
  // ─────────────────────────────────────────────────────────────────────────

  describe('1. Agent Registration & Management', () => {
    it('should list default specialized agents in registry', () => {
      const agents = registry.listAgents();
      expect(agents.length).toBeGreaterThanOrEqual(7);

      const types = agents.map((a) => a.type);
      expect(types).toContain('planning');
      expect(types).toContain('coding');
      expect(types).toContain('memory');
      expect(types).toContain('research');
      expect(types).toContain('task');
      expect(types).toContain('device');
      expect(types).toContain('conversation');
    });

    it('should allow registering a custom specialized agent dynamically', () => {
      const customAgent: IAgent = {
        name: 'Security Audit Agent',
        type: 'security',
        description: 'Audits backend code for security vulnerabilities',
        capabilities: ['vulnerability_scanning', 'compliance_checking'],
        execute: async (task, _ctx) => ({
          subtaskId: task.id,
          agentType: 'security',
          success: true,
          output: { vulnerabilitiesFound: 0 },
          executedAt: new Date().toISOString(),
        }),
      };

      registry.registerAgent(customAgent);
      expect(registry.hasAgent('security')).toBe(true);

      const fetched = registry.getAgent('security');
      expect(fetched.name).toBe('Security Audit Agent');
    });

    it('should throw NotFoundError when fetching unregistered agent type', () => {
      expect(() => registry.getAgent('non-existent-type')).toThrow(/not registered/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Planning & Task Decomposition
  // ─────────────────────────────────────────────────────────────────────────

  describe('2. Planning & Task Decomposition', () => {
    it('should decompose user prompt into structured dependency-aware subtasks', async () => {
      const planner = new AgentPlannerService();
      const contextService = new AgentContextService();

      const context = contextService.createContext({
        userId,
        originalPrompt: 'Inspect system info, retrieve memory facts, and generate code',
      });

      const plan = await planner.createPlan(context.originalPrompt, context);

      expect(plan.id).toBeDefined();
      expect(plan.goal).toBe(context.originalPrompt);
      expect(plan.subtasks.length).toBeGreaterThanOrEqual(4);

      // Verify dependency hierarchy
      const planTask = plan.subtasks.find((t) => t.agentType === 'planning');
      expect(planTask).toBeDefined();
      expect(planTask?.dependencies.length).toBe(0);

      const codingTask = plan.subtasks.find((t) => t.agentType === 'coding');
      expect(codingTask).toBeDefined();
      expect(codingTask?.dependencies.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Shared Context Management
  // ─────────────────────────────────────────────────────────────────────────

  describe('3. Shared Context Management', () => {
    it('should maintain controlled shared state without mutating agent internal state', () => {
      const contextService = new AgentContextService();
      const context = contextService.createContext({
        userId,
        originalPrompt: 'Test shared context',
        projectId,
      });

      contextService.setSharedData(context, 'key1', 'value1');
      contextService.appendMemory(context, '[FACT] Test memory entry');

      expect(context.sharedData['key1']).toBe('value1');
      expect(context.memories).toContain('[FACT] Test memory entry');

      // Verify clone independence
      const cloned = contextService.cloneContext(context);
      cloned.sharedData['key1'] = 'mutated';

      expect(context.sharedData['key1']).toBe('value1');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Execution & Retry Mechanism
  // ─────────────────────────────────────────────────────────────────────────

  describe('4. Execution & Retry Mechanism', () => {
    it('should execute subtasks in order and handle retries on failure', async () => {
      const activityService = new AgentActivityService();
      const executor = new AgentExecutorService(registry, activityService, { maxRetries: 2 });
      const contextService = new AgentContextService();

      const context = contextService.createContext({ userId, originalPrompt: 'Test retry execution' });

      // Register a flaky agent that fails once then succeeds
      let callCount = 0;
      const flakyAgent: IAgent = {
        name: 'Flaky Agent',
        type: 'flaky',
        description: 'Fails on first attempt',
        capabilities: ['flaky_test'],
        execute: async (task) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Simulated transient failure');
          }
          return {
            subtaskId: task.id,
            agentType: 'flaky',
            success: true,
            output: { recovered: true, callCount },
            executedAt: new Date().toISOString(),
          };
        },
      };
      registry.registerAgent(flakyAgent);

      const plan = {
        id: `plan-flaky-${Date.now()}`,
        goal: 'Test flaky execution',
        subtasks: [
          {
            id: 'task-flaky-1',
            title: 'Flaky Task',
            description: 'Perform flaky action',
            agentType: 'flaky',
            status: 'PENDING' as const,
            dependencies: [],
            retryCount: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const results = await executor.executePlan(plan, context);
      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect((results[0].output as any).recovered).toBe(true);
      expect(callCount).toBe(2); // Failed once, succeeded on 1st retry
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Result Aggregation
  // ─────────────────────────────────────────────────────────────────────────

  describe('5. Result Aggregation', () => {
    it('should aggregate subtask results into a structured response', async () => {
      const aggregator = new AgentAggregatorService();
      const contextService = new AgentContextService();

      const context = contextService.createContext({ userId, originalPrompt: 'Aggregate test prompt' });
      contextService.appendMemory(context, '[PREFERENCE] Structured outputs required');

      const plan = {
        id: 'plan-agg-1',
        goal: 'Aggregate test prompt',
        subtasks: [
          {
            id: 'task-1',
            title: 'Planning',
            description: 'Plan steps',
            agentType: 'planning',
            status: 'COMPLETED' as const,
            dependencies: [],
            retryCount: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const subtaskResults: AgentSubTaskResult[] = [
        {
          subtaskId: 'task-1',
          agentType: 'planning',
          success: true,
          output: { step: 'planned' },
          executedAt: new Date().toISOString(),
        },
      ];

      const aggregated = await aggregator.aggregateResults(plan, subtaskResults, context);
      expect(aggregated).toContain('Multi-Agent Orchestration Summary');
      expect(aggregated).toContain('Aggregate test prompt');
      expect(aggregated).toContain('Structured outputs required');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Activity Logging
  // ─────────────────────────────────────────────────────────────────────────

  describe('6. Activity Logging', () => {
    it('should record activity logs during orchestration', () => {
      const activityService = new AgentActivityService();
      activityService.logActivity(userId, 'PLANNING_STARTED', { prompt: 'Log test' });
      activityService.logActivity(userId, 'PLAN_CREATED', { planId: 'plan-123' });

      const logs = activityService.getLogs(userId);
      expect(logs.length).toBe(2);
      expect(logs[0].type).toBe('PLAN_CREATED');
      expect(logs[1].type).toBe('PLANNING_STARTED');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Full Supervisor End-to-End Execution & HTTP API
  // ─────────────────────────────────────────────────────────────────────────

  describe('7. Supervisor End-to-End Execution & HTTP API', () => {
    it('should execute full multi-agent orchestration via SupervisorAgentService', async () => {
      const result = await supervisorService.executeOrchestration({
        userId,
        prompt: 'Inspect system info, check tasks, and generate code implementation',
        projectId,
        conversationId,
      });

      expect(result.planId).toBeDefined();
      expect(result.subtaskResults.length).toBeGreaterThan(0);
      expect(result.aggregatedResult).toContain('Multi-Agent Orchestration Summary');
      expect(result.subtaskResults.every((r) => r.success)).toBe(true);
    });

    it('POST /agents/execute should execute orchestration via HTTP API', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/agents/execute',
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          prompt: 'Retrieve memory facts and analyze connected devices',
          projectId,
          conversationId,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('planId');
      expect(body.data).toHaveProperty('aggregatedResult');
    });

    it('GET /agents should return registered specialized agents', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/agents',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(7);
    });

    it('GET /agents/status should return framework status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/agents/status',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.active).toBe(true);
      expect(body.data.registeredAgentCount).toBeGreaterThanOrEqual(7);
    });

    it('GET /agents/activity should return activity logs', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/agents/activity',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/agents',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

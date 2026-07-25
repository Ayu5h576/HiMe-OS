import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { ToolRegistry, ToolExecutor, initializeSystemTools } from '../src/services/ai/tools';
import { AIService } from '../src/services/ai/ai.service';
import { MemoryType, TaskPriority, TaskStatus } from '@prisma/client';

describe('Tool Calling Framework Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let userId1 = '';
  let userId2 = '';
  let projectIdUser1 = '';
  let taskId = '';
  let conversationId = '';
  let automationId = '';

  let aiService: AIService;
  let toolExecutor: ToolExecutor;
  let toolRegistry: ToolRegistry;

  beforeAll(async () => {
    app = await buildApp();
    initializeSystemTools();
    aiService = new AIService();
    toolExecutor = aiService.getToolExecutor();
    toolRegistry = aiService.getToolRegistry();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Tool User 1',
        email: `tool-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const body1 = JSON.parse(res1.payload);
    tokenUser1 = body1.accessToken;
    userId1 = body1.user.id;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Tool User 2',
        email: `tool-user2-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const body2 = JSON.parse(res2.payload);
    tokenUser2 = body2.accessToken;
    userId2 = body2.user.id;

    // Create a Project for User 1
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        name: 'Tool Integration Workspace',
        description: 'Testing tool calling framework',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;

    // Create an Automation rule for User 1
    const autoRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/automations`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        name: 'Log Event Tool Rule',
        enabled: true,
        triggerType: 'MANUAL',
        actionType: 'LOG_EVENT',
      },
    });
    automationId = JSON.parse(autoRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tool Registration & Definition Advertising', () => {
    it('should register standard HiMe OS system tools', () => {
      expect(toolRegistry.hasTool('createTask')).toBe(true);
      expect(toolRegistry.hasTool('updateTask')).toBe(true);
      expect(toolRegistry.hasTool('deleteTask')).toBe(true);
      expect(toolRegistry.hasTool('listTasks')).toBe(true);
      expect(toolRegistry.hasTool('createMemory')).toBe(true);
      expect(toolRegistry.hasTool('searchMemory')).toBe(true);
      expect(toolRegistry.hasTool('listProjects')).toBe(true);
      expect(toolRegistry.hasTool('getProject')).toBe(true);
      expect(toolRegistry.hasTool('createConversation')).toBe(true);
      expect(toolRegistry.hasTool('getConversation')).toBe(true);
      expect(toolRegistry.hasTool('runAutomation')).toBe(true);
      expect(toolRegistry.hasTool('listAutomations')).toBe(true);
    });

    it('should export tool definitions for AI provider advertising', () => {
      const definitions = toolRegistry.getToolDefinitions();
      expect(definitions.length).toBeGreaterThanOrEqual(12);

      const createTaskDef = definitions.find((d) => d.name === 'createTask');
      expect(createTaskDef).toBeDefined();
      expect(createTaskDef?.description).toContain('Create a new task');
    });

    it('should return error response for unknown tool execution', async () => {
      const response = await toolExecutor.executeTool('nonExistentTool', userId1, {});
      expect(response.success).toBe(false);
      expect(response.error).toContain('is not registered');
    });
  });

  describe('Task Tools Execution', () => {
    it('should execute createTask tool safely', async () => {
      const response = await toolExecutor.executeTool('createTask', userId1, {
        projectId: projectIdUser1,
        title: 'Task Created via Tool',
        description: 'Tool execution verification',
        priority: TaskPriority.HIGH,
      });

      expect(response.success).toBe(true);
      expect(response.result).toHaveProperty('id');
      const task = response.result as any;
      expect(task.title).toBe('Task Created via Tool');
      taskId = task.id;
    });

    it('should execute updateTask tool safely', async () => {
      const response = await toolExecutor.executeTool('updateTask', userId1, {
        taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      expect(response.success).toBe(true);
      const updated = response.result as any;
      expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should execute listTasks tool safely', async () => {
      const response = await toolExecutor.executeTool('listTasks', userId1, {
        projectId: projectIdUser1,
      });

      expect(response.success).toBe(true);
      const res = response.result as any;
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should execute deleteTask tool safely', async () => {
      const response = await toolExecutor.executeTool('deleteTask', userId1, {
        taskId,
      });

      expect(response.success).toBe(true);
      const res = response.result as any;
      expect(res.deleted).toBe(true);
    });
  });

  describe('Memory Tools Execution', () => {
    it('should execute createMemory tool safely', async () => {
      const response = await toolExecutor.executeTool('createMemory', userId1, {
        projectId: projectIdUser1,
        title: 'Tool Memory Fact',
        content: 'HiMe OS tool calling framework is fully operational.',
        type: MemoryType.FACT,
        importance: 8,
        tags: ['tool', 'ai'],
      });

      expect(response.success).toBe(true);
      const memory = response.result as any;
      expect(memory.title).toBe('Tool Memory Fact');
    });

    it('should execute searchMemory tool safely', async () => {
      const response = await toolExecutor.executeTool('searchMemory', userId1, {
        projectId: projectIdUser1,
        query: 'tool calling framework',
        topK: 3,
      });

      expect(response.success).toBe(true);
      expect(Array.isArray(response.result)).toBe(true);
    });
  });

  describe('Project & Conversation Tools Execution', () => {
    it('should execute listProjects tool', async () => {
      const response = await toolExecutor.executeTool('listProjects', userId1, {});
      expect(response.success).toBe(true);
      const res = response.result as any;
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('should execute getProject tool', async () => {
      const response = await toolExecutor.executeTool('getProject', userId1, {
        projectId: projectIdUser1,
      });

      expect(response.success).toBe(true);
      const proj = response.result as any;
      expect(proj.id).toBe(projectIdUser1);
    });

    it('should execute createConversation tool', async () => {
      const response = await toolExecutor.executeTool('createConversation', userId1, {
        projectId: projectIdUser1,
        title: 'Tool Conversation Thread',
      });

      expect(response.success).toBe(true);
      const conv = response.result as any;
      expect(conv.title).toBe('Tool Conversation Thread');
      conversationId = conv.id;
    });

    it('should execute getConversation tool', async () => {
      const response = await toolExecutor.executeTool('getConversation', userId1, {
        conversationId,
      });

      expect(response.success).toBe(true);
      const conv = response.result as any;
      expect(conv.id).toBe(conversationId);
    });
  });

  describe('Automation Tools Execution', () => {
    it('should execute listAutomations tool', async () => {
      const response = await toolExecutor.executeTool('listAutomations', userId1, {
        projectId: projectIdUser1,
      });

      expect(response.success).toBe(true);
      const res = response.result as any;
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should execute runAutomation tool', async () => {
      const response = await toolExecutor.executeTool('runAutomation', userId1, {
        automationId,
      });

      expect(response.success).toBe(true);
      const exec = response.result as any;
      expect(exec.status).toBe('SUCCESS');
    });
  });

  describe('Validation & Authorization Enforcement', () => {
    it('should reject invalid tool arguments with Zod validation error', async () => {
      const response = await toolExecutor.executeTool('createTask', userId1, {
        // missing required title & projectId
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid parameters for tool');
    });

    it('should reject unauthorized tool execution on another user project with HTTP 403 / 404', async () => {
      const response = await toolExecutor.executeTool('createTask', userId2, {
        projectId: projectIdUser1,
        title: 'Hacked Task',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });
});

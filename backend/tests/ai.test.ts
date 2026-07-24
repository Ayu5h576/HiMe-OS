import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('AI Provider Layer Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let conversationId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'AI Owner 1',
        email: `ai-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'AI Owner 2',
        email: `ai-user2-${Date.now()}@example.com`,
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
        name: 'AI Workspace Project',
        description: 'Project for AI provider tests',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;

    // Create a Conversation for User 1
    const convRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/conversations`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        title: 'AI Chat Test Conversation',
      },
    });
    conversationId = JSON.parse(convRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /ai/chat', () => {
    it('should reject unauthenticated AI chat request with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        payload: {
          conversationId,
          message: 'Hello AI',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject request missing conversationId or message with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId: '',
          message: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should generate normalized AI response and persist messages for default provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'Explain quantum computing in simple terms.',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('provider');
      expect(body.data).toHaveProperty('model');
      expect(body.data).toHaveProperty('message');
      expect(body.data).toHaveProperty('usage');
      expect(body.data.usage).toHaveProperty('promptTokens');
      expect(body.data.usage).toHaveProperty('completionTokens');
      expect(body.data.usage).toHaveProperty('totalTokens');
    });

    it('should support explicit provider override for Gemini provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'What is the speed of light?',
          provider: 'gemini',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.provider).toBe('gemini');
    });

    it('should support explicit provider override for Claude provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'Write a quick poem about code.',
          provider: 'claude',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.provider).toBe('claude');
    });

    it('should support explicit provider override for Ollama provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'Run local test.',
          provider: 'ollama',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.provider).toBe('ollama');
    });

    it('should reject unsupported provider override with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'Test message',
          provider: 'invalid-provider',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject access to another user conversation with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: {
          conversationId,
          message: 'Cross-user attempt',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should verify messages were persisted in conversation history', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});

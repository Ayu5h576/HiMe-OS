import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Conversation Engine API Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let conversationId = '';
  let messageId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Conv Owner 1',
        email: `conv-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Conv Owner 2',
        email: `conv-user2-${Date.now()}@example.com`,
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
        name: 'AI Conversation Workspace',
        description: 'Project for conversation engine tests',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Conversation CRUD ──

  describe('POST /projects/:projectId/conversations', () => {
    it('should reject unauthenticated conversation creation with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/conversations`,
        payload: { title: 'Unauthorized' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a conversation successfully with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/conversations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { title: 'Smart Home Planning' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Smart Home Planning');
      expect(body.data.projectId).toBe(projectIdUser1);
      expect(body.data).toHaveProperty('id');

      conversationId = body.data.id;
    });

    it('should reject creation with empty title with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/conversations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { title: '' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject creation by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/conversations`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { title: 'Hijacked Conversation' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:projectId/conversations', () => {
    it('should list conversations for project owner', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/conversations`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject listing by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/conversations`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /conversations/:id', () => {
    it('should retrieve conversation for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(conversationId);
      expect(body.data.title).toBe('Smart Home Planning');
    });

    it('should reject retrieval by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/conversations/non-existent-id',
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /conversations/:id', () => {
    it('should update conversation title for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { title: 'Updated Planning Session' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.title).toBe('Updated Planning Session');
    });

    it('should reject update by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { title: 'Hacked Title' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ── Message CRUD ──

  describe('POST /conversations/:id/messages', () => {
    it('should create a USER message in conversation with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          role: 'USER',
          content: 'Turn on the living room lights at sunset',
          metadata: { source: 'web_ui' },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.role).toBe('USER');
      expect(body.data.content).toBe('Turn on the living room lights at sunset');
      expect(body.data.conversationId).toBe(conversationId);
      expect(body.data.metadata).toEqual({ source: 'web_ui' });

      messageId = body.data.id;
    });

    it('should create an ASSISTANT message with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          role: 'ASSISTANT',
          content: 'I will set up a sunset trigger for your living room lights.',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.data.role).toBe('ASSISTANT');
    });

    it('should reject message with empty content with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { role: 'USER', content: '' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject message creation by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { role: 'USER', content: 'Injected message' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /conversations/:id/messages', () => {
    it('should list messages in chronological order with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);
      expect(body.data[0].role).toBe('USER');
      expect(body.data[1].role).toBe('ASSISTANT');
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBe(2);
    });

    it('should reject message listing by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}/messages`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ── Conversation Deletion (cascades messages) ──

  describe('DELETE /conversations/:id', () => {
    it('should reject delete by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should delete conversation for owner with HTTP 204', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 on subsequent GET for deleted conversation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/conversations/${conversationId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

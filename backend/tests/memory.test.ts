import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Memory Foundation API Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let memoryId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Memory Owner 1',
        email: `mem-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Memory Owner 2',
        email: `mem-user2-${Date.now()}@example.com`,
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
        name: 'AI Context & Knowledge Base',
        description: 'Project workspace for long-term memory store',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects/:projectId/memories', () => {
    it('should reject unauthenticated memory creation with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/memories`,
        payload: {
          title: 'User Preferences',
          content: 'Prefers dark mode',
          type: 'PREFERENCE',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a memory entry successfully with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/memories`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          title: 'User Interface Preferences',
          content: 'User prefers dark mode and HSL color tailoring.',
          type: 'PREFERENCE',
          importance: 8,
          tags: ['ui', 'theme', 'settings'],
          metadata: { category: 'user_settings' },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('User Interface Preferences');
      expect(body.data.type).toBe('PREFERENCE');
      expect(body.data.importance).toBe(8);
      expect(body.data.tags).toEqual(['ui', 'theme', 'settings']);
      expect(body.data.metadata).toEqual({ category: 'user_settings' });
      expect(body.data.projectId).toBe(projectIdUser1);
      expect(body.data).toHaveProperty('id');

      memoryId = body.data.id;
    });

    it('should reject memory creation with importance outside 1-10 range with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/memories`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          title: 'Invalid Memory',
          content: 'Test content',
          type: 'NOTE',
          importance: 15,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject memory creation by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/memories`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: {
          title: 'Injected Memory',
          content: 'Hacked content',
          type: 'NOTE',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:projectId/memories', () => {
    it('should list project memories for owner with pagination metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/memories`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(memoryId);
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter memories by type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/memories?type=PREFERENCE`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].type).toBe('PREFERENCE');
    });

    it('should filter memories by importance', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/memories?importance=8`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].importance).toBe(8);
    });

    it('should search memories by text query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/memories?search=theme`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(memoryId);
    });

    it('should reject access to another user project memories with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/memories`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /memories/:id', () => {
    it('should retrieve single memory details for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(memoryId);
      expect(body.data.title).toBe('User Interface Preferences');
    });

    it('should reject retrieval by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 404 for non-existent memory ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/memories/non-existent-memory-id',
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /memories/:id', () => {
    it('should update memory fields for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          title: 'Updated UI Preferences',
          importance: 9,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.title).toBe('Updated UI Preferences');
      expect(body.data.importance).toBe(9);
    });

    it('should reject update with invalid importance with HTTP 400', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          importance: 20,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject update by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { title: 'Hacked Memory' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /memories/:id', () => {
    it('should reject delete by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should delete memory for owner with HTTP 204', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 on subsequent GET for deleted memory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/memories/${memoryId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Task Management API Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let taskId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Task Master 1',
        email: `task-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Task Master 2',
        email: `task-user2-${Date.now()}@example.com`,
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
        name: 'AI Agent Architecture',
        description: 'Core tasks for HiMe OS AI workflow',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects/:projectId/tasks', () => {
    it('should reject unauthenticated task creation with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/tasks`,
        payload: { title: 'Unauthorized Task' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a task successfully under user project with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/tasks`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          title: 'Implement Vector Memory Pipeline',
          description: 'Connect pgvector embedding store to memory service',
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Implement Vector Memory Pipeline');
      expect(body.data.status).toBe('TODO');
      expect(body.data.priority).toBe('HIGH');
      expect(body.data.projectId).toBe(projectIdUser1);
      expect(body.data.completedAt).toBeNull();
      expect(body.data).toHaveProperty('id');

      taskId = body.data.id;
    });

    it('should reject creation if title is empty with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/tasks`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { title: '' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject task creation for non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${projectIdUser1}/tasks`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { title: 'Hacked Task' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:projectId/tasks', () => {
    it('should list project tasks for project owner with pagination metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/tasks`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(taskId);
      expect(body).toHaveProperty('pagination');
      expect(body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter tasks by status and priority', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/tasks?status=TODO&priority=HIGH`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].status).toBe('TODO');
      expect(body.data[0].priority).toBe('HIGH');
    });

    it('should reject access to another user project tasks with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}/tasks`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should retrieve single task details for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(taskId);
      expect(body.data.title).toBe('Implement Vector Memory Pipeline');
    });

    it('should reject retrieval by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 404 for non-existent task ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks/non-existent-task-id',
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /tasks/:id (Update & CompletedAt Logic)', () => {
    it('should update task status to COMPLETED and set completedAt timestamp', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          status: 'COMPLETED',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('COMPLETED');
      expect(body.data.completedAt).not.toBeNull();
    });

    it('should reset completedAt to null when task status is reopened to IN_PROGRESS', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          status: 'IN_PROGRESS',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('IN_PROGRESS');
      expect(body.data.completedAt).toBeNull();
    });

    it('should reject update by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { title: 'Hacked Title' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should reject delete by non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should delete task for owner with HTTP 204', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 on subsequent GET for deleted task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${taskId}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

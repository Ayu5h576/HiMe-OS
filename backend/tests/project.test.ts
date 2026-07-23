import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Project CRUD API Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Project Owner 1',
        email: `proj-owner1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Project Owner 2',
        email: `proj-owner2-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser2 = JSON.parse(res2.payload).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should reject unauthenticated project creation with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: { name: 'Unauthorized Project' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a project successfully for authenticated user with HTTP 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          name: 'Smart Home Automation',
          description: 'IoT triggers and routines workspace',
          color: '#3B82F6',
          icon: 'cpu',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Smart Home Automation');
      expect(body.data.description).toBe('IoT triggers and routines workspace');
      expect(body.data.color).toBe('#3B82F6');
      expect(body.data.icon).toBe('cpu');
      expect(body.data.isArchived).toBe(false);
      expect(body.data).toHaveProperty('id');

      projectIdUser1 = body.data.id;
    });

    it('should reject creation if name is missing with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: { description: 'Missing name' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /projects', () => {
    it('should return projects belonging to authenticated user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/projects',
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].id).toBe(projectIdUser1);
    });

    it('should return empty list for User 2 who has no projects yet', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/projects',
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  describe('GET /projects/:id', () => {
    it('should retrieve project details for the owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(projectIdUser1);
      expect(body.data.name).toBe('Smart Home Automation');
    });

    it('should reject access to another user project with HTTP 403', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update project properties for owner with HTTP 200', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          name: 'Updated Home Automation',
          isArchived: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.name).toBe('Updated Home Automation');
      expect(body.data.isArchived).toBe(true);
    });

    it('should reject update from non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: { name: 'Hacked Name' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should reject delete from non-owner with HTTP 403', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser2}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should delete project for owner with HTTP 204', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 on subsequent GET for deleted project', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser1}`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

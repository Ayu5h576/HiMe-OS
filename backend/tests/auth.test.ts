import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Authentication API Module', () => {
  let app: FastifyInstance;
  const testUser = {
    name: 'Test Engineer',
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };
  let accessToken = '';

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully and return user with token pair', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);

      expect(body).toHaveProperty('user');
      expect(body.user.name).toBe(testUser.name);
      expect(body.user.email).toBe(testUser.email.toLowerCase());
      expect(body.user.role).toBe('USER');
      expect(body.user.isActive).toBe(true);
      expect(body.user).not.toHaveProperty('password');
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');

      accessToken = body.accessToken;
    });

    it('should reject registration if email already exists with HTTP 409', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Conflict');
    });

    it('should reject registration if input validation fails with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'A',
          email: 'invalid-email',
          password: '123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.statusCode || body.success === false).toBeTruthy();
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate valid user credentials and return token pair', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe(testUser.email.toLowerCase());
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });

    it('should reject login with wrong password with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: 'WrongPassword!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('should reject login for non-existent email with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nobody@example.com',
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /auth/me (Protected Route)', () => {
    it('should return authenticated user profile when valid Bearer token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe(testUser.email.toLowerCase());
      expect(body.user.name).toBe(testUser.name);
      expect(body.user).not.toHaveProperty('password');
    });

    it('should reject request with missing Authorization header with HTTP 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Unauthorized');
    });

    it('should reject request with invalid/malformed token with HTTP 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer invalid.token.payload',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Unauthorized');
    });
  });
});

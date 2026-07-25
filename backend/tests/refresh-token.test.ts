import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Refresh Token Rotation Module', () => {
  let app: FastifyInstance;
  const testUser = {
    name: 'Refresh Token User',
    email: `refresh-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };
  let accessToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Token Issuance on Login & Register', () => {
    it('should issue refresh token on registration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(typeof body.refreshToken).toBe('string');
      expect(body.refreshToken.length).toBeGreaterThan(10);
    });

    it('should issue refresh token on login', async () => {
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
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(typeof body.refreshToken).toBe('string');

      accessToken = body.accessToken;
      refreshToken = body.refreshToken;
    });
  });

  describe('Token Rotation', () => {
    it('should rotate refresh token and return new token pair', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('user');
      expect(body.user.email).toBe(testUser.email.toLowerCase());

      // New refresh token should differ from old (unique JTI each time)
      expect(body.refreshToken).not.toBe(refreshToken);

      // Store new tokens for subsequent tests
      accessToken = body.accessToken;
      refreshToken = body.refreshToken;
    });

    it('should reject old refresh token after rotation with HTTP 401', async () => {
      // Login fresh to get a clean token
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const loginBody = JSON.parse(loginRes.payload);
      const originalToken = loginBody.refreshToken;

      // Rotate to get a new token
      const rotateRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: originalToken },
      });

      expect(rotateRes.statusCode).toBe(200);
      const rotated = JSON.parse(rotateRes.payload);
      refreshToken = rotated.refreshToken;

      // Now try using the old (already-rotated) token
      const reuseRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: originalToken },
      });

      expect(reuseRes.statusCode).toBe(401);
      const body = JSON.parse(reuseRes.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('Reuse Detection', () => {
    it('should revoke entire token family when old rotated token is reused', async () => {
      // Login fresh to get a clean family
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const loginBody = JSON.parse(loginRes.payload);
      const tokenA = loginBody.refreshToken;

      // Rotate A → B
      const rotateRes1 = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: tokenA },
      });
      expect(rotateRes1.statusCode).toBe(200);
      const tokenB = JSON.parse(rotateRes1.payload).refreshToken;

      // Rotate B → C
      const rotateRes2 = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: tokenB },
      });
      expect(rotateRes2.statusCode).toBe(200);
      const tokenC = JSON.parse(rotateRes2.payload).refreshToken;

      // Reuse token A (already rotated) → should revoke entire family
      const reuseRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: tokenA },
      });
      expect(reuseRes.statusCode).toBe(401);

      // Now token C (the latest) should ALSO be revoked because the family was invalidated
      const latestRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: tokenC },
      });
      expect(latestRes.statusCode).toBe(401);
    });
  });

  describe('Logout & Revocation', () => {
    it('should revoke refresh token on logout', async () => {
      // Login fresh
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const loginBody = JSON.parse(loginRes.payload);
      const logoutToken = loginBody.refreshToken;

      // Logout
      const logoutRes = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: { refreshToken: logoutToken },
      });

      expect(logoutRes.statusCode).toBe(200);
      const logoutBody = JSON.parse(logoutRes.payload);
      expect(logoutBody.success).toBe(true);
      expect(logoutBody.message).toBe('Logged out successfully');

      // Attempt to refresh with revoked token
      const refreshRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: logoutToken },
      });

      expect(refreshRes.statusCode).toBe(401);
    });

    it('should handle double logout gracefully (idempotent)', async () => {
      // Login fresh
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const logoutToken = JSON.parse(loginRes.payload).refreshToken;

      // First logout
      const res1 = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: { refreshToken: logoutToken },
      });
      expect(res1.statusCode).toBe(200);

      // Second logout (idempotent)
      const res2 = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: { refreshToken: logoutToken },
      });
      expect(res2.statusCode).toBe(200);
    });
  });

  describe('Input Validation & Error Handling', () => {
    it('should reject malformed/garbage refresh token with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: 'totally.invalid.garbage.token' },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });

    it('should reject empty refresh token with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: '' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject missing refreshToken field with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject missing refreshToken on logout with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Access Token Flow Unchanged', () => {
    it('should still authenticate GET /auth/me with valid access token after rotation', async () => {
      // Login to get a fresh access token
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const freshAccessToken = JSON.parse(loginRes.payload).accessToken;

      const meRes = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: `Bearer ${freshAccessToken}`,
        },
      });

      expect(meRes.statusCode).toBe(200);
      const body = JSON.parse(meRes.payload);
      expect(body.user.email).toBe(testUser.email.toLowerCase());
    });
  });
});

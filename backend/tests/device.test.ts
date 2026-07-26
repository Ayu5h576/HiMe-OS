import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Device Framework Module', () => {
  let app: FastifyInstance;
  let userAToken = '';
  let userBToken = '';
  let userAProjectId = '';
  let userBProjectId = '';
  let createdDeviceId = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User A
    const resA = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Device Owner A',
        email: `device-owner-a-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    userAToken = JSON.parse(resA.payload).accessToken;

    // Register User B
    const resB = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Device Owner B',
        email: `device-owner-b-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    userBToken = JSON.parse(resB.payload).accessToken;

    // User A creates project
    const projA = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { name: 'User A Smart Home Workspace' },
    });
    userAProjectId = JSON.parse(projA.payload).data.id;

    // User B creates project
    const projB = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { name: 'User B Smart Home Workspace' },
    });
    userBProjectId = JSON.parse(projB.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Device Registration & Defaults', () => {
    it('should register a new virtual device with default capabilities by type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          name: 'Living Room Smart Light',
          type: 'LIGHT',
          manufacturer: 'Philips Hue',
          model: 'A19 White',
          batteryLevel: 100,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('Living Room Smart Light');
      expect(body.data.type).toBe('LIGHT');
      expect(body.data.status).toBe('UNKNOWN');
      expect(body.data.connectionState).toBe('DISCONNECTED');
      expect(Array.isArray(body.data.capabilities)).toBe(true);
      expect(body.data.capabilities).toContain('turnOn');
      expect(body.data.capabilities).toContain('brightness');

      createdDeviceId = body.data.id;
    });

    it('should reject registration with invalid device type (HTTP 400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          name: 'Invalid Device',
          type: 'SUPER_ROBOT_TURRET',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('error');
    });

    it('should reject registration without device name (HTTP 400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          type: 'FAN',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Device Listing & Filtering', () => {
    it('should list devices for a project', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body).toHaveProperty('pagination');
    });

    it('should filter devices by type query parameter', async () => {
      // Create a Fan
      await app.inject({
        method: 'POST',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: { name: 'Bedroom Ceiling Fan', type: 'FAN' },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${userAProjectId}/devices?type=FAN`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.length).toBe(1);
      expect(body.data[0].type).toBe('FAN');
    });
  });

  describe('Device Details & Retrieval', () => {
    it('should retrieve a single device by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/devices/${createdDeviceId}`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.id).toBe(createdDeviceId);
    });

    it('should return 404 for non-existent device ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/devices/non-existent-device-id',
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Device State Transitions (Connect / Disconnect)', () => {
    it('should connect device and set status to ONLINE and connectionState to CONNECTED', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/devices/${createdDeviceId}/connect`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('ONLINE');
      expect(body.data.connectionState).toBe('CONNECTED');
      expect(body.data.lastSeen).not.toBeNull();
    });

    it('should disconnect device and set status to OFFLINE and connectionState to DISCONNECTED', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/devices/${createdDeviceId}/disconnect`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.status).toBe('OFFLINE');
      expect(body.data.connectionState).toBe('DISCONNECTED');
    });
  });

  describe('Device Update & Mutation', () => {
    it('should update device properties, status, and custom metadata', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/devices/${createdDeviceId}`,
        headers: { authorization: `Bearer ${userAToken}` },
        payload: {
          name: 'Renamed Smart Light',
          batteryLevel: 95,
          metadata: { location: 'Living Room Ceiling' },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.name).toBe('Renamed Smart Light');
      expect(body.data.batteryLevel).toBe(95);
      expect(body.data.metadata).toEqual({ location: 'Living Room Ceiling' });
    });
  });

  describe('Project Ownership & Access Control', () => {
    it('should prevent User B from accessing User A device (HTTP 403 or 404)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/devices/${createdDeviceId}`,
        headers: { authorization: `Bearer ${userBToken}` },
      });

      expect([403, 404]).toContain(response.statusCode);
    });

    it('should prevent User B from registering a device in User A project', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${userAProjectId}/devices`,
        headers: { authorization: `Bearer ${userBToken}` },
        payload: { name: 'Unauthorized Device' },
      });

      expect([403, 404]).toContain(response.statusCode);
    });
  });

  describe('Device Deletion', () => {
    it('should delete a device (HTTP 204)', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/devices/${createdDeviceId}`,
        headers: { authorization: `Bearer ${userAToken}` },
      });

      expect(response.statusCode).toBe(204);

      // Verify device no longer exists
      const getRes = await app.inject({
        method: 'GET',
        url: `/devices/${createdDeviceId}`,
        headers: { authorization: `Bearer ${userAToken}` },
      });
      expect(getRes.statusCode).toBe(404);
    });
  });
});

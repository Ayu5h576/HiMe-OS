import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { SimilarityService } from '../src/services/ai/vector/similarity.service';
import { RankingService } from '../src/services/ai/vector/ranking.service';
import { MemoryType } from '@prisma/client';

describe('Vector Search Infrastructure Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let tokenUser2 = '';
  let projectIdUser1 = '';
  let memoryId1 = '';

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Vector Owner 1',
        email: `vector-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Register User 2
    const res2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Vector Owner 2',
        email: `vector-user2-${Date.now()}@example.com`,
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
        name: 'Smart Home Project',
        description: 'IoT vector search testing',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;

    // Create Memory 1 for User 1
    const memRes1 = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/memories`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        title: 'Living Room Lighting Preference',
        content: 'User prefers 2700K warm lights at 50% brightness after 8 PM.',
        type: 'PREFERENCE',
        importance: 8,
        tags: ['lighting', 'living-room', 'warm'],
      },
    });
    memoryId1 = JSON.parse(memRes1.payload).data.id;

    // Create Memory 2 for User 1
    await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/memories`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        title: 'Kitchen Thermostat Target',
        content: 'Set kitchen climate to 22 degrees Celsius during daytime.',
        type: 'FACT',
        importance: 5,
        tags: ['thermostat', 'kitchen'],
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unit Math & Ranking Services', () => {
    it('should compute exact cosine similarity for parallel and orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];

      expect(SimilarityService.cosineSimilarity(vecA, vecB)).toBe(1);
      expect(SimilarityService.cosineSimilarity(vecA, vecC)).toBe(0);
    });

    it('should combine cosine similarity, importance, and recency in multi-factor ranking', () => {
      const dummyMemory = {
        id: 'mem-1',
        title: 'Test Memory',
        content: 'Test Content',
        type: MemoryType.NOTE,
        importance: 10,
        tags: [],
        metadata: null,
        embedding: [1, 0],
        projectId: 'proj-1',
        conversationId: null,
        messageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ranked = RankingService.rankMemory(dummyMemory, 0.9);
      expect(ranked.similarity).toBe(0.9);
      expect(ranked.importanceScore).toBe(1.0);
      expect(ranked.recencyScore).toBeGreaterThan(0.95);
      expect(ranked.finalScore).toBeGreaterThan(0.9);
    });
  });

  describe('POST /memories/search', () => {
    it('should reject unauthenticated search with HTTP 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/search',
        payload: {
          projectId: projectIdUser1,
          query: 'lighting preferences',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject search missing required fields with HTTP 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/search',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          projectId: '',
          query: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should perform vector similarity search and return ranked results', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/search',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          projectId: projectIdUser1,
          query: 'living room warm lights',
          threshold: 0.1,
          topK: 5,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('memory');
      expect(body.data[0]).toHaveProperty('similarity');
      expect(body.data[0]).toHaveProperty('finalScore');
    });

    it('should filter search results by memory type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/search',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          projectId: projectIdUser1,
          query: 'thermostat climate',
          type: 'FACT',
          threshold: 0.1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data.every((r: any) => r.memory.type === 'FACT')).toBe(true);
    });

    it('should reject access to another user project memories with HTTP 403', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/search',
        headers: { authorization: `Bearer ${tokenUser2}` },
        payload: {
          projectId: projectIdUser1,
          query: 'unauthorized query',
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('POST /memories/reindex', () => {
    it('should reindex all embeddings for project memories', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/memories/reindex',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          projectId: projectIdUser1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.reindexedCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /memories/:id/similar', () => {
    it('should find semantically similar memories for a given memory ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/memories/${memoryId1}/similar?threshold=0.1&topK=3`,
        headers: { authorization: `Bearer ${tokenUser1}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.every((r: any) => r.memory.id !== memoryId1)).toBe(true);
    });
  });
});

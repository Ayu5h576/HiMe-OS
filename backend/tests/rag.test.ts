import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { RAGMemoryFormatter } from '../src/services/ai/rag/rag-memory.formatter';
import { VectorSearchResult } from '../src/types/vector';
import { MemoryType } from '@prisma/client';

describe('RAG Memory Pipeline Module', () => {
  let app: FastifyInstance;
  let tokenUser1 = '';
  let projectIdUser1 = '';
  let conversationId = '';

  const dummyResults: VectorSearchResult[] = [
    {
      memory: {
        id: 'mem-1',
        title: 'Living Room Lights Preference',
        content: 'User prefers 2700K warm lights at 50% brightness after 8 PM.',
        type: MemoryType.PREFERENCE,
        importance: 8,
        tags: ['lighting'],
        metadata: null,
        embedding: [0.1, 0.2],
        projectId: 'proj-1',
        conversationId: null,
        messageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      similarity: 0.88,
      importanceScore: 0.8,
      recencyScore: 0.99,
      finalScore: 0.87,
    },
    {
      memory: {
        id: 'mem-1',
        title: 'Duplicate Living Room Lights Preference',
        content: 'User prefers 2700K warm lights at 50% brightness after 8 PM.',
        type: MemoryType.PREFERENCE,
        importance: 8,
        tags: ['lighting'],
        metadata: null,
        embedding: [0.1, 0.2],
        projectId: 'proj-1',
        conversationId: null,
        messageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      similarity: 0.88,
      importanceScore: 0.8,
      recencyScore: 0.99,
      finalScore: 0.87,
    },
    {
      memory: {
        id: 'mem-2',
        title: 'Low Importance Memory',
        content: 'User mentioned a random comment.',
        type: MemoryType.NOTE,
        importance: 1,
        tags: [],
        metadata: null,
        embedding: [0.1, 0.2],
        projectId: 'proj-1',
        conversationId: null,
        messageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      similarity: 0.85,
      importanceScore: 0.1,
      recencyScore: 0.99,
      finalScore: 0.6,
    },
    {
      memory: {
        id: 'mem-3',
        title: 'Low Similarity Memory',
        content: 'Completely unrelated text.',
        type: MemoryType.FACT,
        importance: 9,
        tags: [],
        metadata: null,
        embedding: [0.1, 0.2],
        projectId: 'proj-1',
        conversationId: null,
        messageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      similarity: 0.3,
      importanceScore: 0.9,
      recencyScore: 0.99,
      finalScore: 0.45,
    },
  ];

  beforeAll(async () => {
    app = await buildApp();

    // Register User 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'RAG Owner 1',
        email: `rag-user1-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    tokenUser1 = JSON.parse(res1.payload).accessToken;

    // Create a Project for User 1
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        name: 'RAG Home Workspace',
        description: 'Testing RAG Memory Pipeline',
      },
    });
    projectIdUser1 = JSON.parse(projRes.payload).data.id;

    // Create a Memory for User 1
    await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/memories`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        title: 'Bedroom Climate Preference',
        content: 'User prefers AC temperature set to 21 degrees Celsius at bedtime.',
        type: 'PREFERENCE',
        importance: 9,
        tags: ['ac', 'bedroom', 'climate'],
      },
    });

    // Create a Conversation for User 1
    const convRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser1}/conversations`,
      headers: { authorization: `Bearer ${tokenUser1}` },
      payload: {
        title: 'Bedtime Climate Routine',
      },
    });
    conversationId = JSON.parse(convRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unit RAG Memory Formatter & Deduplication', () => {
    it('should filter out duplicate memories and memories below importance/similarity threshold', () => {
      const filtered = RAGMemoryFormatter.filterAndDeduplicate(dummyResults, {
        maxMemories: 10,
        minImportance: 3,
        similarityThreshold: 0.75,
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].memory.id).toBe('mem-1');
    });

    it('should format RAG context into structured === Relevant Memories === section', () => {
      const filtered = RAGMemoryFormatter.filterAndDeduplicate(dummyResults, {
        minImportance: 3,
        similarityThreshold: 0.75,
      });
      const formatted = RAGMemoryFormatter.formatRAGContext(filtered);

      expect(formatted).toContain('=== Relevant Memories ===');
      expect(formatted).toContain('[PREFERENCE] (Importance: 8) Living Room Lights Preference');
    });
  });

  describe('End-to-End POST /ai/chat with RAG Memory Injection', () => {
    it('should retrieve relevant memories and inject them into AI prompt during chat request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/ai/chat',
        headers: { authorization: `Bearer ${tokenUser1}` },
        payload: {
          conversationId,
          message: 'What temperature should I set my bedroom AC to at bedtime?',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('message');
      expect(body.data).toHaveProperty('usage');
    });
  });
});

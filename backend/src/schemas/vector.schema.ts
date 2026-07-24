import { z } from 'zod';
import { MemoryType } from '@prisma/client';
import { memorySwaggerResponse } from './memory.schema';

export const vectorSearchSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  query: z.string().min(1, 'Search query is required'),
  conversationId: z.string().optional(),
  type: z.nativeEnum(MemoryType).optional(),
  minImportance: z.coerce.number().int().min(1).max(10).optional(),
  topK: z.coerce.number().int().min(1).max(100).optional(),
  threshold: z.coerce.number().min(0).max(1).optional(),
});

export type VectorSearchInput = z.infer<typeof vectorSearchSchema>;

export const reindexSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export type ReindexInput = z.infer<typeof reindexSchema>;

export const similarMemoryQuerySchema = z.object({
  topK: z.coerce.number().int().min(1).max(100).optional(),
  threshold: z.coerce.number().min(0).max(1).optional(),
});

export const vectorSearchResultSwaggerSchema = {
  type: 'object',
  properties: {
    memory: memorySwaggerResponse,
    similarity: { type: 'number', example: 0.8912 },
    importanceScore: { type: 'number', example: 0.8 },
    recencyScore: { type: 'number', example: 0.995 },
    finalScore: { type: 'number', example: 0.8839 },
  },
};

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const vectorSearchSwaggerSchema = {
  description: 'Perform semantic vector similarity search over project memories',
  tags: ['Vector Search'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['projectId', 'query'],
    properties: {
      projectId: { type: 'string', example: 'cm4proj123456' },
      query: { type: 'string', example: 'living room light controls' },
      conversationId: { type: 'string', example: 'cm4conv123456' },
      type: { type: 'string', enum: Object.values(MemoryType), example: 'PREFERENCE' },
      minImportance: { type: 'integer', example: 5 },
      topK: { type: 'integer', example: 10 },
      threshold: { type: 'number', example: 0.75 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: vectorSearchResultSwaggerSchema,
        },
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const reindexSwaggerSchema = {
  description: 'Reindex embeddings for all project memories',
  tags: ['Vector Search'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'string', example: 'cm4proj123456' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            reindexedCount: { type: 'integer', example: 15 },
          },
        },
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const similarMemorySwaggerSchema = {
  description: 'Find semantically similar memories for a given memory ID',
  tags: ['Vector Search'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', example: 'cm4mem123456' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      topK: { type: 'integer', example: 5 },
      threshold: { type: 'number', example: 0.75 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: vectorSearchResultSwaggerSchema,
        },
      },
    },
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

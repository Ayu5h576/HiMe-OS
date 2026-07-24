import { z } from 'zod';
import { MemoryType } from '@prisma/client';

export const createMemorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  type: z.nativeEnum(MemoryType),
  importance: z
    .number({ invalid_type_error: 'Importance must be a number' })
    .int('Importance must be an integer')
    .min(1, 'Importance must be between 1 and 10')
    .max(10, 'Importance must be between 1 and 10')
    .default(1),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
  conversationId: z.string().optional(),
  messageId: z.string().optional(),
});

export const updateMemorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  type: z.nativeEnum(MemoryType).optional(),
  importance: z
    .number({ invalid_type_error: 'Importance must be a number' })
    .int('Importance must be an integer')
    .min(1, 'Importance must be between 1 and 10')
    .max(10, 'Importance must be between 1 and 10')
    .optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export const getMemoriesQuerySchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(MemoryType).optional(),
  importance: z
    .coerce
    .number()
    .int('Importance must be an integer')
    .min(1, 'Importance must be between 1 and 10')
    .max(10, 'Importance must be between 1 and 10')
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'importance', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const memoryIdSchema = z.object({
  id: z.string().min(1, 'Memory ID is required'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;
export type GetMemoriesQueryInput = z.infer<typeof getMemoriesQuerySchema>;

// OpenAPI Swagger Schemas
export const memorySwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
    type: {
      type: 'string',
      enum: ['NOTE', 'FACT', 'PREFERENCE', 'SUMMARY', 'TASK', 'REFERENCE', 'SYSTEM'],
    },
    importance: { type: 'integer', minimum: 1, maximum: 10 },
    tags: { type: 'array', items: { type: 'string' } },
    metadata: { type: 'object', nullable: true, additionalProperties: true },
    projectId: { type: 'string' },
    conversationId: { type: 'string', nullable: true },
    messageId: { type: 'string', nullable: true },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const createMemorySwaggerSchema = {
  description: 'Create a new memory entry for a project',
  tags: ['Memories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  body: {
    type: 'object',
    required: ['title', 'content', 'type'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200, example: 'User Preferences' },
      content: {
        type: 'string',
        example: 'User prefers dark mode and HSL tailoring for interface components.',
      },
      type: {
        type: 'string',
        enum: ['NOTE', 'FACT', 'PREFERENCE', 'SUMMARY', 'TASK', 'REFERENCE', 'SYSTEM'],
        example: 'PREFERENCE',
      },
      importance: { type: 'integer', minimum: 1, maximum: 10, example: 8 },
      tags: { type: 'array', items: { type: 'string' }, example: ['ui', 'theme', 'settings'] },
      metadata: { type: 'object', nullable: true, example: { category: 'ui_settings' } },
      conversationId: { type: 'string', nullable: true },
      messageId: { type: 'string', nullable: true },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: memorySwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getProjectMemoriesSwaggerSchema = {
  description:
    'List memories for a project supporting search (title, content, tags), filtering by type/importance, sorting, and pagination',
  tags: ['Memories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string' },
      type: {
        type: 'string',
        enum: ['NOTE', 'FACT', 'PREFERENCE', 'SUMMARY', 'TASK', 'REFERENCE', 'SYSTEM'],
      },
      importance: { type: 'integer', minimum: 1, maximum: 10 },
      sortBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'importance', 'title'] },
      sortOrder: { type: 'string', enum: ['asc', 'desc'] },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: memorySwaggerResponse },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getMemoryByIdSwaggerSchema = {
  description: 'Retrieve a single memory by ID',
  tags: ['Memories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: memorySwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const updateMemorySwaggerSchema = {
  description: 'Update memory fields',
  tags: ['Memories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      content: { type: 'string', minLength: 1 },
      type: {
        type: 'string',
        enum: ['NOTE', 'FACT', 'PREFERENCE', 'SUMMARY', 'TASK', 'REFERENCE', 'SYSTEM'],
      },
      importance: { type: 'integer', minimum: 1, maximum: 10 },
      tags: { type: 'array', items: { type: 'string' } },
      metadata: { type: 'object', nullable: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: memorySwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    404: errorResponse('Not Found'),
  },
};

export const deleteMemorySwaggerSchema = {
  description: 'Delete a memory',
  tags: ['Memories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  response: {
    204: { type: 'null', description: 'Memory deleted successfully' },
    404: errorResponse('Not Found'),
  },
};

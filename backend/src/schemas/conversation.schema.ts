import { z } from 'zod';
import { MessageRole } from '@prisma/client';

// ── Conversation Schemas ──

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const conversationIdSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

// ── Message Schemas ──

export const createMessageSchema = z.object({
  role: z.nativeEnum(MessageRole),
  content: z.string().min(1, 'Content is required'),
  metadata: z.record(z.unknown()).optional(),
});

export const getMessagesQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('50'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;

// ── OpenAPI Swagger Schemas ──

export const conversationSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    projectId: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export const messageSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    role: { type: 'string', enum: ['USER', 'ASSISTANT', 'SYSTEM', 'TOOL'] },
    content: { type: 'string' },
    metadata: { type: 'object', nullable: true, additionalProperties: true },
    conversationId: { type: 'string' },
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

export const createConversationSwaggerSchema = {
  description: 'Create a new conversation under a project',
  tags: ['Conversations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200, example: 'Smart Home Planning' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: conversationSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getProjectConversationsSwaggerSchema = {
  description: 'List all conversations for a project',
  tags: ['Conversations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: conversationSwaggerResponse },
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getConversationByIdSwaggerSchema = {
  description: 'Retrieve a single conversation by ID',
  tags: ['Conversations'],
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
        data: conversationSwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const updateConversationSwaggerSchema = {
  description: 'Update conversation title',
  tags: ['Conversations'],
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
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: conversationSwaggerResponse,
      },
    },
    404: errorResponse('Not Found'),
  },
};

export const deleteConversationSwaggerSchema = {
  description: 'Delete a conversation and all its messages',
  tags: ['Conversations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  response: {
    204: { type: 'null', description: 'Conversation deleted successfully' },
    404: errorResponse('Not Found'),
  },
};

export const createMessageSwaggerSchema = {
  description: 'Create a new message in a conversation',
  tags: ['Messages'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  body: {
    type: 'object',
    required: ['role', 'content'],
    properties: {
      role: {
        type: 'string',
        enum: ['USER', 'ASSISTANT', 'SYSTEM', 'TOOL'],
        example: 'USER',
      },
      content: { type: 'string', example: 'Turn on the living room lights at sunset' },
      metadata: { type: 'object', nullable: true, example: { source: 'web_ui' } },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: messageSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getMessagesSwaggerSchema = {
  description: 'List messages in a conversation (chronological order)',
  tags: ['Messages'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: messageSwaggerResponse },
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

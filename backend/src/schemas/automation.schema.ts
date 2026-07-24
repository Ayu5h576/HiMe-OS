import { z } from 'zod';
import { TriggerType, ConditionType, ActionType, ExecutionStatus } from '@prisma/client';

export const createAutomationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(true),
  triggerType: z.nativeEnum(TriggerType).default(TriggerType.MANUAL),
  conditionType: z.nativeEnum(ConditionType).default(ConditionType.ALWAYS),
  actionType: z.nativeEnum(ActionType).default(ActionType.LOG_EVENT),
  schedule: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAutomationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  enabled: z.boolean().optional(),
  triggerType: z.nativeEnum(TriggerType).optional(),
  conditionType: z.nativeEnum(ConditionType).optional(),
  actionType: z.nativeEnum(ActionType).optional(),
  schedule: z.string().max(100).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export const getAutomationsQuerySchema = z.object({
  enabled: z
    .string()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined))
    .optional(),
  triggerType: z.nativeEnum(TriggerType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const runAutomationSchema = z.object({
  input: z.record(z.unknown()).optional(),
});

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
export type GetAutomationsQueryInput = z.infer<typeof getAutomationsQuerySchema>;
export type RunAutomationInput = z.infer<typeof runAutomationSchema>;

// OpenAPI Swagger Schemas
export const automationSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    enabled: { type: 'boolean' },
    triggerType: { type: 'string', enum: Object.values(TriggerType) },
    conditionType: { type: 'string', enum: Object.values(ConditionType) },
    actionType: { type: 'string', enum: Object.values(ActionType) },
    schedule: { type: 'string', nullable: true },
    metadata: { type: 'object', nullable: true },
    projectId: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export const executionSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    automationId: { type: 'string' },
    status: { type: 'string', enum: Object.values(ExecutionStatus) },
    executedAt: { type: 'string' },
    input: { type: 'object', nullable: true },
    output: { type: 'object', nullable: true },
    error: { type: 'string', nullable: true },
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

export const createAutomationSwaggerSchema = {
  description: 'Create a new automation rule for a project',
  tags: ['Automations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'Auto-Create Task on Keyword' },
      description: { type: 'string', example: 'Creates a task when specific keyword is detected' },
      enabled: { type: 'boolean', example: true },
      triggerType: { type: 'string', enum: Object.values(TriggerType), example: 'MANUAL' },
      conditionType: { type: 'string', enum: Object.values(ConditionType), example: 'ALWAYS' },
      actionType: { type: 'string', enum: Object.values(ActionType), example: 'LOG_EVENT' },
      schedule: { type: 'string', example: '0 9 * * *' },
      metadata: { type: 'object', example: { actionPayload: { title: 'New Task' } } },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: automationSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const getProjectAutomationsSwaggerSchema = {
  description: 'List automations for a project',
  tags: ['Automations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  querystring: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      triggerType: { type: 'string', enum: Object.values(TriggerType) },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: automationSwaggerResponse },
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
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const getAutomationByIdSwaggerSchema = {
  description: 'Retrieve a single automation by ID',
  tags: ['Automations'],
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
        data: automationSwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const updateAutomationSwaggerSchema = {
  description: 'Update automation rule fields',
  tags: ['Automations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      enabled: { type: 'boolean' },
      triggerType: { type: 'string', enum: Object.values(TriggerType) },
      conditionType: { type: 'string', enum: Object.values(ConditionType) },
      actionType: { type: 'string', enum: Object.values(ActionType) },
      schedule: { type: 'string', nullable: true },
      metadata: { type: 'object', nullable: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: automationSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const deleteAutomationSwaggerSchema = {
  description: 'Delete an automation rule',
  tags: ['Automations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  response: {
    204: { type: 'null', description: 'Automation deleted successfully' },
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const runAutomationSwaggerSchema = {
  description: 'Manually trigger automation execution',
  tags: ['Automations'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  body: {
    type: 'object',
    properties: {
      input: { type: 'object' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: executionSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

export const getExecutionsSwaggerSchema = {
  description: 'List execution logs for an automation',
  tags: ['Automations'],
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
        data: { type: 'array', items: executionSwaggerResponse },
      },
    },
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

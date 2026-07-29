import { z } from 'zod';

// ── Zod Schemas ────────────────────────────────────────────────────────────

export const executeOrchestrationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  projectId: z.string().optional(),
  conversationId: z.string().optional(),
  initialData: z.record(z.unknown()).optional(),
});

export const getActivityLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ExecuteOrchestrationInputSchema = z.infer<typeof executeOrchestrationSchema>;
export type GetActivityLogsQuerySchema = z.infer<typeof getActivityLogsQuerySchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const executeOrchestrationSwaggerSchema = {
  description: 'Execute multi-agent orchestration for a complex user prompt across specialized AI sub-agents',
  tags: ['Multi-Agent Framework'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', example: 'Inspect system info, retrieve user preferences, and generate a task report.' },
      projectId: { type: 'string', example: 'proj-123' },
      conversationId: { type: 'string', example: 'conv-456' },
      initialData: { type: 'object', additionalProperties: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object', additionalProperties: true },
      },
    },
    400: errorResponse('Bad Request'),
    401: errorResponse('Unauthorized'),
  },
};

export const listAgentsSwaggerSchema = {
  description: 'List all registered specialized AI agents and their capabilities',
  tags: ['Multi-Agent Framework'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

export const getAgentStatusSwaggerSchema = {
  description: 'Get Multi-Agent Orchestration Framework health and active agent status',
  tags: ['Multi-Agent Framework'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object', additionalProperties: true },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

export const getActivityLogsSwaggerSchema = {
  description: 'Get audit activity logs for multi-agent planning and subtask executions',
  tags: ['Multi-Agent Framework'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, example: 50 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

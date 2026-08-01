import { z } from 'zod';

export const setOllamaModelSchema = z.object({
  model: z.string().min(1, 'model is required'),
});

export type SetOllamaModelInput = z.infer<typeof setOllamaModelSchema>;

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const listProvidersSwaggerSchema = {
  description: 'List all registered AI providers, reachability, and model settings',
  tags: ['AI Engine'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'ollama' },
              enabled: { type: 'boolean', example: true },
              reachable: { type: 'boolean', example: true },
              activeModel: { type: 'string', example: 'llama3.1' },
              availableModels: {
                type: 'array',
                items: { type: 'string' },
                example: ['llama3.1', 'mistral'],
              },
            },
          },
        },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

export const getOllamaModelsSwaggerSchema = {
  description: 'Retrieve detailed list of installed models on local Ollama instance',
  tags: ['AI Engine'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'llama3.1:latest' },
              model: { type: 'string', example: 'llama3.1' },
              modifiedAt: { type: 'string', example: '2026-07-28T10:00:00Z' },
              size: { type: 'number', example: 4700000000 },
              digest: { type: 'string', example: 'sha256:123456789' },
            },
          },
        },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

export const getOllamaStatusSwaggerSchema = {
  description: 'Retrieve detailed health, latency, active model, and memory footprint of Ollama server',
  tags: ['AI Engine'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            reachable: { type: 'boolean', example: true },
            enabled: { type: 'boolean', example: true },
            host: { type: 'string', example: 'http://localhost:11434' },
            version: { type: 'string', example: '0.3.14' },
            status: { type: 'string', example: 'HEALTHY' },
            activeModel: { type: 'string', example: 'llama3.1' },
            installedModelsCount: { type: 'number', example: 4 },
            installedModels: {
              type: 'array',
              items: { type: 'string' },
              example: ['llama3.1', 'mistral'],
            },
            latencyMs: { type: 'number', example: 12 },
            memoryUsageBytes: { type: 'number', example: 8500000000 },
            lastChecked: { type: 'string', example: '2026-07-29T12:00:00Z' },
          },
        },
      },
    },
    401: errorResponse('Unauthorized'),
  },
};

export const setOllamaModelSwaggerSchema = {
  description: 'Set/switch the active default model for Ollama provider',
  tags: ['AI Engine'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['model'],
    properties: {
      model: { type: 'string', example: 'llama3.1' },
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
            activeModel: { type: 'string', example: 'llama3.1' },
          },
        },
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
  },
};

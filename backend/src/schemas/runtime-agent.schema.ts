import { z } from 'zod';

// ── Zod Validation Schemas ──────────────────────────────────────────────────

export const launchAppSchema = z.object({
  appName: z.string().min(1, 'appName string is required'),
});

export const closeAppSchema = z.object({
  target: z.string().min(1, 'Target app name or PID string is required'),
});

export const systemActionSchema = z.object({
  action: z.enum([
    'launch_app',
    'close_app',
    'kill_process',
    'restart_process',
    'shutdown',
    'restart',
    'sleep',
    'lock',
    'volume_up',
    'volume_down',
    'mute',
    'brightness',
  ]),
  target: z.string().optional(),
  value: z.number().optional(),
});

export type LaunchAppInput = z.infer<typeof launchAppSchema>;
export type CloseAppInput = z.infer<typeof closeAppSchema>;
export type SystemActionInput = z.infer<typeof systemActionSchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const getRuntimeAgentStatusSwaggerSchema = {
  description: 'Get operational status, heartbeat, and health of native desktop runtime agent',
  tags: ['Native Runtime Agent'],
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

export const getRuntimeAgentSystemSwaggerSchema = {
  description: 'Get real-time system metrics (OS, CPU, RAM, Storage, Battery, active window)',
  tags: ['Native Runtime Agent'],
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

export const getRuntimeAgentProcessesSwaggerSchema = {
  description: 'Get a list of currently running system processes and CPU/RAM usage',
  tags: ['Native Runtime Agent'],
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

export const launchAppSwaggerSchema = {
  description: 'Launch an allowlisted desktop application on the user machine',
  tags: ['Native Runtime Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['appName'],
    properties: {
      appName: { type: 'string', example: 'notepad' },
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

export const closeAppSwaggerSchema = {
  description: 'Close or terminate an active application or process',
  tags: ['Native Runtime Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['target'],
    properties: {
      target: { type: 'string', example: 'notepad' },
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

export const systemActionSwaggerSchema = {
  description: 'Execute native system command (lock, sleep, volume, brightness, shutdown)',
  tags: ['Native Runtime Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['action'],
    properties: {
      action: {
        type: 'string',
        enum: [
          'launch_app',
          'close_app',
          'kill_process',
          'restart_process',
          'shutdown',
          'restart',
          'sleep',
          'lock',
          'volume_up',
          'volume_down',
          'mute',
          'brightness',
        ],
        example: 'lock',
      },
      target: { type: 'string', example: 'notepad' },
      value: { type: 'number', example: 80 },
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

export const getRuntimeAgentBatterySwaggerSchema = {
  description: 'Get system battery status and charging metrics',
  tags: ['Native Runtime Agent'],
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

export const getRuntimeAgentEventsSwaggerSchema = {
  description: 'Retrieve real-time event logs (battery, process, file, network, health)',
  tags: ['Native Runtime Agent'],
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

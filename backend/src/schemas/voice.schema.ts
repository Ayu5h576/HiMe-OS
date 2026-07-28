import { z } from 'zod';

// ── Voice Schemas ──────────────────────────────────────────────────────────

export const startVoiceSessionSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  sttProvider: z.string().optional(),
  ttsProvider: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const endVoiceSessionSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});

export const transcribeAudioSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  audio: z.object({
    data: z.string().min(1, 'audio data string is required'),
    format: z.enum(['wav', 'mp3', 'ogg', 'webm', 'raw']).default('wav'),
    encoding: z.enum(['base64', 'buffer']).default('base64'),
    sampleRate: z.number().optional(),
    channels: z.number().optional(),
    durationSeconds: z.number().optional(),
  }),
  sessionId: z.string().optional(),
  sttOptions: z
    .object({
      language: z.string().optional(),
      hints: z.array(z.string()).optional(),
    })
    .optional(),
  ttsOptions: z
    .object({
      voice: z.string().optional(),
      speed: z.number().optional(),
      pitch: z.number().optional(),
      format: z.enum(['wav', 'mp3', 'ogg', 'webm', 'raw']).optional(),
      language: z.string().optional(),
    })
    .optional(),
  sttProvider: z.string().optional(),
  ttsProvider: z.string().optional(),
  generateAudioResponse: z.boolean().default(true),
});

export const synthesizeSpeechSchema = z.object({
  text: z.string().min(1, 'text is required'),
  sessionId: z.string().optional(),
  options: z
    .object({
      voice: z.string().optional(),
      speed: z.number().optional(),
      pitch: z.number().optional(),
      format: z.enum(['wav', 'mp3', 'ogg', 'webm', 'raw']).optional(),
      language: z.string().optional(),
    })
    .optional(),
  provider: z.string().optional(),
});

// ── Inferred Types ─────────────────────────────────────────────────────────

export type StartVoiceSessionInput = z.infer<typeof startVoiceSessionSchema>;
export type EndVoiceSessionInput = z.infer<typeof endVoiceSessionSchema>;
export type TranscribeAudioInput = z.infer<typeof transcribeAudioSchema>;
export type SynthesizeSpeechInput = z.infer<typeof synthesizeSpeechSchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const startSessionSwaggerSchema = {
  description: 'Start a voice session attached to a conversation',
  tags: ['Voice Interface'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['conversationId'],
    properties: {
      conversationId: { type: 'string', example: 'conv-12345' },
      sttProvider: { type: 'string', example: 'mock' },
      ttsProvider: { type: 'string', example: 'mock' },
      metadata: { type: 'object', additionalProperties: true },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object', additionalProperties: true },
      },
    },
    400: errorResponse('Bad Request'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const endSessionSwaggerSchema = {
  description: 'End an active voice session',
  tags: ['Voice Interface'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', example: 'vsession-12345' },
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
    404: errorResponse('Not Found'),
  },
};

export const transcribeSwaggerSchema = {
  description: 'Transcribe audio payload, process via Conversation Engine & AI Provider, and optionally synthesize audio response',
  tags: ['Voice Interface'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['conversationId', 'audio'],
    properties: {
      conversationId: { type: 'string', example: 'conv-12345' },
      audio: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'U29tZSBtb2NrIGF1ZGlvIGJhc2U2NA==' },
          format: { type: 'string', enum: ['wav', 'mp3', 'ogg', 'webm', 'raw'], example: 'wav' },
          encoding: { type: 'string', enum: ['base64', 'buffer'], example: 'base64' },
        },
      },
      sessionId: { type: 'string', example: 'vsession-12345' },
      generateAudioResponse: { type: 'boolean', example: true },
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
    404: errorResponse('Not Found'),
  },
};

export const synthesizeSwaggerSchema = {
  description: 'Synthesize text into speech audio metadata and base64 payload',
  tags: ['Voice Interface'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['text'],
    properties: {
      text: { type: 'string', example: 'Hello from HiMe OS Voice Interface!' },
      sessionId: { type: 'string', example: 'vsession-12345' },
      options: {
        type: 'object',
        properties: {
          voice: { type: 'string', example: 'mock-voice-en-US-f1' },
          speed: { type: 'number', example: 1.0 },
        },
      },
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

export const getProvidersSwaggerSchema = {
  description: 'List available Speech-to-Text and Text-to-Speech voice providers',
  tags: ['Voice Interface'],
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

import { z } from 'zod';

// ── Zod Schemas ────────────────────────────────────────────────────────────

export const imagePayloadSchema = z.object({
  data: z.string().min(1, 'Image base64 data is required'),
  format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'gif']).default('png'),
  encoding: z.enum(['base64', 'buffer']).default('base64'),
  width: z.number().optional(),
  height: z.number().optional(),
  filename: z.string().optional(),
});

export const analyzeImageSchema = z.object({
  image: imagePayloadSchema,
  provider: z.string().optional(),
  options: z
    .object({
      includeOCR: z.boolean().optional(),
      includeObjects: z.boolean().optional(),
      includeScene: z.boolean().optional(),
      includeQR: z.boolean().optional(),
      includeScreenshot: z.boolean().optional(),
    })
    .optional(),
});

export const ocrSchema = z.object({
  image: imagePayloadSchema,
  provider: z.string().optional(),
  options: z
    .object({
      language: z.string().optional(),
      detectLayout: z.boolean().optional(),
    })
    .optional(),
});

export const objectsSchema = z.object({
  image: imagePayloadSchema,
  provider: z.string().optional(),
});

export const sceneSchema = z.object({
  image: imagePayloadSchema,
  provider: z.string().optional(),
});

export const screenshotSchema = z.object({
  image: imagePayloadSchema,
  provider: z.string().optional(),
});

export type AnalyzeImageInput = z.infer<typeof analyzeImageSchema>;
export type OCRInput = z.infer<typeof ocrSchema>;
export type ObjectsInput = z.infer<typeof objectsSchema>;
export type SceneInput = z.infer<typeof sceneSchema>;
export type ScreenshotInput = z.infer<typeof screenshotSchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const analyzeImageSwaggerSchema = {
  description: 'Perform multi-modal computer vision analysis on an image payload',
  tags: ['Computer Vision'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          format: { type: 'string', enum: ['png', 'jpeg', 'jpg', 'webp', 'gif'], example: 'png' },
          encoding: { type: 'string', enum: ['base64', 'buffer'], example: 'base64' },
        },
      },
      provider: { type: 'string', example: 'mock' },
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

export const ocrSwaggerSchema = {
  description: 'Extract optical character recognition text from document, receipt, or whiteboard image',
  tags: ['Computer Vision'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          format: { type: 'string', example: 'png' },
        },
      },
      provider: { type: 'string', example: 'mock' },
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

export const objectsSwaggerSchema = {
  description: 'Detect and locate physical objects with bounding boxes',
  tags: ['Computer Vision'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
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

export const sceneSwaggerSchema = {
  description: 'Generate structured scene description, environment context, and relationship map',
  tags: ['Computer Vision'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
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

export const screenshotSwaggerSchema = {
  description: 'Perform deep perception analysis on desktop, code editor, or terminal screenshot',
  tags: ['Computer Vision'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { type: 'string', example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
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

export const getVisionProvidersSwaggerSchema = {
  description: 'List available computer vision perception providers',
  tags: ['Computer Vision'],
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

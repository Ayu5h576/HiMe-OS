import { z } from 'zod';

// ── Zod Validation Schemas ──────────────────────────────────────────────────

export const openBrowserSchema = z.object({
  url: z.string().optional(),
  provider: z.string().optional(),
  options: z
    .object({
      headless: z.boolean().optional(),
      viewport: z.object({ width: z.number(), height: z.number() }).optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export const navigateBrowserSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  url: z.string().min(1, 'Target URL is required'),
  action: z.enum(['open', 'navigate', 'back', 'forward', 'refresh']).default('navigate'),
  provider: z.string().optional(),
});

export const actionBrowserSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  action: z.enum(['click', 'type', 'select', 'hover', 'scroll', 'wait', 'upload']),
  selector: z.string().optional(),
  text: z.string().optional(),
  value: z.string().optional(),
  filePath: z.string().optional(),
  scrollOffset: z.object({ x: z.number(), y: z.number() }).optional(),
  waitTimeMs: z.number().optional(),
  provider: z.string().optional(),
});

export const extractDOMSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  provider: z.string().optional(),
  options: z
    .object({
      includeTitle: z.boolean().optional(),
      includeMeta: z.boolean().optional(),
      includeLinks: z.boolean().optional(),
      includeButtons: z.boolean().optional(),
      includeForms: z.boolean().optional(),
      includeTables: z.boolean().optional(),
      includeLists: z.boolean().optional(),
      includeImages: z.boolean().optional(),
    })
    .optional(),
});

export const screenshotBrowserSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.enum(['full_page', 'viewport', 'element']).default('viewport'),
  selector: z.string().optional(),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  provider: z.string().optional(),
});

export const sessionBrowserSchema = z.object({
  sessionId: z.string().optional(),
  provider: z.string().optional(),
});

export type OpenBrowserInput = z.infer<typeof openBrowserSchema>;
export type NavigateBrowserInput = z.infer<typeof navigateBrowserSchema>;
export type ActionBrowserInput = z.infer<typeof actionBrowserSchema>;
export type ExtractDOMInput = z.infer<typeof extractDOMSchema>;
export type ScreenshotBrowserInput = z.infer<typeof screenshotBrowserSchema>;
export type SessionBrowserInput = z.infer<typeof sessionBrowserSchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const openBrowserSwaggerSchema = {
  description: 'Create a new browser session and optionally navigate to an initial URL',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      url: { type: 'string', example: 'https://example.com' },
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

export const navigateBrowserSwaggerSchema = {
  description: 'Navigate an existing browser session (navigate, back, forward, refresh)',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId', 'url'],
    properties: {
      sessionId: { type: 'string', example: 'browsess-1785304000-abc12' },
      url: { type: 'string', example: 'https://example.com/docs' },
      action: { type: 'string', enum: ['open', 'navigate', 'back', 'forward', 'refresh'], example: 'navigate' },
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

export const actionBrowserSwaggerSchema = {
  description: 'Perform an element action (click, type, select, hover, scroll, wait, upload)',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId', 'action'],
    properties: {
      sessionId: { type: 'string', example: 'browsess-1785304000-abc12' },
      action: { type: 'string', enum: ['click', 'type', 'select', 'hover', 'scroll', 'wait', 'upload'], example: 'click' },
      selector: { type: 'string', example: '#submit-btn' },
      text: { type: 'string', example: 'hello' },
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

export const extractBrowserSwaggerSchema = {
  description: 'Extract structured DOM elements (links, buttons, forms, tables, metadata)',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', example: 'browsess-1785304000-abc12' },
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

export const screenshotBrowserSwaggerSchema = {
  description: 'Capture a page, viewport, or element screenshot from an active session',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', example: 'browsess-1785304000-abc12' },
      type: { type: 'string', enum: ['full_page', 'viewport', 'element'], example: 'viewport' },
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

export const getSessionBrowserSwaggerSchema = {
  description: 'Retrieve status or list active browser sessions for authenticated user',
  tags: ['Browser Automation'],
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

export const closeSessionBrowserSwaggerSchema = {
  description: 'Close an active browser session and release resources',
  tags: ['Browser Automation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', example: 'browsess-1785304000-abc12' },
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

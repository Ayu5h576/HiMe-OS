import { z } from 'zod';

// ── File System Schemas ────────────────────────────────────────────────────

export const listFilesQuerySchema = z.object({
  path: z.string().default('.'),
});

export const readFileQuerySchema = z.object({
  path: z.string().min(1, 'File path is required'),
  encoding: z.enum(['utf8', 'base64', 'ascii', 'hex']).default('utf8'),
});

export const createFolderSchema = z.object({
  path: z.string().min(1, 'Directory path is required'),
});

export const copyFileSchema = z.object({
  source: z.string().min(1, 'Source path is required'),
  destination: z.string().min(1, 'Destination path is required'),
});

export const moveFileSchema = z.object({
  source: z.string().min(1, 'Source path is required'),
  destination: z.string().min(1, 'Destination path is required'),
});

export const renameFileSchema = z.object({
  path: z.string().min(1, 'File path is required'),
  newName: z.string().min(1, 'New name is required').max(255),
});

export const deleteFileSchema = z.object({
  path: z.string().min(1, 'File path is required'),
});

export const searchFilesQuerySchema = z.object({
  path: z.string().default('.'),
  pattern: z.string().min(1, 'Search pattern is required'),
  maxDepth: z.coerce.number().int().min(1).max(10).default(3),
});

// ── Application Schemas ────────────────────────────────────────────────────

export const launchApplicationSchema = z.object({
  name: z.string().min(1, 'Application name is required').max(200),
});

export const checkProcessSchema = z.object({
  pid: z.number().int().positive('PID must be a positive integer'),
});

// ── Clipboard Schemas ──────────────────────────────────────────────────────

export const writeClipboardSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10_000),
});

export const clipboardHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

// ── Notification Schemas ───────────────────────────────────────────────────

export const desktopNotifySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM']).default('INFO'),
  projectId: z.string().optional(),
});

// ── Inferred Types ─────────────────────────────────────────────────────────

export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>;
export type ReadFileQuery = z.infer<typeof readFileQuerySchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type CopyFileInput = z.infer<typeof copyFileSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type SearchFilesQuery = z.infer<typeof searchFilesQuerySchema>;
export type LaunchApplicationInput = z.infer<typeof launchApplicationSchema>;
export type CheckProcessInput = z.infer<typeof checkProcessSchema>;
export type WriteClipboardInput = z.infer<typeof writeClipboardSchema>;
export type ClipboardHistoryQuery = z.infer<typeof clipboardHistoryQuerySchema>;
export type DesktopNotifyInput = z.infer<typeof desktopNotifySchema>;

// ── OpenAPI / Swagger Schemas ──────────────────────────────────────────────

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const getSystemInfoSwaggerSchema = {
  description: 'Retrieve full host system information (OS, CPU, RAM, network, uptime)',
  tags: ['Desktop Agent'],
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

export const getHealthSwaggerSchema = {
  description: 'Retrieve desktop health metrics (CPU load, memory usage, process health)',
  tags: ['Desktop Agent'],
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

export const listFilesSwaggerSchema = {
  description: 'List directory contents within the scoped desktop filesystem root',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      path: { type: 'string', example: '.' },
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
    400: errorResponse('Bad Request'),
    401: errorResponse('Unauthorized'),
  },
};

export const readFileSwaggerSchema = {
  description: 'Read file content from the scoped desktop filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    required: ['path'],
    properties: {
      path: { type: 'string', example: 'documents/notes.txt' },
      encoding: { type: 'string', enum: ['utf8', 'base64', 'ascii', 'hex'], example: 'utf8' },
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

export const createFolderSwaggerSchema = {
  description: 'Create a new directory in the scoped desktop filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['path'],
    properties: {
      path: { type: 'string', example: 'documents/new-folder' },
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
  },
};

export const copyFileSwaggerSchema = {
  description: 'Copy a file from source to destination within the scoped filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['source', 'destination'],
    properties: {
      source: { type: 'string', example: 'documents/file.txt' },
      destination: { type: 'string', example: 'backup/file.txt' },
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

export const moveFileSwaggerSchema = {
  description: 'Move a file from source to destination within the scoped filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['source', 'destination'],
    properties: {
      source: { type: 'string', example: 'documents/file.txt' },
      destination: { type: 'string', example: 'archive/file.txt' },
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

export const renameFileSwaggerSchema = {
  description: 'Rename a file or directory within the scoped filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['path', 'newName'],
    properties: {
      path: { type: 'string', example: 'documents/oldname.txt' },
      newName: { type: 'string', example: 'newname.txt' },
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

export const deleteFileSwaggerSchema = {
  description: 'Delete a file (safe mode: directories and executables are blocked)',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    required: ['path'],
    properties: {
      path: { type: 'string', example: 'documents/old-file.txt' },
    },
  },
  response: {
    204: { type: 'null', description: 'File deleted successfully' },
    400: errorResponse('Bad Request'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const searchFilesSwaggerSchema = {
  description: 'Search files by name pattern within the scoped filesystem',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    required: ['pattern'],
    properties: {
      path: { type: 'string', example: '.' },
      pattern: { type: 'string', example: '.txt' },
      maxDepth: { type: 'integer', minimum: 1, maximum: 10, example: 3 },
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
    400: errorResponse('Bad Request'),
    401: errorResponse('Unauthorized'),
  },
};

export const launchApplicationSwaggerSchema = {
  description: 'Launch an allowed desktop application by name',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'notepad' },
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

export const listProcessesSwaggerSchema = {
  description: 'List currently running system processes',
  tags: ['Desktop Agent'],
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

export const readClipboardSwaggerSchema = {
  description: 'Read the current clipboard content',
  tags: ['Desktop Agent'],
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

export const writeClipboardSwaggerSchema = {
  description: 'Write content to the clipboard',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', example: 'Hello from HiMe OS!' },
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

export const clipboardHistorySwaggerSchema = {
  description: 'Retrieve clipboard history (most recent first)',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 20, example: 10 },
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

export const takeScreenshotSwaggerSchema = {
  description: 'Capture a desktop screenshot (abstraction layer — adapter required for real capture)',
  tags: ['Desktop Agent'],
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

export const desktopNotifySwaggerSchema = {
  description: 'Send a desktop notification via the Notification Gateway',
  tags: ['Desktop Agent'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['title', 'message'],
    properties: {
      title: { type: 'string', example: 'HiMe OS Alert' },
      message: { type: 'string', example: 'Your task has been completed.' },
      type: { type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM'] },
      projectId: { type: 'string' },
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

export const getAgentStatusSwaggerSchema = {
  description: 'Get the Desktop Agent status and capabilities list',
  tags: ['Desktop Agent'],
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

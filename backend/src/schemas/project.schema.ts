import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid 6-character hex code (e.g. #3B82F6)')
    .optional(),
  icon: z.string().max(50).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid 6-character hex code')
    .optional(),
  icon: z.string().max(50).optional(),
  isArchived: z.boolean().optional(),
});

export const projectIdSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// OpenAPI Swagger Schemas
export const projectSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    color: { type: 'string', nullable: true },
    icon: { type: 'string', nullable: true },
    isArchived: { type: 'boolean' },
    ownerId: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export const createProjectSwaggerSchema = {
  description: 'Create a new workspace project container',
  tags: ['Projects'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'HiMe Automation' },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Smart home IoT triggers and routines',
      },
      color: { type: 'string', example: '#3B82F6' },
      icon: { type: 'string', example: 'cpu' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: projectSwaggerResponse,
      },
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Validation Error' },
      },
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  },
};

export const getProjectsSwaggerSchema = {
  description: 'Retrieve all projects owned by authenticated user',
  tags: ['Projects'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: projectSwaggerResponse,
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  },
};

export const getProjectByIdSwaggerSchema = {
  description: 'Retrieve a specific project by ID',
  tags: ['Projects'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: projectSwaggerResponse,
      },
    },
    401: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  },
};

export const updateProjectSwaggerSchema = {
  description: 'Update project properties',
  tags: ['Projects'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
      color: { type: 'string' },
      icon: { type: 'string' },
      isArchived: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: projectSwaggerResponse,
      },
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  },
};

export const deleteProjectSwaggerSchema = {
  description: 'Delete a project',
  tags: ['Projects'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    204: {
      type: 'null',
      description: 'Project deleted successfully',
    },
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  },
};

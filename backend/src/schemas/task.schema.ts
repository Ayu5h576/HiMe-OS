import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .datetime({ message: 'dueDate must be a valid ISO 8601 date string' })
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .datetime({ message: 'dueDate must be a valid ISO 8601 date string' })
    .or(z.date())
    .transform((val) => new Date(val))
    .nullable()
    .optional(),
});

export const getTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('20'),
});

export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTasksQueryInput = z.infer<typeof getTasksQuerySchema>;

// OpenAPI Swagger Schemas
export const taskSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    dueDate: { type: 'string', nullable: true },
    completedAt: { type: 'string', nullable: true },
    projectId: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export const createTaskSwaggerSchema = {
  description: 'Create a new task under a project',
  tags: ['Tasks'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200, example: 'Implement MQTT Broker' },
      description: {
        type: 'string',
        maxLength: 1000,
        example: 'Configure local EMQX node and topic security',
      },
      status: {
        type: 'string',
        enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        example: 'TODO',
      },
      priority: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        example: 'HIGH',
      },
      dueDate: { type: 'string', format: 'date-time', example: '2026-08-01T12:00:00.000Z' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: taskSwaggerResponse,
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
    404: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  },
};

export const getProjectTasksSwaggerSchema = {
  description: 'List project tasks supporting status, priority, search, sorting, and pagination',
  tags: ['Tasks'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      search: { type: 'string' },
      sortBy: { type: 'string', enum: ['createdAt', 'dueDate', 'priority', 'status', 'title'] },
      sortOrder: { type: 'string', enum: ['asc', 'desc'] },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: taskSwaggerResponse,
        },
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

export const getTaskByIdSwaggerSchema = {
  description: 'Retrieve a single task by ID',
  tags: ['Tasks'],
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
        data: taskSwaggerResponse,
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

export const updateTaskSwaggerSchema = {
  description: 'Update task details or transition completion status',
  tags: ['Tasks'],
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
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', maxLength: 1000, nullable: true },
      status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      dueDate: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: taskSwaggerResponse,
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

export const deleteTaskSwaggerSchema = {
  description: 'Delete a task',
  tags: ['Tasks'],
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
      description: 'Task deleted successfully',
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

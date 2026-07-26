import { z } from 'zod';
import { DeviceType, DeviceStatus, ConnectionState } from '@prisma/client';

export const createDeviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.nativeEnum(DeviceType).default(DeviceType.CUSTOM),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  firmwareVersion: z.string().max(50).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  capabilities: z.array(z.string()).or(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateDeviceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.nativeEnum(DeviceType).optional(),
  manufacturer: z.string().max(100).nullable().optional(),
  model: z.string().max(100).nullable().optional(),
  firmwareVersion: z.string().max(50).nullable().optional(),
  status: z.nativeEnum(DeviceStatus).optional(),
  connectionState: z.nativeEnum(ConnectionState).optional(),
  batteryLevel: z.number().int().min(0).max(100).nullable().optional(),
  lastSeen: z.coerce.date().nullable().optional(),
  capabilities: z.array(z.string()).or(z.record(z.unknown())).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export const getDevicesQuerySchema = z.object({
  type: z.nativeEnum(DeviceType).optional(),
  status: z.nativeEnum(DeviceStatus).optional(),
  connectionState: z.nativeEnum(ConnectionState).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type GetDevicesQueryInput = z.infer<typeof getDevicesQuerySchema>;

// OpenAPI Swagger Schemas
export const deviceSwaggerResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string', enum: Object.values(DeviceType) },
    manufacturer: { type: 'string', nullable: true },
    model: { type: 'string', nullable: true },
    firmwareVersion: { type: 'string', nullable: true },
    status: { type: 'string', enum: Object.values(DeviceStatus) },
    connectionState: { type: 'string', enum: Object.values(ConnectionState) },
    batteryLevel: { type: 'integer', nullable: true },
    lastSeen: { type: 'string', nullable: true },
    capabilities: { nullable: true },
    metadata: { type: 'object', additionalProperties: true, nullable: true },
    projectId: { type: 'string' },
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

export const createDeviceSwaggerSchema = {
  description: 'Register a new device under a project',
  tags: ['Devices'],
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
      name: { type: 'string', example: 'Living Room Smart Lamp' },
      type: { type: 'string', enum: Object.values(DeviceType), example: 'LIGHT' },
      manufacturer: { type: 'string', example: 'Philips Hue' },
      model: { type: 'string', example: 'A19 White & Color' },
      firmwareVersion: { type: 'string', example: 'v1.4.2' },
      batteryLevel: { type: 'integer', example: 100 },
      capabilities: {
        type: 'array',
        items: { type: 'string' },
        example: ['turnOn', 'turnOff', 'brightness'],
      },
      metadata: { type: 'object', example: { ip: '192.168.1.50' } },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: deviceSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const getProjectDevicesSwaggerSchema = {
  description: 'List all registered devices for a project',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['projectId'],
    properties: { projectId: { type: 'string' } },
  },
  querystring: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: Object.values(DeviceType) },
      status: { type: 'string', enum: Object.values(DeviceStatus) },
      connectionState: { type: 'string', enum: Object.values(ConnectionState) },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: deviceSwaggerResponse },
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
    404: errorResponse('Not Found'),
  },
};

export const getDeviceByIdSwaggerSchema = {
  description: 'Retrieve details of a single registered device',
  tags: ['Devices'],
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
        data: deviceSwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const updateDeviceSwaggerSchema = {
  description: 'Update device metadata, capabilities, or status',
  tags: ['Devices'],
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
      type: { type: 'string', enum: Object.values(DeviceType) },
      manufacturer: { type: 'string', nullable: true },
      model: { type: 'string', nullable: true },
      firmwareVersion: { type: 'string', nullable: true },
      status: { type: 'string', enum: Object.values(DeviceStatus) },
      connectionState: { type: 'string', enum: Object.values(ConnectionState) },
      batteryLevel: { type: 'integer', nullable: true },
      capabilities: { type: 'array', items: { type: 'string' }, nullable: true },
      metadata: { type: 'object', nullable: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: deviceSwaggerResponse,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const deleteDeviceSwaggerSchema = {
  description: 'Delete a registered device',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } },
  },
  response: {
    204: { type: 'null', description: 'Device deleted successfully' },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const connectDeviceSwaggerSchema = {
  description:
    'Simulate connecting a virtual device (sets status ONLINE and connectionState CONNECTED)',
  tags: ['Devices'],
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
        data: deviceSwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

export const disconnectDeviceSwaggerSchema = {
  description:
    'Simulate disconnecting a virtual device (sets status OFFLINE and connectionState DISCONNECTED)',
  tags: ['Devices'],
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
        data: deviceSwaggerResponse,
      },
    },
    401: errorResponse('Unauthorized'),
    404: errorResponse('Not Found'),
  },
};

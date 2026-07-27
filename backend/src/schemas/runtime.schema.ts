import { z } from 'zod';

export const SimulateEventSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  eventType: z.enum([
    'MOTION_DETECTED',
    'TEMPERATURE_CHANGE',
    'HUMIDITY_CHANGE',
    'BATTERY_LOW',
    'CONNECTION_LOST',
    'CONNECTION_RESTORED',
    'DEVICE_ERROR',
    'CAPABILITY_CHANGED',
  ]),
  payload: z.record(z.unknown()).optional(),
});

export type SimulateEventInput = z.infer<typeof SimulateEventSchema>;

export const GetActivityQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  projectId: z.string().optional(),
  category: z.enum(['AI', 'AUTOMATION', 'DEVICE', 'MEMORY', 'TASK', 'NOTIFICATION', 'SYSTEM']).optional(),
  fromDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  toDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export type GetActivityQueryInput = z.infer<typeof GetActivityQuerySchema>;

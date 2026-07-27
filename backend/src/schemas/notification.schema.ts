import { z } from 'zod';

export const NotificationTypeEnum = z.enum([
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'SYSTEM',
  'AUTOMATION',
  'DEVICE',
  'AI',
  'TASK',
  'MEMORY',
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const CreateNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  type: NotificationTypeEnum.default('INFO'),
  projectId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

export const GetNotificationsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  type: NotificationTypeEnum.optional(),
  read: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  projectId: z.string().optional(),
});

export type GetNotificationsQueryInput = z.infer<typeof GetNotificationsQuerySchema>;

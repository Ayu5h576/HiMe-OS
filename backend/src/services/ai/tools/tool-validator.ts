import { z } from 'zod';
import { BadRequestError } from '../../../utils/errors';

export class ToolValidator {
  static validate<T>(schema: z.ZodSchema<T>, params: unknown, toolName: string): T {
    const result = schema.safeParse(params);
    if (!result.success) {
      const details = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      throw new BadRequestError(`Invalid parameters for tool '${toolName}': ${details}`);
    }
    return result.data;
  }
}

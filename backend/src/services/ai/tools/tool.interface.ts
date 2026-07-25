import { z } from 'zod';
import { IToolResponse } from './tool-response';

export interface IToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly parameterSchema: z.ZodObject<z.ZodRawShape>;

  execute(userId: string, params: unknown): Promise<IToolResponse>;
  getDefinition(): IToolDefinition;
}

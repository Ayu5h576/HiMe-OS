export interface IToolResponse {
  toolName: string;
  success: boolean;
  result?: unknown;
  error?: string;
  executedAt: string;
}

export class ToolResponseFormatter {
  static success(toolName: string, result: unknown): IToolResponse {
    return {
      toolName,
      success: true,
      result,
      executedAt: new Date().toISOString(),
    };
  }

  static error(toolName: string, error: string): IToolResponse {
    return {
      toolName,
      success: false,
      error,
      executedAt: new Date().toISOString(),
    };
  }
}

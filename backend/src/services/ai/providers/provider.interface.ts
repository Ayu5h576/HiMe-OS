import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';

export interface IAIProvider {
  readonly name: AIProviderName;
  generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse>;
  streamResponse?(options: GenerateOptions): AsyncGenerator<string, void, unknown>;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<boolean>;
}

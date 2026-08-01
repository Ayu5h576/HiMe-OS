import { AIProviderName, GenerateOptions, NormalizedAIResponse, OllamaHealthStatus } from '../../../types/ai';

export interface IAIProvider {
  readonly name: AIProviderName;
  generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse>;
  streamResponse?(options: GenerateOptions): AsyncGenerator<string, void, unknown>;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<boolean>;
  getDetailedStatus?(): Promise<OllamaHealthStatus | unknown>;
  setActiveModel?(model: string): void;
  getActiveModel?(): string;
  generateEmbedding?(prompt: string): Promise<number[]>;
}

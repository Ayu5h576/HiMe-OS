import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';

export class OpenAIProvider implements IAIProvider {
  readonly name: AIProviderName = 'openai';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.openai;
    const promptTokens = Math.max(1, Math.ceil(options.prompt.length / 4));
    const completionMessage = `OpenAI (${model}) response to: "${options.prompt}"`;
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));

    return {
      id: `chatcmpl-openai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider: this.name,
      model,
      message: completionMessage,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  async listModels(): Promise<string[]> {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

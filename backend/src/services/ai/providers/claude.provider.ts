import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';

export class ClaudeProvider implements IAIProvider {
  readonly name: AIProviderName = 'claude';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.claude;
    const promptTokens = Math.max(1, Math.ceil(options.prompt.length / 4));
    const completionMessage = `Claude (${model}) response to: "${options.prompt}"`;
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));

    return {
      id: `chatcmpl-claude-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

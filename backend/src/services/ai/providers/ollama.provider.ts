import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';

export class OllamaProvider implements IAIProvider {
  readonly name: AIProviderName = 'ollama';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.ollama;
    const promptText = options.normalizedPrompt
      ? options.normalizedPrompt.messages.map((m) => m.content).join('\n')
      : options.prompt;

    const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
    const completionMessage = `Ollama (${model}) response to: "${options.prompt}"`;
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));

    return {
      id: `chatcmpl-ollama-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    return ['llama3.2', 'mistral', 'codellama', 'phi3'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

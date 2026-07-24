import { IAIProvider } from './providers/provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AIProviderName } from '../../types/ai';
import { AI_CONFIG } from '../../config/ai';
import { BadRequestError } from '../../utils/errors';

export class ProviderManager {
  private providers: Map<AIProviderName, IAIProvider> = new Map();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OllamaProvider());
  }

  public registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProvider(providerName?: string): IAIProvider {
    const targetName = (providerName || AI_CONFIG.defaultProvider) as AIProviderName;
    const provider = this.providers.get(targetName);

    if (!provider) {
      throw new BadRequestError(`Unsupported AI provider: '${targetName}'`);
    }

    return provider;
  }

  public getActiveProviderName(): AIProviderName {
    return AI_CONFIG.defaultProvider as AIProviderName;
  }

  public listRegisteredProviders(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }
}

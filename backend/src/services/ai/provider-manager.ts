import { IAIProvider } from './providers/provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AIProviderName, AIProviderStatus } from '../../types/ai';
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

  public getOllamaProvider(): OllamaProvider {
    const provider = this.providers.get('ollama');
    if (!provider || !(provider instanceof OllamaProvider)) {
      throw new BadRequestError('Ollama provider is not registered');
    }
    return provider as OllamaProvider;
  }

  public getActiveProviderName(): AIProviderName {
    return AI_CONFIG.defaultProvider as AIProviderName;
  }

  public listRegisteredProviders(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }

  public async getProviderStatusList(): Promise<AIProviderStatus[]> {
    const statuses: AIProviderStatus[] = [];

    for (const [name, provider] of this.providers.entries()) {
      let reachable = false;
      let availableModels: string[] = [];
      let activeModel = AI_CONFIG.defaultModels[name] || 'default';

      try {
        reachable = await provider.healthCheck();
        availableModels = await provider.listModels();
        if (provider.getActiveModel) {
          activeModel = provider.getActiveModel();
        }
      } catch (_err) {
        reachable = false;
      }

      statuses.push({
        name,
        enabled: name === 'ollama' ? AI_CONFIG.ollamaEnabled : true,
        reachable,
        activeModel,
        availableModels,
      });
    }

    return statuses;
  }
}

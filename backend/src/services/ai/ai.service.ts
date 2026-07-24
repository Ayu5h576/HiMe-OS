import { ProviderManager } from './provider-manager';
import { GenerateOptions, NormalizedAIResponse } from '../../types/ai';

export class AIService {
  private providerManager: ProviderManager;

  constructor(providerManager: ProviderManager = new ProviderManager()) {
    this.providerManager = providerManager;
  }

  async generateChatResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const provider = this.providerManager.getProvider(options.provider);
    return provider.generateResponse(options);
  }

  getProviderManager(): ProviderManager {
    return this.providerManager;
  }
}

import { ProviderManager } from './provider-manager';
import { ContextBuilder } from './context-builder';
import { GenerateOptions, NormalizedAIResponse, NormalizedPrompt } from '../../types/ai';

export class AIService {
  private providerManager: ProviderManager;
  private contextBuilder: ContextBuilder;

  constructor(
    providerManager: ProviderManager = new ProviderManager(),
    contextBuilder: ContextBuilder = new ContextBuilder(),
  ) {
    this.providerManager = providerManager;
    this.contextBuilder = contextBuilder;
  }

  async buildNormalizedPrompt(input: {
    userId: string;
    conversationId: string;
    currentUserMessage?: string;
    customInstructions?: string;
    memoriesContext?: string;
    maxMessages?: number;
    maxContextLength?: number;
  }): Promise<NormalizedPrompt> {
    return this.contextBuilder.buildContext(input);
  }

  async generateChatResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const provider = this.providerManager.getProvider(options.provider);
    return provider.generateResponse(options);
  }

  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  getContextBuilder(): ContextBuilder {
    return this.contextBuilder;
  }
}

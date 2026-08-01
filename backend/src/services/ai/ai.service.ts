import { ProviderManager } from './provider-manager';
import { ContextBuilder } from './context-builder';
import { ToolExecutor } from './tools/tool-executor';
import { ToolRegistry } from './tools/tool-registry';
import { IToolResponse } from './tools/tool-response';
import {
  AIProviderStatus,
  GenerateOptions,
  NormalizedAIResponse,
  NormalizedPrompt,
  OllamaHealthStatus,
  OllamaModelMetadata,
} from '../../types/ai';

export class AIService {
  private providerManager: ProviderManager;
  private contextBuilder: ContextBuilder;
  private toolExecutor: ToolExecutor;
  private toolRegistry: ToolRegistry;

  constructor(
    providerManager: ProviderManager = new ProviderManager(),
    contextBuilder: ContextBuilder = new ContextBuilder(),
    toolExecutor: ToolExecutor = new ToolExecutor(),
    toolRegistry: ToolRegistry = ToolRegistry.getInstance(),
  ) {
    this.providerManager = providerManager;
    this.contextBuilder = contextBuilder;
    this.toolExecutor = toolExecutor;
    this.toolRegistry = toolRegistry;
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

  async *streamChatResponse(options: GenerateOptions): AsyncGenerator<string, void, unknown> {
    const provider = this.providerManager.getProvider(options.provider);
    if (provider.streamResponse) {
      yield* provider.streamResponse(options);
    } else {
      const response = await provider.generateResponse(options);
      yield response.message;
    }
  }

  async executeToolCall(toolName: string, userId: string, params: unknown): Promise<IToolResponse> {
    return this.toolExecutor.executeTool(toolName, userId, params);
  }

  async listProviders(): Promise<AIProviderStatus[]> {
    return this.providerManager.getProviderStatusList();
  }

  async getOllamaModels(): Promise<OllamaModelMetadata[]> {
    const ollama = this.providerManager.getOllamaProvider();
    return ollama.listModelsDetailed();
  }

  async getOllamaStatus(): Promise<OllamaHealthStatus> {
    const ollama = this.providerManager.getOllamaProvider();
    return ollama.getDetailedStatus();
  }

  setOllamaModel(model: string): { activeModel: string } {
    const ollama = this.providerManager.getOllamaProvider();
    ollama.setActiveModel(model);
    return { activeModel: ollama.getActiveModel() };
  }

  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  getContextBuilder(): ContextBuilder {
    return this.contextBuilder;
  }

  getToolExecutor(): ToolExecutor {
    return this.toolExecutor;
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
}

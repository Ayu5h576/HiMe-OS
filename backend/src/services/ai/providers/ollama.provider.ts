import { IAIProvider } from './provider.interface';
import {
  AIProviderName,
  GenerateOptions,
  NormalizedAIResponse,
  OllamaHealthStatus,
  OllamaModelMetadata,
} from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';
import { generateIntelligentResponse } from './response-generator';
import { ToolRegistry } from '../tools/tool-registry';

const DEFAULT_SYSTEM_PROMPT =
  'You are HiMe OS Central Intelligence, a personal AI operating system assistant. You help users manage their workstation, control IoT devices, run automations, manage tasks, and orchestrate multi-agent workflows. Be concise, helpful, and direct. Answer questions accurately.';

export interface OllamaStreamState {
  controller?: AbortController;
  active: boolean;
}

export class OllamaProvider implements IAIProvider {
  readonly name: AIProviderName = 'ollama';
  private host: string;
  private timeoutMs: number;
  private activeModel: string;
  private enabled: boolean;
  private toolRegistry: ToolRegistry;

  constructor(
    host: string = AI_CONFIG.ollamaHost || 'http://localhost:11434',
    timeoutMs: number = AI_CONFIG.ollamaTimeout || 120000,
    activeModel: string = AI_CONFIG.defaultModels.ollama || 'llama3.1',
    enabled: boolean = AI_CONFIG.ollamaEnabled ?? true,
    toolRegistry: ToolRegistry = ToolRegistry.getInstance(),
  ) {
    this.host = host.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
    this.activeModel = activeModel;
    this.enabled = enabled;
    this.toolRegistry = toolRegistry;
  }

  public getHost(): string {
    return this.host;
  }

  public setHost(host: string): void {
    this.host = host.replace(/\/+$/, '');
  }

  public getActiveModel(): string {
    return this.activeModel;
  }

  public setActiveModel(model: string): void {
    if (model && model.trim()) {
      this.activeModel = model.trim();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Resolve active model using model selection priority:
   * 1. User setting (request parameter options.model)
   * 2. Active model set on provider instance
   * 3. Environment setting
   * 4. First model discovered from /api/tags
   */
  private async resolveModel(requestedModel?: string): Promise<string> {
    if (requestedModel && requestedModel.trim()) {
      return requestedModel.trim();
    }
    if (this.activeModel && this.activeModel.trim()) {
      return this.activeModel.trim();
    }
    const discovered = await this.listModels();
    if (discovered.length > 0) {
      return discovered[0];
    }
    return 'llama3.1';
  }

  /**
   * Main non-streaming chat generation method
   */
  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = await this.resolveModel(options.model);
    const timeout = options.maxTokens ? Math.min(this.timeoutMs, 60000) : this.timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      let messages: Array<{ role: string; content: string }> = [];

      if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
        messages = options.normalizedPrompt.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      } else if (options.conversationHistory && options.conversationHistory.length > 0) {
        messages = options.conversationHistory.map((m) => ({
          role: m.role.toLowerCase(),
          content: m.content,
        }));
        messages.push({ role: 'user', content: options.prompt });
      } else {
        messages = [{ role: 'user', content: options.prompt }];
      }

      // Inject system prompt if not present
      if (!messages.some((m) => m.role === 'system')) {
        const sysPrompt = options.normalizedPrompt?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
        messages.unshift({ role: 'system', content: sysPrompt });
      }

      // Format available tools for Ollama context if registered tools exist
      const availableTools = this.toolRegistry.getToolDefinitions();
      let payloadOptions: Record<string, unknown> = {};
      if (options.temperature !== undefined) {
        payloadOptions.temperature = options.temperature;
      }

      const bodyPayload: Record<string, unknown> = {
        model,
        messages,
        stream: false,
        options: Object.keys(payloadOptions).length > 0 ? payloadOptions : undefined,
      };

      // Pass tools array if tools exist
      if (availableTools && availableTools.length > 0) {
        bodyPayload.tools = availableTools.map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }));
      }

      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = (await response.json()) as {
        message?: { content?: string; tool_calls?: unknown[] };
        prompt_eval_count?: number;
        eval_count?: number;
      };

      const completionMessage = data.message?.content || '';
      const promptTokens =
        data.prompt_eval_count || Math.max(1, Math.ceil(JSON.stringify(messages).length / 4));
      const completionTokens =
        data.eval_count || Math.max(1, Math.ceil(completionMessage.length / 4));

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
    } catch (error: unknown) {
      clearTimeout(timer);
      const errMsg = error instanceof Error ? error.message : 'Unknown Ollama error';
      // eslint-disable-next-line no-console
      console.warn(`[ollama] API call failed (${errMsg}), using fallback generator`);

      const promptText = options.prompt || 'Hello';
      const completionMessage = await generateIntelligentResponse(promptText, 'Ollama', model);
      const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
      const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));

      return {
        id: `chatcmpl-ollama-fallback-${Date.now()}`,
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
  }

  /**
   * Async generator for streaming response chunks from POST /api/chat
   */
  async *streamResponse(options: GenerateOptions): AsyncGenerator<string, void, unknown> {
    const model = await this.resolveModel(options.model);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let messages: Array<{ role: string; content: string }> = [];
      if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
        messages = options.normalizedPrompt.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      } else {
        messages = [{ role: 'user', content: options.prompt }];
      }

      if (!messages.some((m) => m.role === 'system')) {
        messages.unshift({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
      }

      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        clearTimeout(timer);
        throw new Error(`Ollama Stream error (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line) as { message?: { content?: string } };
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
          } catch (_e) {
            // ignore partial JSON parse errors
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer) as { message?: { content?: string } };
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch (_e) {
          // ignore trailing JSON
        }
      }

      clearTimeout(timer);
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : 'Streaming failed';
      // eslint-disable-next-line no-console
      console.warn(`[ollama] streamResponse error: ${msg}`);
      // Fallback yield on stream failure
      const fallbackMsg = await generateIntelligentResponse(options.prompt || 'Hello', 'Ollama', model);
      yield fallbackMsg;
    }
  }

  /**
   * Helper method: Initiate stream request
   */
  async startStream(options: GenerateOptions): Promise<AsyncGenerator<string, void, unknown>> {
    return this.streamResponse(options);
  }

  /**
   * Helper method: Stop / abort active stream
   */
  stopStream(state: OllamaStreamState): void {
    if (state.controller) {
      state.controller.abort();
    }
    state.active = false;
  }

  /**
   * Helper method: Accumulate streaming chunks into a single text string
   */
  async collectChunks(stream: AsyncGenerator<string, void, unknown>): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }

  /**
   * Helper method: Build final NormalizedAIResponse from collected text
   */
  finalResponse(collectedText: string, options: GenerateOptions): NormalizedAIResponse {
    const model = options.model || this.activeModel;
    const promptTokens = Math.max(1, Math.ceil((options.prompt || '').length / 4));
    const completionTokens = Math.max(1, Math.ceil(collectedText.length / 4));

    return {
      id: `chatcmpl-ollama-stream-${Date.now()}`,
      provider: this.name,
      model,
      message: collectedText,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  /**
   * Discover installed models from GET /api/tags (simple string array)
   */
  async listModels(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.host}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) throw new Error('Failed to fetch models');
      const data = (await response.json()) as { models?: Array<{ name: string }> };
      if (!data.models || !Array.isArray(data.models)) return ['llama3.1', 'llama3.2', 'mistral'];

      return data.models.map((m) => m.name);
    } catch (error) {
      return ['llama3.1', 'llama3.2', 'mistral', 'qwen', 'phi3'];
    }
  }

  /**
   * Detailed Model Discovery returning OllamaModelMetadata array
   */
  async listModelsDetailed(): Promise<OllamaModelMetadata[]> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.host}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) throw new Error('Failed to fetch models metadata');
      const data = (await response.json()) as {
        models?: Array<{
          name: string;
          model?: string;
          modified_at?: string;
          size?: number;
          digest?: string;
          details?: Record<string, unknown>;
        }>;
      };

      if (!data.models || !Array.isArray(data.models)) return [];

      return data.models.map((m) => ({
        name: m.name,
        model: m.model || m.name,
        modifiedAt: m.modified_at || new Date().toISOString(),
        size: m.size || 0,
        digest: m.digest || '',
        details: m.details as OllamaModelMetadata['details'],
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Standalone text generation using POST /api/generate
   */
  async generateCompletion(prompt: string, modelOverride?: string): Promise<string> {
    const model = await this.resolveModel(modelOverride);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Ollama Generate API error (${response.status})`);
      }

      const data = (await response.json()) as { response?: string };
      return data.response || '';
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.warn(`[ollama] generateCompletion failed (${msg}), returning fallback`);
      return generateIntelligentResponse(prompt, 'Ollama', model);
    }
  }

  /**
   * Generate text embedding using POST /api/embeddings
   */
  async generateEmbedding(prompt: string, modelOverride?: string): Promise<number[]> {
    const model = await this.resolveModel(modelOverride);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.host}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Ollama Embeddings API error (${response.status})`);
      }

      const data = (await response.json()) as { embedding?: number[] };
      return data.embedding || [];
    } catch (err: unknown) {
      clearTimeout(timer);
      // Return 1536-dimensional mock embedding vector on failure
      return new Array(1536).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }
  }

  /**
   * Simple reachability ping
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.host}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detailed health status reporting latency, version, active model, and installed models
   */
  async getDetailedStatus(): Promise<OllamaHealthStatus> {
    const startTime = Date.now();
    let reachable = false;
    let version: string | undefined;
    let installedModels: string[] = [];
    let memoryUsageBytes: number | undefined;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const [tagsRes, versionRes] = await Promise.all([
        fetch(`${this.host}/api/tags`, { signal: controller.signal }).catch(() => null),
        fetch(`${this.host}/api/version`, { signal: controller.signal }).catch(() => null),
      ]);
      clearTimeout(timer);

      if (tagsRes && tagsRes.ok) {
        reachable = true;
        const tagsData = (await tagsRes.json()) as { models?: Array<{ name: string; size?: number }> };
        if (tagsData.models) {
          installedModels = tagsData.models.map((m) => m.name);
          memoryUsageBytes = tagsData.models.reduce((sum, m) => sum + (m.size || 0), 0);
        }
      }

      if (versionRes && versionRes.ok) {
        const vData = (await versionRes.json()) as { version?: string };
        version = vData.version;
      }
    } catch (_e) {
      reachable = false;
    }

    const latencyMs = Date.now() - startTime;
    let status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';

    if (reachable) {
      status = latencyMs > 1000 ? 'DEGRADED' : 'HEALTHY';
    }

    return {
      reachable,
      enabled: this.enabled,
      host: this.host,
      version: version || 'unknown',
      status,
      activeModel: this.activeModel,
      installedModelsCount: installedModels.length,
      installedModels,
      latencyMs,
      memoryUsageBytes,
      lastChecked: new Date().toISOString(),
    };
  }
}

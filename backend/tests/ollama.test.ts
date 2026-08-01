import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaProvider } from '../src/services/ai/providers/ollama.provider';
import { ProviderManager } from '../src/services/ai/provider-manager';
import { AIService } from '../src/services/ai/ai.service';
import { ToolRegistry } from '../src/services/ai/tools/tool-registry';
import { ToolExecutor } from '../src/services/ai/tools/tool-executor';
import { ITool } from '../src/services/ai/tools/tool.interface';
import { ToolResponseFormatter } from '../src/services/ai/tools/tool-response';
import { z } from 'zod';

class MockTestTool implements ITool {
  readonly name = 'testOllamaTool';
  readonly description = 'Test tool for Ollama integration test';
  readonly parameterSchema = z.object({
    location: z.string(),
  });

  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: { location: { type: 'string' } },
        required: ['location'],
      },
    };
  }

  async execute(_userId: string, params: unknown) {
    const parsed = this.parameterSchema.parse(params);
    return ToolResponseFormatter.success(this.name, { temp: 72, location: parsed.location });
  }
}

describe('Ollama AI Provider Module', () => {
  let provider: OllamaProvider;
  let toolRegistry: ToolRegistry;
  let toolExecutor: ToolExecutor;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    toolRegistry = ToolRegistry.getInstance();
    toolRegistry.clear();
    toolRegistry.registerTool(new MockTestTool());
    toolExecutor = new ToolExecutor(toolRegistry);

    provider = new OllamaProvider(
      'http://localhost:11434',
      5000,
      'llama3.1',
      true,
      toolRegistry,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('1. Provider Initialization & Configuration', () => {
    it('should initialize with correct default host, model, and timeout settings', () => {
      expect(provider.name).toBe('ollama');
      expect(provider.getHost()).toBe('http://localhost:11434');
      expect(provider.getActiveModel()).toBe('llama3.1');
      expect(provider.isEnabled()).toBe(true);
    });

    it('should allow dynamically updating host, active model, and enabled status', () => {
      provider.setHost('http://192.168.1.100:11434/');
      expect(provider.getHost()).toBe('http://192.168.1.100:11434');

      provider.setActiveModel('qwen2.5');
      expect(provider.getActiveModel()).toBe('qwen2.5');

      provider.setEnabled(false);
      expect(provider.isEnabled()).toBe(false);
    });
  });

  describe('2. Health Check & Monitoring', () => {
    it('should return true on healthCheck when Ollama server is reachable', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'llama3.1' }] }),
      } as Response);

      const isHealthy = await provider.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false on healthCheck when provider is disabled or unreachable', async () => {
      provider.setEnabled(false);
      expect(await provider.healthCheck()).toBe(false);

      provider.setEnabled(true);
      global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      expect(await provider.healthCheck()).toBe(false);
    });

    it('should return detailed status report including version, model count, and latency', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              models: [
                { name: 'llama3.1', size: 4700000000 },
                { name: 'mistral', size: 4100000000 },
              ],
            }),
          } as Response);
        }
        if (url.includes('/api/version')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ version: '0.3.14' }),
          } as Response);
        }
        return Promise.reject(new Error('Not found'));
      });

      const status = await provider.getDetailedStatus();
      expect(status.reachable).toBe(true);
      expect(status.version).toBe('0.3.14');
      expect(status.status).toBe('HEALTHY');
      expect(status.installedModelsCount).toBe(2);
      expect(status.installedModels).toEqual(['llama3.1', 'mistral']);
      expect(status.memoryUsageBytes).toBe(8800000000);
    });
  });

  describe('3. Model Discovery', () => {
    it('should discover installed models from /api/tags', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          models: [
            { name: 'llama3.1:latest' },
            { name: 'qwen:7b' },
            { name: 'phi3:mini' },
          ],
        }),
      } as Response);

      const models = await provider.listModels();
      expect(models).toEqual(['llama3.1:latest', 'qwen:7b', 'phi3:mini']);
    });

    it('should retrieve detailed model metadata via listModelsDetailed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          models: [
            {
              name: 'llama3.1:latest',
              model: 'llama3.1',
              modified_at: '2026-07-30T12:00:00Z',
              size: 4700000000,
              digest: 'sha256:abcd12345',
              details: { family: 'llama', parameter_size: '8B' },
            },
          ],
        }),
      } as Response);

      const detailed = await provider.listModelsDetailed();
      expect(detailed).toHaveLength(1);
      expect(detailed[0].name).toBe('llama3.1:latest');
      expect(detailed[0].details?.family).toBe('llama');
    });

    it('should fallback to default models list when listModels fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const models = await provider.listModels();
      expect(models).toContain('llama3.1');
    });
  });

  describe('4. Non-Streaming Chat Generation', () => {
    it('should generate normalized AI response from POST /api/chat', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ models: [{ name: 'llama3.1' }] }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: { role: 'assistant', content: 'HiMe OS running cleanly on local Ollama.' },
            prompt_eval_count: 14,
            eval_count: 9,
          }),
        } as Response);
      });

      const response = await provider.generateResponse({
        prompt: 'System status report',
      });

      expect(response.provider).toBe('ollama');
      expect(response.message).toBe('HiMe OS running cleanly on local Ollama.');
      expect(response.usage.promptTokens).toBe(14);
      expect(response.usage.completionTokens).toBe(9);
      expect(response.usage.totalTokens).toBe(23);
    });

    it('should respect requested model override in GenerateOptions', async () => {
      let requestedBody: any = null;
      global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
        if (url.includes('/api/chat')) {
          requestedBody = JSON.parse(opts.body);
          return Promise.resolve({
            ok: true,
            json: async () => ({ message: { content: 'Response from mistral' } }),
          } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => ({ models: [{ name: 'mistral' }] }) } as Response);
      });

      const response = await provider.generateResponse({
        prompt: 'Hello',
        model: 'mistral',
      });

      expect(response.model).toBe('mistral');
      expect(requestedBody.model).toBe('mistral');
    });
  });

  describe('5. Streaming Chat Support', () => {
    it('should yield streaming text chunks and build final response', async () => {
      const mockChunks = [
        JSON.stringify({ message: { content: 'HiMe ' } }) + '\n',
        JSON.stringify({ message: { content: 'OS ' } }) + '\n',
        JSON.stringify({ message: { content: 'Ollama Stream.' } }) + '\n',
      ];

      let chunkIndex = 0;
      const stream = new ReadableStream({
        pull(controller) {
          if (chunkIndex < mockChunks.length) {
            controller.enqueue(new TextEncoder().encode(mockChunks[chunkIndex++]));
          } else {
            controller.close();
          }
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      } as Response);

      const chunkGenerator = provider.streamResponse({ prompt: 'Stream test' });
      const collectedText = await provider.collectChunks(chunkGenerator);
      expect(collectedText).toBe('HiMe OS Ollama Stream.');

      const finalRes = provider.finalResponse(collectedText, { prompt: 'Stream test' });
      expect(finalRes.provider).toBe('ollama');
      expect(finalRes.message).toBe('HiMe OS Ollama Stream.');
    });
  });

  describe('6. Tool Calling Framework Integration', () => {
    it('should pass tool definitions in Ollama payload and execute tool via ToolExecutor', async () => {
      let sentBody: any = null;
      global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
        if (url.includes('/api/chat')) {
          sentBody = JSON.parse(opts.body);
          return Promise.resolve({
            ok: true,
            json: async () => ({
              message: { content: 'Executing test tool...' },
            }),
          } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => ({ models: [{ name: 'llama3.1' }] }) } as Response);
      });

      await provider.generateResponse({ prompt: 'Check weather in Tokyo' });
      expect(sentBody.tools).toBeDefined();
      expect(sentBody.tools[0].function.name).toBe('testOllamaTool');

      const toolRes = await toolExecutor.executeTool('testOllamaTool', 'user123', { location: 'Tokyo' });
      expect(toolRes.success).toBe(true);
      expect((toolRes.result as any).location).toBe('Tokyo');
    });
  });

  describe('7. Embeddings Generation', () => {
    it('should return embedding vector from POST /api/embeddings', async () => {
      const mockVector = [0.1, 0.2, -0.5, 0.9];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: mockVector }),
      } as Response);

      const embedding = await provider.generateEmbedding('Memory vector text');
      expect(embedding).toEqual(mockVector);
    });
  });

  describe('8. Provider Failover & Resilience', () => {
    it('should handle offline Ollama host gracefully with fallback response', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const response = await provider.generateResponse({
        prompt: 'Hello offline Ollama',
      });

      expect(response.provider).toBe('ollama');
      expect(response.message).toBeDefined();
      expect(response.message.length).toBeGreaterThan(0);
    });

    it('should handle API HTTP 500 error with fallback response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Model process crashed',
      } as Response);

      const response = await provider.generateResponse({ prompt: 'Error test' });
      expect(response.provider).toBe('ollama');
      expect(response.message).toBeDefined();
    });
  });

  describe('9. Full Provider Manager & AIService Integration', () => {
    it('should register Ollama in ProviderManager and retrieve detailed provider status', async () => {
      const manager = new ProviderManager();
      expect(manager.listRegisteredProviders()).toContain('ollama');

      const ollama = manager.getOllamaProvider();
      expect(ollama).toBeInstanceOf(OllamaProvider);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'llama3.1' }], version: '0.3.14' }),
      } as Response);

      const statuses = await manager.getProviderStatusList();
      const ollamaStatus = statuses.find((s) => s.name === 'ollama');
      expect(ollamaStatus).toBeDefined();
      expect(ollamaStatus?.reachable).toBe(true);
    });

    it('should support switching active model and retrieving status via AIService', async () => {
      const aiService = new AIService();
      const switchRes = aiService.setOllamaModel('qwen2.5');
      expect(switchRes.activeModel).toBe('qwen2.5');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5' }], version: '0.3.14' }),
      } as Response);

      const status = await aiService.getOllamaStatus();
      expect(status.activeModel).toBe('qwen2.5');
    });
  });
});

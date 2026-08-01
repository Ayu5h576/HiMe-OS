import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';
import { env } from '../../../config/env';
import { generateIntelligentResponse } from './response-generator';

const SYSTEM_PROMPT = "You are HiMe OS Central Intelligence, a personal AI operating system assistant. You help users manage their workstation, control IoT devices, run automations, manage tasks, and orchestrate multi-agent workflows. Be concise, helpful, and direct. Answer questions accurately.";

export class OllamaProvider implements IAIProvider {
  readonly name: AIProviderName = 'ollama';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.ollama;
    const baseUrl = AI_CONFIG.ollamaBaseUrl;
    
    let messages = [];
    if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
      messages = options.normalizedPrompt.messages.map(m => ({ role: m.role, content: m.content }));
    } else {
      messages = [{ role: 'user', content: options.prompt }];
    }
    
    // Ensure system prompt is present
    if (!messages.some(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: SYSTEM_PROMPT });
    }

    try {
      let activeModel = model;
      // Check if requested model is installed; if not, pick available model
      try {
        const tagsRes = await fetch(`${baseUrl}/api/tags`);
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const availableModels: string[] = (tagsData.models || []).map((m: any) => m.name);
          if (availableModels.length > 0 && !availableModels.includes(activeModel) && !availableModels.some(m => m.startsWith(activeModel))) {
            activeModel = availableModels[0];
          }
        }
      } catch (_tagsErr) {
        // ignore tag check failure, proceed with requested model
      }

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const completionMessage = data.message?.content || '';

      const promptTokens = data.prompt_eval_count || Math.max(1, Math.ceil(JSON.stringify(messages).length / 4));
      const completionTokens = data.eval_count || Math.max(1, Math.ceil(completionMessage.length / 4));

      return {
        id: `chatcmpl-ollama-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        provider: this.name,
        model: activeModel,
        message: completionMessage,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      };
    } catch (error: any) {
      console.warn(`[${this.name}] API call failed, using fallback:`, error.message);
      const promptText = options.prompt || 'Hello';
      const completionMessage = await generateIntelligentResponse(promptText, 'Ollama', model);
      const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
      const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));
      
      return {
        id: `chatcmpl-ollama-fallback-${Date.now()}`,
        provider: this.name,
        model,
        message: completionMessage,
        usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      };
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${AI_CONFIG.ollamaBaseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models.map((m: any) => m.name);
    } catch (error) {
      console.warn('[ollama] listModels failed, using default list');
      return ['llama3.2', 'mistral', 'codellama', 'phi3'];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_CONFIG.ollamaBaseUrl}/api/version`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

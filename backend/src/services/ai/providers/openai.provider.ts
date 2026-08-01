import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';
import { env } from '../../../config/env';
import { generateIntelligentResponse } from './response-generator';

const SYSTEM_PROMPT = "You are HiMe OS Central Intelligence, a personal AI operating system assistant. You help users manage their workstation, control IoT devices, run automations, manage tasks, and orchestrate multi-agent workflows. Be concise, helpful, and direct. Answer questions accurately.";

export class OpenAIProvider implements IAIProvider {
  readonly name: AIProviderName = 'openai';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.openai;
    
    if (!env.OPENAI_API_KEY) {
      console.warn(`[${this.name}] API key not found, using fallback.`);
      return this.fallback(options, model);
    }

    let messages: any[] = [];
    if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
      messages = options.normalizedPrompt.messages.map(m => ({ role: m.role, content: m.content }));
    } else {
      messages = [{ role: 'user', content: options.prompt }];
    }
    
    if (!messages.some(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: SYSTEM_PROMPT });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const completionMessage = data.choices?.[0]?.message?.content || '';
      
      return {
        id: data.id || `chatcmpl-openai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        provider: this.name,
        model,
        message: completionMessage,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error: any) {
      console.warn(`[${this.name}] API call failed, using fallback:`, error.message);
      return this.fallback(options, model);
    }
  }

  private async fallback(options: GenerateOptions, model: string): Promise<NormalizedAIResponse> {
    const promptText = options.prompt || 'Hello';
    const completionMessage = await generateIntelligentResponse(promptText, 'OpenAI', model);
    const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));
    
    return {
      id: `chatcmpl-openai-fallback-${Date.now()}`,
      provider: this.name,
      model,
      message: completionMessage,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    };
  }

  async listModels(): Promise<string[]> {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

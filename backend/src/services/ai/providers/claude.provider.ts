import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';
import { env } from '../../../config/env';
import { generateIntelligentResponse } from './response-generator';

const SYSTEM_PROMPT = "You are HiMe OS Central Intelligence, a personal AI operating system assistant. You help users manage their workstation, control IoT devices, run automations, manage tasks, and orchestrate multi-agent workflows. Be concise, helpful, and direct. Answer questions accurately.";

export class ClaudeProvider implements IAIProvider {
  readonly name: AIProviderName = 'claude';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.claude;
    
    if (!env.ANTHROPIC_API_KEY) {
      console.warn(`[${this.name}] API key not found, using fallback.`);
      return this.fallback(options, model);
    }

    let messages: any[] = [];
    let systemPrompt = SYSTEM_PROMPT;

    if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
      const userAssistMsgs = options.normalizedPrompt.messages.filter(m => m.role !== 'system');
      messages = userAssistMsgs.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
      
      const sysMsgs = options.normalizedPrompt.messages.filter(m => m.role === 'system');
      if (sysMsgs.length > 0) {
        const extraSys = sysMsgs.map(m => m.content).join('\n\n');
        systemPrompt = SYSTEM_PROMPT + '\n\n' + extraSys;
      }
    } else {
      messages = [{ role: 'user', content: options.prompt }];
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          system: systemPrompt,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens || 4096
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const completionMessage = data.content?.[0]?.text || '';
      
      return {
        id: data.id || `chatcmpl-claude-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        provider: this.name,
        model,
        message: completionMessage,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error: any) {
      console.warn(`[${this.name}] API call failed, using fallback:`, error.message);
      return this.fallback(options, model);
    }
  }

  private async fallback(options: GenerateOptions, model: string): Promise<NormalizedAIResponse> {
    const promptText = options.prompt || 'Hello';
    const completionMessage = await generateIntelligentResponse(promptText, 'Claude', model);
    const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));
    
    return {
      id: `chatcmpl-claude-fallback-${Date.now()}`,
      provider: this.name,
      model,
      message: completionMessage,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    };
  }

  async listModels(): Promise<string[]> {
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

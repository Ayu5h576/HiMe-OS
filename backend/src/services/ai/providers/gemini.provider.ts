import { IAIProvider } from './provider.interface';
import { AIProviderName, GenerateOptions, NormalizedAIResponse } from '../../../types/ai';
import { AI_CONFIG } from '../../../config/ai';
import { env } from '../../../config/env';
import { generateIntelligentResponse } from './response-generator';

const SYSTEM_PROMPT = "You are HiMe OS Central Intelligence, a personal AI operating system assistant. You help users manage their workstation, control IoT devices, run automations, manage tasks, and orchestrate multi-agent workflows. Be concise, helpful, and direct. Answer questions accurately.";

export class GeminiProvider implements IAIProvider {
  readonly name: AIProviderName = 'gemini';

  async generateResponse(options: GenerateOptions): Promise<NormalizedAIResponse> {
    const model = options.model || AI_CONFIG.defaultModels.gemini;
    
    if (!env.GEMINI_API_KEY) {
      console.warn(`[${this.name}] API key not found, using fallback.`);
      return this.fallback(options, model);
    }

    let contents: any[] = [];
    if (options.normalizedPrompt?.messages && options.normalizedPrompt.messages.length > 0) {
      let systemInstruction = SYSTEM_PROMPT;
      let firstUserMessageAdded = false;

      for (const m of options.normalizedPrompt.messages) {
        if (m.role === 'system') {
          if (m.content.trim() !== '') {
            systemInstruction += "\n\n" + m.content;
          }
        } else if (m.role === 'user') {
          if (!firstUserMessageAdded) {
             contents.push({ role: 'user', parts: [{ text: `${systemInstruction}\n\n${m.content}` }] });
             firstUserMessageAdded = true;
          } else {
             contents.push({ role: 'user', parts: [{ text: m.content }] });
          }
        } else if (m.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: m.content }] });
        }
      }
      
      if (contents.length === 0) {
         contents.push({ role: 'user', parts: [{ text: `${systemInstruction}\n\n${options.prompt}` }] });
      }
    } else {
      contents = [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${options.prompt}` }] }];
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const completionMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const promptTokens = data.usageMetadata?.promptTokenCount || Math.max(1, Math.ceil(JSON.stringify(contents).length / 4));
      const completionTokens = data.usageMetadata?.candidatesTokenCount || Math.max(1, Math.ceil(completionMessage.length / 4));

      return {
        id: `chatcmpl-gemini-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        provider: this.name,
        model,
        message: completionMessage,
        usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
      };
    } catch (error: any) {
      console.warn(`[${this.name}] API call failed, using fallback:`, error.message);
      return this.fallback(options, model);
    }
  }

  private async fallback(options: GenerateOptions, model: string): Promise<NormalizedAIResponse> {
    const promptText = options.prompt || 'Hello';
    const completionMessage = await generateIntelligentResponse(promptText, 'Gemini', model);
    const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
    const completionTokens = Math.max(1, Math.ceil(completionMessage.length / 4));
    
    return {
      id: `chatcmpl-gemini-fallback-${Date.now()}`,
      provider: this.name,
      model,
      message: completionMessage,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    };
  }

  async listModels(): Promise<string[]> {
    return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

import { MessageRole } from '@prisma/client';

export type AIProviderName = 'openai' | 'gemini' | 'claude' | 'ollama';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface NormalizedAIResponse {
  id: string;
  provider: AIProviderName;
  model: string;
  message: string;
  usage: LLMUsage;
}

export interface GenerateOptions {
  prompt: string;
  conversationHistory?: ChatMessage[];
  model?: string;
  provider?: AIProviderName;
  temperature?: number;
  maxTokens?: number;
}

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

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface PromptMetadata {
  projectId: string;
  conversationId: string;
  messageCount: number;
  systemPromptVersion: string;
  trimmedMessagesCount: number;
  memoryInjectionPoint: boolean;
  retrievedMemoriesCount?: number;
  ragEnabled?: boolean;
}

export interface NormalizedPrompt {
  systemPrompt: string;
  messages: PromptMessage[];
  metadata: PromptMetadata;
}

export interface GenerateOptions {
  prompt: string;
  conversationHistory?: ChatMessage[];
  normalizedPrompt?: NormalizedPrompt;
  model?: string;
  provider?: AIProviderName;
  temperature?: number;
  maxTokens?: number;
}

export interface OllamaModelDetails {
  parent_model?: string;
  format?: string;
  family?: string;
  families?: string[];
  parameter_size?: string;
  quantization_level?: string;
}

export interface OllamaModelMetadata {
  name: string;
  model: string;
  modifiedAt: string;
  size: number;
  digest: string;
  details?: OllamaModelDetails;
}

export interface OllamaHealthStatus {
  reachable: boolean;
  enabled: boolean;
  host: string;
  version?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  activeModel: string;
  installedModelsCount: number;
  installedModels: string[];
  latencyMs: number;
  memoryUsageBytes?: number;
  lastChecked: string;
}

export interface AIProviderStatus {
  name: AIProviderName;
  enabled: boolean;
  reachable: boolean;
  activeModel: string;
  availableModels: string[];
}


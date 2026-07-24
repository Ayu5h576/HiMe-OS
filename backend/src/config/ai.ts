import { env } from './env';

export const AI_CONFIG = {
  defaultProvider: env.AI_PROVIDER,
  defaultModels: {
    openai: env.DEFAULT_MODEL || 'gpt-4o-mini',
    gemini: env.DEFAULT_MODEL || 'gemini-1.5-flash',
    claude: env.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
    ollama: env.DEFAULT_MODEL || 'llama3.2',
  },
  ollamaBaseUrl: env.OLLAMA_BASE_URL,
  context: {
    maxMessages: 20,
    maxContextLength: 8000,
    systemPromptVersion: 'v1.0.0',
    enableContextDebug: false,
    defaultAssistantName: 'HiMe OS Assistant',
  },
};

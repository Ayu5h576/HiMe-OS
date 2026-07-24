import { z } from 'zod';

export const aiChatSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  message: z.string().min(1, 'Message prompt is required'),
  provider: z.enum(['openai', 'gemini', 'claude', 'ollama']).optional(),
  model: z.string().optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;

export const aiResponseSwaggerSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'chatcmpl-openai-12345' },
    provider: { type: 'string', enum: ['openai', 'gemini', 'claude', 'ollama'], example: 'openai' },
    model: { type: 'string', example: 'gpt-4o-mini' },
    message: { type: 'string', example: 'OpenAI (gpt-4o-mini) response to: "Hello"' },
    usage: {
      type: 'object',
      properties: {
        promptTokens: { type: 'integer', example: 2 },
        completionTokens: { type: 'integer', example: 12 },
        totalTokens: { type: 'integer', example: 14 },
      },
    },
  },
};

const errorResponse = (example: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example },
  },
});

export const aiChatSwaggerSchema = {
  description:
    'Send a prompt to the AI provider layer, persistence in conversation, and return normalized response',
  tags: ['AI Engine'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['conversationId', 'message'],
    properties: {
      conversationId: { type: 'string', example: 'cm4conv123456' },
      message: { type: 'string', example: 'Hello, explain HiMe OS architecture.' },
      provider: {
        type: 'string',
        enum: ['openai', 'gemini', 'claude', 'ollama'],
        example: 'openai',
      },
      model: { type: 'string', example: 'gpt-4o-mini' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: aiResponseSwaggerSchema,
      },
    },
    400: errorResponse('Validation Error'),
    401: errorResponse('Unauthorized'),
    403: errorResponse('Forbidden'),
    404: errorResponse('Not Found'),
  },
};

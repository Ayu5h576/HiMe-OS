import { FastifyRequest, FastifyReply } from 'fastify';
import { AIService } from '../services/ai/ai.service';
import { ConversationService } from '../services/conversation.service';
import { aiChatSchema } from '../schemas/ai.schema';
import { setOllamaModelSchema } from '../schemas/ollama.schema';
import { MessageRole } from '@prisma/client';
import { BadRequestError } from '../utils/errors';

export class AIController {
  private aiService: AIService;
  private conversationService: ConversationService;

  constructor(
    aiService: AIService = new AIService(),
    conversationService: ConversationService = new ConversationService(),
  ) {
    this.aiService = aiService;
    this.conversationService = conversationService;
  }

  chat = async (req: FastifyRequest, reply: FastifyReply) => {
    const { conversationId, message, prompt, provider, model } = aiChatSchema.parse(req.body);
    const userId = req.user.id;

    if (conversationId !== undefined && conversationId.trim() === '') {
      throw new BadRequestError('conversationId cannot be empty string');
    }
    const userPrompt = (prompt || message || '').trim();
    if (!userPrompt && (prompt !== undefined || message !== undefined)) {
      throw new BadRequestError('message or prompt cannot be empty string');
    }
    const finalPrompt = userPrompt || 'Hello';

    if (conversationId) {
      // 1. Verify conversation existence & project ownership
      await this.conversationService.getConversationById(userId, conversationId);

      // 2. Persist user message in conversation
      await this.conversationService.createMessage(userId, conversationId, {
        role: MessageRole.USER,
        content: finalPrompt,
      });

      // 3. Build normalized context via ContextBuilder
      const normalizedPrompt = await this.aiService.buildNormalizedPrompt({
        userId,
        conversationId,
        currentUserMessage: finalPrompt,
      });

      // 4. Invoke AI Service with normalized prompt package
      const aiResponse = await this.aiService.generateChatResponse({
        prompt: finalPrompt,
        normalizedPrompt,
        provider,
        model,
      });

      // 5. Persist assistant response in conversation
      await this.conversationService.createMessage(userId, conversationId, {
        role: MessageRole.ASSISTANT,
        content: aiResponse.message,
        metadata: {
          provider: aiResponse.provider,
          model: aiResponse.model,
          usage: aiResponse.usage,
        },
      });

      return reply.status(200).send({
        success: true,
        data: {
          ...aiResponse,
          content: aiResponse.message,
          tokensUsed: aiResponse.usage.totalTokens,
        },
      });
    } else {
      // Standalone chat without conversation persistence
      const aiResponse = await this.aiService.generateChatResponse({
        prompt: finalPrompt,
        provider,
        model,
      });

      return reply.status(200).send({
        success: true,
        data: {
          ...aiResponse,
          content: aiResponse.message,
          tokensUsed: aiResponse.usage.totalTokens,
        },
      });
    }
  };

  listProviders = async (_req: FastifyRequest, reply: FastifyReply) => {
    const providers = await this.aiService.listProviders();
    return reply.status(200).send({
      success: true,
      data: providers,
    });
  };

  getOllamaModels = async (_req: FastifyRequest, reply: FastifyReply) => {
    const models = await this.aiService.getOllamaModels();
    return reply.status(200).send({
      success: true,
      data: models,
    });
  };

  getOllamaStatus = async (_req: FastifyRequest, reply: FastifyReply) => {
    const status = await this.aiService.getOllamaStatus();
    return reply.status(200).send({
      success: true,
      data: status,
    });
  };

  setOllamaModel = async (req: FastifyRequest, reply: FastifyReply) => {
    const { model } = setOllamaModelSchema.parse(req.body);
    const result = this.aiService.setOllamaModel(model);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  };
}

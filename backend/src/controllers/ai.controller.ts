import { FastifyRequest, FastifyReply } from 'fastify';
import { AIService } from '../services/ai/ai.service';
import { ConversationService } from '../services/conversation.service';
import { aiChatSchema } from '../schemas/ai.schema';
import { MessageRole } from '@prisma/client';

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
    const { conversationId, message, provider, model } = aiChatSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Verify conversation existence & project ownership
    await this.conversationService.getConversationById(userId, conversationId);

    // 2. Persist user message in conversation
    await this.conversationService.createMessage(userId, conversationId, {
      role: MessageRole.USER,
      content: message,
    });

    // 3. Build normalized context via ContextBuilder
    const normalizedPrompt = await this.aiService.buildNormalizedPrompt({
      userId,
      conversationId,
      currentUserMessage: message,
    });

    // 4. Invoke AI Service with normalized prompt package
    const aiResponse = await this.aiService.generateChatResponse({
      prompt: message,
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

    // 6. Return normalized AI response
    return reply.status(200).send({
      success: true,
      data: aiResponse,
    });
  };
}

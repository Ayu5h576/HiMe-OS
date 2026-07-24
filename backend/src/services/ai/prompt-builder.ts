import { Project, Conversation, Message } from '@prisma/client';
import { SystemPromptBuilder, SystemPromptOptions } from './prompt/system';
import { MessagePromptFormatter } from './prompt/messages';
import { ContextTokenizer } from './tokenizer';
import { NormalizedPrompt, PromptMessage } from '../../types/ai';
import { AI_CONFIG } from '../../config/ai';

export interface BuildPromptInput {
  project?: Project;
  conversation: Conversation;
  messages: Message[];
  currentUserMessage?: string;
  customInstructions?: string;
  memoriesContext?: string;
  maxMessages?: number;
  maxContextLength?: number;
}

export class PromptBuilder {
  static build(input: BuildPromptInput): NormalizedPrompt {
    // 1. Build System Prompt
    const systemPromptOptions: SystemPromptOptions = {
      project: input.project,
      conversation: input.conversation,
      customInstructions: input.customInstructions,
      memoriesContext: input.memoriesContext,
    };

    const systemPrompt = SystemPromptBuilder.buildSystemPrompt(systemPromptOptions);

    // 2. Format history messages
    const formattedMessages = MessagePromptFormatter.formatMessages(input.messages);

    // 3. Append current user message if provided and not already last in history
    if (input.currentUserMessage) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      if (!lastMsg || lastMsg.content !== input.currentUserMessage || lastMsg.role !== 'user') {
        formattedMessages.push({
          role: 'user',
          content: input.currentUserMessage,
        });
      }
    }

    // 4. Trim history using ContextTokenizer
    const { messages: trimmedMessages, trimmedCount } = ContextTokenizer.trimHistory(
      formattedMessages,
      {
        maxMessages: input.maxMessages,
        maxContextLength: input.maxContextLength,
      },
    );

    // 5. Construct full messages list with system prompt as first message
    const fullMessages: PromptMessage[] = [
      { role: 'system', content: systemPrompt },
      ...trimmedMessages,
    ];

    return {
      systemPrompt,
      messages: fullMessages,
      metadata: {
        projectId: input.conversation.projectId,
        conversationId: input.conversation.id,
        messageCount: fullMessages.length,
        systemPromptVersion: AI_CONFIG.context.systemPromptVersion,
        trimmedMessagesCount: trimmedCount,
        memoryInjectionPoint: Boolean(input.memoriesContext && input.memoriesContext.length > 0),
      },
    };
  }
}

import { Conversation } from '@prisma/client';

export class ConversationPromptFormatter {
  static formatConversationContext(conversation: Conversation): string {
    return `Conversation Title: ${conversation.title}`;
  }
}

import { Message, MessageRole } from '@prisma/client';
import { PromptMessage } from '../../../types/ai';

export class MessagePromptFormatter {
  static mapRole(role: MessageRole): 'system' | 'user' | 'assistant' | 'tool' {
    switch (role) {
      case MessageRole.USER:
        return 'user';
      case MessageRole.ASSISTANT:
        return 'assistant';
      case MessageRole.SYSTEM:
        return 'system';
      case MessageRole.TOOL:
        return 'tool';
      default:
        return 'user';
    }
  }

  static formatMessages(messages: Message[]): PromptMessage[] {
    // Sort chronologically ascending
    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sorted.map((msg) => ({
      role: MessagePromptFormatter.mapRole(msg.role),
      content: msg.content,
    }));
  }
}

import { PromptMessage } from '../../types/ai';
import { AI_CONFIG } from '../../config/ai';

export interface TrimmingOptions {
  maxMessages?: number;
  maxContextLength?: number;
}

export interface TrimmingResult {
  messages: PromptMessage[];
  trimmedCount: number;
}

export class ContextTokenizer {
  static estimateLength(messages: PromptMessage[]): number {
    return messages.reduce((acc, msg) => acc + (msg.content ? msg.content.length : 0), 0);
  }

  static trimHistory(messages: PromptMessage[], options: TrimmingOptions = {}): TrimmingResult {
    const maxMessages = options.maxMessages ?? AI_CONFIG.context.maxMessages;
    const maxContextLength = options.maxContextLength ?? AI_CONFIG.context.maxContextLength;

    let result = [...messages];
    let trimmedCount = 0;

    // 1. Trim by message count limit
    if (result.length > maxMessages) {
      trimmedCount += result.length - maxMessages;
      result = result.slice(result.length - maxMessages);
    }

    // 2. Trim by total character length limit while keeping at least 1 message
    while (result.length > 1 && ContextTokenizer.estimateLength(result) > maxContextLength) {
      result.shift();
      trimmedCount += 1;
    }

    return {
      messages: result,
      trimmedCount,
    };
  }
}

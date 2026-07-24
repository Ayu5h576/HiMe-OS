import { Project, Conversation } from '@prisma/client';
import { ProjectPromptFormatter } from './project';
import { ConversationPromptFormatter } from './conversation';
import { AI_CONFIG } from '../../../config/ai';

export interface SystemPromptOptions {
  project?: Project;
  conversation?: Conversation;
  customInstructions?: string;
  memoriesContext?: string;
}

export class SystemPromptBuilder {
  static buildSystemPrompt(options: SystemPromptOptions = {}): string {
    const timestamp = new Date().toISOString();
    const assistantName = AI_CONFIG.context.defaultAssistantName;
    const version = AI_CONFIG.context.systemPromptVersion;

    const sections: string[] = [];

    // 1. Identity & Role
    sections.push(
      `You are ${assistantName}, a production-grade AI assistant operating inside HiMe OS (System Version: ${version}).`,
    );
    sections.push(
      `Current Server Timestamp: ${timestamp}. Respond accurately, concisely, and helpfully.`,
    );

    // 2. Project Workspace Context
    if (options.project) {
      sections.push(
        `--- CURRENT PROJECT WORKSPACE ---\n${ProjectPromptFormatter.formatProjectContext(options.project)}`,
      );
    }

    // 3. Conversation Context
    if (options.conversation) {
      sections.push(
        `--- CONVERSATION SESSION ---\n${ConversationPromptFormatter.formatConversationContext(options.conversation)}`,
      );
    }

    // 4. RAG Memory Injection
    if (options.memoriesContext && options.memoriesContext.trim().length > 0) {
      const trimmed = options.memoriesContext.trim();
      if (
        trimmed.includes('=== Relevant Memories ===') ||
        trimmed.includes('--- RELEVANT PROJECT MEMORIES ---')
      ) {
        sections.push(trimmed);
      } else {
        sections.push(`--- RELEVANT PROJECT MEMORIES ---\n${trimmed}`);
      }
    }

    // 5. Custom Instructions
    if (options.customInstructions) {
      sections.push(`--- ADDITIONAL INSTRUCTIONS ---\n${options.customInstructions}`);
    }

    return sections.join('\n\n');
  }
}

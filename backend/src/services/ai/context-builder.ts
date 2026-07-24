import { ProjectService } from '../project.service';
import { ConversationService } from '../conversation.service';
import { PromptBuilder } from './prompt-builder';
import { NormalizedPrompt } from '../../types/ai';

export interface BuildContextInput {
  userId: string;
  conversationId: string;
  currentUserMessage?: string;
  customInstructions?: string;
  memoriesContext?: string;
  maxMessages?: number;
  maxContextLength?: number;
}

export class ContextBuilder {
  private projectService: ProjectService;
  private conversationService: ConversationService;

  constructor(
    projectService: ProjectService = new ProjectService(),
    conversationService: ConversationService = new ConversationService(),
  ) {
    this.projectService = projectService;
    this.conversationService = conversationService;
  }

  async buildContext(input: BuildContextInput): Promise<NormalizedPrompt> {
    // 1. Fetch Conversation and verify ownership
    const conversation = await this.conversationService.getConversationById(
      input.userId,
      input.conversationId,
    );

    // 2. Fetch Project workspace details
    const project = await this.projectService.getProjectById(input.userId, conversation.projectId);

    // 3. Fetch Conversation message history
    const historyResult = await this.conversationService.getMessages(
      input.userId,
      input.conversationId,
      {
        page: 1,
        limit: input.maxMessages || 50,
      },
    );

    // 4. Delegate to PromptBuilder
    return PromptBuilder.build({
      project,
      conversation,
      messages: historyResult.data,
      currentUserMessage: input.currentUserMessage,
      customInstructions: input.customInstructions,
      memoriesContext: input.memoriesContext,
      maxMessages: input.maxMessages,
      maxContextLength: input.maxContextLength,
    });
  }
}

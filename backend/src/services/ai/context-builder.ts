import { ProjectService } from '../project.service';
import { ConversationService } from '../conversation.service';
import { VectorSearchService } from './vector/vector-search.service';
import { RAGMemoryFormatter } from './rag/rag-memory.formatter';
import { PromptBuilder } from './prompt-builder';
import { NormalizedPrompt } from '../../types/ai';
import { AI_CONFIG } from '../../config/ai';

export interface BuildContextInput {
  userId: string;
  conversationId: string;
  currentUserMessage?: string;
  customInstructions?: string;
  memoriesContext?: string;
  enableRag?: boolean;
  maxMessages?: number;
  maxContextLength?: number;
}

export class ContextBuilder {
  private projectService: ProjectService;
  private conversationService: ConversationService;
  private vectorSearchService: VectorSearchService;

  constructor(
    projectService: ProjectService = new ProjectService(),
    conversationService: ConversationService = new ConversationService(),
    vectorSearchService: VectorSearchService = new VectorSearchService(),
  ) {
    this.projectService = projectService;
    this.conversationService = conversationService;
    this.vectorSearchService = vectorSearchService;
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

    // 4. Perform RAG Memory Retrieval if enabled
    let memoriesContext = input.memoriesContext || '';
    let retrievedMemoriesCount = 0;
    const isRagEnabled = input.enableRag ?? AI_CONFIG.rag.enableRag;

    if (isRagEnabled && input.currentUserMessage && input.currentUserMessage.trim().length > 0) {
      try {
        const rawResults = await this.vectorSearchService.searchMemories(input.userId, {
          projectId: conversation.projectId,
          query: input.currentUserMessage,
          conversationId: conversation.id,
          minImportance: AI_CONFIG.rag.minMemoryImportance,
          threshold: AI_CONFIG.rag.similarityThreshold,
          topK: AI_CONFIG.rag.maxRagMemories,
        });

        const filteredResults = RAGMemoryFormatter.filterAndDeduplicate(rawResults);
        retrievedMemoriesCount = filteredResults.length;

        if (filteredResults.length > 0) {
          const ragText = RAGMemoryFormatter.formatRAGContext(filteredResults);
          memoriesContext = memoriesContext ? `${memoriesContext}\n\n${ragText}` : ragText;
        }
      } catch (_err) {
        retrievedMemoriesCount = 0;
      }
    }

    // 5. Delegate to PromptBuilder
    const promptPackage = PromptBuilder.build({
      project,
      conversation,
      messages: historyResult.data,
      currentUserMessage: input.currentUserMessage,
      customInstructions: input.customInstructions,
      memoriesContext,
      maxMessages: input.maxMessages,
      maxContextLength: input.maxContextLength,
    });

    promptPackage.metadata.retrievedMemoriesCount = retrievedMemoriesCount;
    promptPackage.metadata.ragEnabled = isRagEnabled;

    return promptPackage;
  }
}

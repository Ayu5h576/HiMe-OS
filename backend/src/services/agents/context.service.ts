import { AgentContext } from './agent.interface';
import { logger } from '../../config/logger';

export interface CreateContextInput {
  userId: string;
  originalPrompt: string;
  projectId?: string;
  conversationId?: string;
  initialData?: Record<string, unknown>;
}

export class AgentContextService {
  /**
   * Initializes a new thread-safe AgentContext container.
   */
  createContext(input: CreateContextInput): AgentContext {
    logger.debug(`[AgentContextService] Creating new AgentContext for user '${input.userId}'`);
    return {
      userId: input.userId,
      projectId: input.projectId,
      conversationId: input.conversationId,
      originalPrompt: input.originalPrompt,
      sharedData: input.initialData ? { ...input.initialData } : {},
      memories: [],
      artifacts: {},
      subtaskResults: {},
    };
  }

  /**
   * Safe mutation: Writes key-value pair to shared data without exposing object reference.
   */
  setSharedData(context: AgentContext, key: string, value: unknown): void {
    context.sharedData[key] = value;
  }

  /**
   * Safe mutation: Appends retrieved memory to shared context.
   */
  appendMemory(context: AgentContext, memoryContent: string): void {
    if (!context.memories.includes(memoryContent)) {
      context.memories.push(memoryContent);
    }
  }

  /**
   * Safe mutation: Stores artifact output from an agent execution.
   */
  setArtifact(context: AgentContext, key: string, artifact: unknown): void {
    context.artifacts[key] = artifact;
  }

  /**
   * Safe mutation: Records a subtask result in context.
   */
  recordSubTaskResult(context: AgentContext, subtaskId: string, output: unknown): void {
    context.subtaskResults[subtaskId] = output;
  }

  /**
   * Returns a deep clone of the context to prevent direct state corruption between subagents.
   */
  cloneContext(context: AgentContext): AgentContext {
    return {
      userId: context.userId,
      projectId: context.projectId,
      conversationId: context.conversationId,
      originalPrompt: context.originalPrompt,
      sharedData: JSON.parse(JSON.stringify(context.sharedData)),
      memories: [...context.memories],
      artifacts: JSON.parse(JSON.stringify(context.artifacts)),
      subtaskResults: JSON.parse(JSON.stringify(context.subtaskResults)),
    };
  }
}

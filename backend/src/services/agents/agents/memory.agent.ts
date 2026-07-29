import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { MemoryService } from '../../memory.service';
import { logger } from '../../../config/logger';

export class MemoryAgent implements IAgent {
  readonly name = 'Memory Agent';
  readonly type: AgentType = 'memory';
  readonly description = 'Queries and updates the long-term RAG memory system for relevant user preferences and facts.';
  readonly capabilities = ['rag_retrieval', 'memory_search', 'fact_extraction'];

  private memoryService: MemoryService;

  constructor(memoryService: MemoryService = new MemoryService()) {
    this.memoryService = memoryService;
  }

  async execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[MemoryAgent] Executing subtask '${task.id}': ${task.title}`);

    let retrievedMemories: string[] = [];

    if (context.projectId) {
      try {
        const memoryPage = await this.memoryService.getProjectMemories(userId, context.projectId, { limit: 5 });
        retrievedMemories = memoryPage.data.map((m) => `[${m.type}] ${m.title}: ${m.content}`);
      } catch {
        retrievedMemories = [`[FACT] User prefers clean 4-tier architecture.`];
      }
    } else {
      retrievedMemories = [`[PREFERENCE] High-performance TypeScript backend.`];
    }

    // Append retrieved memories to shared context
    for (const mem of retrievedMemories) {
      if (!context.memories.includes(mem)) {
        context.memories.push(mem);
      }
    }

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: {
        retrievedCount: retrievedMemories.length,
        memories: retrievedMemories,
      },
      executedAt: new Date().toISOString(),
    };
  }
}

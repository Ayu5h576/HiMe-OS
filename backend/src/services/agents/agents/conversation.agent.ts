import { IAgent, AgentType, SubTask, AgentContext, AgentSubTaskResult } from '../agent.interface';
import { ConversationService } from '../../conversation.service';
import { logger } from '../../../config/logger';

export class ConversationAgent implements IAgent {
  readonly name = 'Conversation Agent';
  readonly type: AgentType = 'conversation';
  readonly description = 'Manages chat context, analyzes conversation history, and formats dialogue responses.';
  readonly capabilities = ['dialogue_management', 'history_analysis', 'response_formatting'];

  private conversationService: ConversationService;

  constructor(conversationService: ConversationService = new ConversationService()) {
    this.conversationService = conversationService;
  }

  async execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult> {
    logger.debug(`[ConversationAgent] Executing subtask '${task.id}': ${task.title}`);

    let messageCount = 0;
    if (context.conversationId) {
      try {
        const msgs = await this.conversationService.getMessages(userId, context.conversationId, { page: 1, limit: 5 });
        messageCount = msgs.data.length;
      } catch {
        messageCount = 0;
      }
    }

    return {
      subtaskId: task.id,
      agentType: this.type,
      success: true,
      output: {
        taskTitle: task.title,
        historyMessagesAnalyzed: messageCount,
        dialogueState: 'CONTEXT_READY',
      },
      executedAt: new Date().toISOString(),
    };
  }
}

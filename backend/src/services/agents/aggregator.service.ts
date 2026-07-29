import { ExecutionPlan, AgentContext, AgentSubTaskResult } from './agent.interface';
import { logger } from '../../config/logger';

export class AgentAggregatorService {
  /**
   * Aggregates subtask results and context memories into a structured final synthesis.
   */
  async aggregateResults(
    plan: ExecutionPlan,
    subtaskResults: AgentSubTaskResult[],
    context: AgentContext,
  ): Promise<string> {
    logger.info(`[AgentAggregatorService] Aggregating results for plan '${plan.id}'`);

    const successfulResults = subtaskResults.filter((r) => r.success);
    const failedResults = subtaskResults.filter((r) => !r.success);

    const sections: string[] = [];

    sections.push(`### Multi-Agent Orchestration Summary`);
    sections.push(`**Goal**: ${plan.goal}`);
    sections.push(
      `**Subtasks Completed**: ${successfulResults.length} / ${subtaskResults.length} (Failed: ${failedResults.length})`,
    );

    if (context.memories.length > 0) {
      sections.push(`\n#### Referenced Context & Memories:`);
      for (const mem of context.memories) {
        sections.push(`- ${mem}`);
      }
    }

    sections.push(`\n#### Subtask Execution Details:`);
    for (const res of subtaskResults) {
      const statusIcon = res.success ? '✅' : '❌';
      const toolsInfo = res.toolsUsed && res.toolsUsed.length > 0 ? ` (Tools: ${res.toolsUsed.join(', ')})` : '';
      sections.push(`- ${statusIcon} **[${res.agentType.toUpperCase()}]** Task \`${res.subtaskId}\`${toolsInfo}`);

      if (res.success && res.output) {
        sections.push(`  \`\`\`json\n  ${JSON.stringify(res.output, null, 2)}\n  \`\`\``);
      } else if (res.error) {
        sections.push(`  *Error*: ${res.error}`);
      }
    }

    if (failedResults.length > 0) {
      sections.push(`\n> ⚠️ Note: ${failedResults.length} subtask(s) failed during execution.`);
    }

    return sections.join('\n');
  }
}

import { OrchestrationResult, AgentInfo } from './agent.interface';
import { AgentRegistry } from './registry.service';
import { AgentContextService } from './context.service';
import { AgentPlannerService } from './planner.service';
import { AgentExecutorService } from './executor.service';
import { AgentAggregatorService } from './aggregator.service';
import { AgentActivityService, AgentActivityLog } from './activity.service';
import { PlanningAgent } from './agents/planning.agent';
import { CodingAgent } from './agents/coding.agent';
import { MemoryAgent } from './agents/memory.agent';
import { ResearchAgent } from './agents/research.agent';
import { TaskAgent } from './agents/task.agent';
import { DeviceAgent } from './agents/device.agent';
import { ConversationAgent } from './agents/conversation.agent';
import { logger } from '../../config/logger';

export interface ExecuteOrchestrationInput {
  userId: string;
  prompt: string;
  projectId?: string;
  conversationId?: string;
  initialData?: Record<string, unknown>;
}

export class SupervisorAgentService {
  private registry: AgentRegistry;
  private contextService: AgentContextService;
  private plannerService: AgentPlannerService;
  private executorService: AgentExecutorService;
  private aggregatorService: AgentAggregatorService;
  private activityService: AgentActivityService;

  constructor(
    registry: AgentRegistry = AgentRegistry.getInstance(),
    contextService: AgentContextService = new AgentContextService(),
    plannerService: AgentPlannerService = new AgentPlannerService(),
    executorService: AgentExecutorService = new AgentExecutorService(),
    aggregatorService: AgentAggregatorService = new AgentAggregatorService(),
    activityService: AgentActivityService = new AgentActivityService(),
  ) {
    this.registry = registry;
    this.contextService = contextService;
    this.plannerService = plannerService;
    this.executorService = executorService;
    this.aggregatorService = aggregatorService;
    this.activityService = activityService;

    // Auto-register standard specialized agents if registry is uninitialized
    if (this.registry.listAgents().length === 0) {
      this.initializeStandardAgents();
    }
  }

  /**
   * Registers default specialized agents into the registry.
   */
  private initializeStandardAgents(): void {
    logger.info('[SupervisorAgentService] Initializing default specialized agents...');
    this.registry.registerAgent(new PlanningAgent());
    this.registry.registerAgent(new CodingAgent());
    this.registry.registerAgent(new MemoryAgent());
    this.registry.registerAgent(new ResearchAgent());
    this.registry.registerAgent(new TaskAgent());
    this.registry.registerAgent(new DeviceAgent());
    this.registry.registerAgent(new ConversationAgent());
  }

  /**
   * Main Orchestration Entry Point:
   * Coordinates Planning -> Parallel Subtask Execution -> Shared Context Updates -> Result Aggregation.
   */
  async executeOrchestration(input: ExecuteOrchestrationInput): Promise<OrchestrationResult> {
    logger.info(`[SupervisorAgentService] Starting multi-agent orchestration for user '${input.userId}'`);

    // 1. Initialize Shared Context
    const context = this.contextService.createContext({
      userId: input.userId,
      originalPrompt: input.prompt,
      projectId: input.projectId,
      conversationId: input.conversationId,
      initialData: input.initialData,
    });

    // 2. Planning Phase
    this.activityService.logActivity(input.userId, 'PLANNING_STARTED', { prompt: input.prompt });
    const plan = await this.plannerService.createPlan(input.prompt, context);
    this.activityService.logActivity(input.userId, 'PLAN_CREATED', {
      planId: plan.id,
      subtaskCount: plan.subtasks.length,
    }, plan.id);

    // 3. Parallel Wave Execution Phase with Retries
    const subtaskResults = await this.executorService.executePlan(plan, context);

    // 4. Result Aggregation Phase
    this.activityService.logActivity(input.userId, 'AGGREGATION_STARTED', {}, plan.id);
    const aggregatedResult = await this.aggregatorService.aggregateResults(plan, subtaskResults, context);
    this.activityService.logActivity(input.userId, 'AGGREGATION_COMPLETED', {
      totalSubtasks: subtaskResults.length,
      successfulSubtasks: subtaskResults.filter((r) => r.success).length,
    }, plan.id);

    return {
      planId: plan.id,
      goal: plan.goal,
      executionPlan: plan,
      aggregatedResult,
      subtaskResults,
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns list of registered specialized agents.
   */
  getAgents(): AgentInfo[] {
    return this.registry.listAgents();
  }

  /**
   * Returns activity logs for a user.
   */
  getActivityLogs(userId: string, limit?: number): AgentActivityLog[] {
    return this.activityService.getLogs(userId, limit);
  }

  /**
   * Returns status information for the orchestration framework.
   */
  getFrameworkStatus(): {
    active: boolean;
    registeredAgentCount: number;
    agents: string[];
    timestamp: string;
  } {
    const agents = this.registry.listAgents();
    return {
      active: true,
      registeredAgentCount: agents.length,
      agents: agents.map((a) => `${a.name} (${a.type})`),
      timestamp: new Date().toISOString(),
    };
  }
}

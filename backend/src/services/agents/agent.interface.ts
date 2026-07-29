/**
 * Multi-Agent Orchestration Framework Interfaces for HiMe OS.
 *
 * Defines contracts for Specialized Agents, Tasks, Execution Plans,
 * Shared Context, and Orchestration Results.
 */

export type AgentType =
  | 'supervisor'
  | 'planning'
  | 'coding'
  | 'memory'
  | 'research'
  | 'task'
  | 'device'
  | 'conversation'
  | string;

export type SubTaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface SubTask {
  id: string;
  title: string;
  description: string;
  agentType: AgentType;
  status: SubTaskStatus;
  dependencies: string[]; // Subtask IDs that must complete before this runs
  result?: unknown;
  error?: string;
  retryCount: number;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentContext {
  userId: string;
  projectId?: string;
  conversationId?: string;
  originalPrompt: string;
  sharedData: Record<string, unknown>;
  memories: string[];
  artifacts: Record<string, unknown>;
  subtaskResults: Record<string, unknown>;
}

export interface AgentSubTaskResult {
  subtaskId: string;
  agentType: AgentType;
  success: boolean;
  output: unknown;
  toolsUsed?: string[];
  error?: string;
  executedAt: string;
}

export interface IAgent {
  readonly name: string;
  readonly type: AgentType;
  readonly description: string;
  readonly capabilities: string[];

  execute(task: SubTask, context: AgentContext, userId: string): Promise<AgentSubTaskResult>;
}

export interface AgentInfo {
  name: string;
  type: AgentType;
  description: string;
  capabilities: string[];
}

export interface OrchestrationResult {
  planId: string;
  goal: string;
  executionPlan: ExecutionPlan;
  aggregatedResult: string;
  subtaskResults: AgentSubTaskResult[];
  executedAt: string;
}

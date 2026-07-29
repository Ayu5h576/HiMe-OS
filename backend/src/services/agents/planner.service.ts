import { ExecutionPlan, SubTask, AgentContext } from './agent.interface';
import { logger } from '../../config/logger';

export class AgentPlannerService {
  /**
   * Decomposes a high-level user prompt into a structured, dependency-aware ExecutionPlan.
   */
  async createPlan(prompt: string, context: AgentContext): Promise<ExecutionPlan> {
    logger.info(`[AgentPlannerService] Creating execution plan for prompt: "${prompt}"`);

    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const lowerPrompt = prompt.toLowerCase();

    const subtasks: SubTask[] = [];

    // 1. Always include a Planning Subtask first
    const st1: SubTask = {
      id: `task-1-plan`,
      title: 'Analyze Requirements & Formulate Execution Architecture',
      description: `Break down goals for: "${prompt}"`,
      agentType: 'planning',
      status: 'PENDING',
      dependencies: [],
      retryCount: 0,
    };
    subtasks.push(st1);

    // 2. Add Memory retrieval subtask if memory/facts referenced or by default
    const st2: SubTask = {
      id: `task-2-memory`,
      title: 'Retrieve Contextual Memories & Preferences',
      description: 'Search long-term RAG memory store for relevant facts',
      agentType: 'memory',
      status: 'PENDING',
      dependencies: ['task-1-plan'],
      retryCount: 0,
    };
    subtasks.push(st2);

    // 3. Add Research subtask
    const st3: SubTask = {
      id: `task-3-research`,
      title: 'Inspect Host System & Research Dependencies',
      description: 'Perform environment research and gather diagnostic data',
      agentType: 'research',
      status: 'PENDING',
      dependencies: ['task-1-plan'],
      retryCount: 0,
    };
    subtasks.push(st3);

    // 4. Domain-specific subtasks based on prompt context
    if (lowerPrompt.includes('code') || lowerPrompt.includes('script') || lowerPrompt.includes('build') || lowerPrompt.includes('implement')) {
      subtasks.push({
        id: `task-4-coding`,
        title: 'Generate and Inspect Technical Code Implementation',
        description: `Implement technical solution for: "${prompt}"`,
        agentType: 'coding',
        status: 'PENDING',
        dependencies: ['task-2-memory', 'task-3-research'],
        retryCount: 0,
      });
    }

    if (lowerPrompt.includes('task') || lowerPrompt.includes('todo') || lowerPrompt.includes('manage')) {
      subtasks.push({
        id: `task-5-task`,
        title: 'Align Task Management Workspace',
        description: 'Check active task list and record updates',
        agentType: 'task',
        status: 'PENDING',
        dependencies: ['task-1-plan'],
        retryCount: 0,
      });
    }

    if (lowerPrompt.includes('device') || lowerPrompt.includes('iot') || lowerPrompt.includes('light') || lowerPrompt.includes('sensor')) {
      subtasks.push({
        id: `task-6-device`,
        title: 'Inspect Connected Devices & Hardware Telemetry',
        description: 'Interact with Device Framework to read device states',
        agentType: 'device',
        status: 'PENDING',
        dependencies: ['task-1-plan'],
        retryCount: 0,
      });
    }

    // Default fallback specialized subtask if no domain keywords matched
    if (subtasks.length === 3) {
      subtasks.push({
        id: `task-4-coding`,
        title: 'Execute Technical Logic & Asset Construction',
        description: `Synthesize code and solution components for: "${prompt}"`,
        agentType: 'coding',
        status: 'PENDING',
        dependencies: ['task-2-memory', 'task-3-research'],
        retryCount: 0,
      });
    }

    const now = new Date().toISOString();
    return {
      id: planId,
      goal: prompt,
      subtasks,
      createdAt: now,
      updatedAt: now,
    };
  }
}

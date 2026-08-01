import { IAgent, AgentType, AgentInfo } from './agent.interface';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../config/logger';

/**
 * AgentRegistry — Singleton registry for specialized AI agents.
 *
 * Stores agent instances by type/name. Designed so new agent types can be
 * registered dynamically at runtime without modifying existing core logic.
 */
export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<AgentType, IAgent> = new Map();

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Registers a specialized agent.
   */
  registerAgent(agent: IAgent): void {
    logger.info(`[AgentRegistry] Registering agent: ${agent.name} (type: ${agent.type})`);
    this.agents.set(agent.type, agent);
  }

  /**
   * Retrieves an agent by its type.
   */
  getAgent(type: AgentType): IAgent {
    const agent = this.agents.get(type);
    if (!agent) {
      throw new NotFoundError(
        `Specialized Agent of type '${type}' is not registered in HiMe OS Agent Registry. Available types: ${Array.from(this.agents.keys()).join(', ')}`,
      );
    }
    return agent;
  }

  /**
   * Checks whether an agent type is registered.
   */
  hasAgent(type: AgentType): boolean {
    return this.agents.has(type);
  }

  /**
   * Returns list of all registered agents' metadata.
   */
  listAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).map((agent) => ({
      name: agent.name,
      type: agent.type,
      description: agent.description,
      capabilities: agent.capabilities,
    }));
  }

  /**
   * Clears all registered agents (for testing).
   */
  clear(): void {
    this.agents.clear();
  }
}

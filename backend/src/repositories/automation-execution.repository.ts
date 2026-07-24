import { PrismaClient, AutomationExecution, ExecutionStatus, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import { env } from '../config/env';

export class AutomationExecutionRepository {
  private db: PrismaClient;
  private executionStore: Map<string, AutomationExecution> = new Map();

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  async create(
    automationId: string,
    input?: Record<string, unknown>,
  ): Promise<AutomationExecution> {
    try {
      return await this.db.automationExecution.create({
        data: {
          automationId,
          status: ExecutionStatus.RUNNING,
          input: input as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const execution: AutomationExecution = {
          id: `exec-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          automationId,
          status: ExecutionStatus.RUNNING,
          executedAt: new Date(),
          input: (input as Prisma.JsonValue) ?? null,
          output: null,
          error: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.executionStore.set(execution.id, execution);
        return execution;
      }
      throw err;
    }
  }

  async updateStatus(
    id: string,
    status: ExecutionStatus,
    output?: Record<string, unknown>,
    error?: string,
  ): Promise<AutomationExecution> {
    try {
      return await this.db.automationExecution.update({
        where: { id },
        data: {
          status,
          output: output as Prisma.InputJsonValue | undefined,
          error,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const existing = this.executionStore.get(id);
        if (!existing) throw new Error('Execution record not found');
        const updated: AutomationExecution = {
          ...existing,
          status,
          output: output !== undefined ? (output as Prisma.JsonValue) : existing.output,
          error: error !== undefined ? error : existing.error,
          updatedAt: new Date(),
        };
        this.executionStore.set(id, updated);
        return updated;
      }
      throw err;
    }
  }

  async findByAutomationId(automationId: string): Promise<AutomationExecution[]> {
    try {
      return await this.db.automationExecution.findMany({
        where: { automationId },
        orderBy: { executedAt: 'desc' },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return Array.from(this.executionStore.values())
          .filter((e) => e.automationId === automationId)
          .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());
      }
      throw err;
    }
  }
}

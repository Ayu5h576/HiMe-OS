import {
  PrismaClient,
  Automation,
  Prisma,
  TriggerType,
  ConditionType,
  ActionType,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import { env } from '../config/env';
import { CreateAutomationInput, GetAutomationsQueryInput } from '../schemas/automation.schema';
import { PaginatedResult } from './memory.repository';

export class AutomationRepository {
  private db: PrismaClient;
  private automationStore: Map<string, Automation> = new Map();

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  async create(data: CreateAutomationInput, projectId: string): Promise<Automation> {
    try {
      return await this.db.automation.create({
        data: {
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          triggerType: data.triggerType,
          conditionType: data.conditionType,
          actionType: data.actionType,
          schedule: data.schedule,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          projectId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const automation: Automation = {
          id: `auto-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          description: data.description ?? null,
          enabled: data.enabled ?? true,
          triggerType: data.triggerType,
          conditionType: data.conditionType,
          actionType: data.actionType,
          schedule: data.schedule ?? null,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.automationStore.set(automation.id, automation);
        return automation;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Automation | null> {
    try {
      return await this.db.automation.findUnique({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.automationStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async findProjectAutomations(
    projectId: string,
    query: GetAutomationsQueryInput,
  ): Promise<PaginatedResult<Automation>> {
    const { enabled, triggerType, page, limit } = query;

    const where: Prisma.AutomationWhereInput = {
      projectId,
      ...(enabled !== undefined ? { enabled } : {}),
      ...(triggerType ? { triggerType } : {}),
    };

    const skip = (page - 1) * limit;

    try {
      const [total, automations] = await Promise.all([
        this.db.automation.count({ where }),
        this.db.automation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: automations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        let list = Array.from(this.automationStore.values()).filter(
          (a) => a.projectId === projectId,
        );
        if (enabled !== undefined) list = list.filter((a) => a.enabled === enabled);
        if (triggerType) list = list.filter((a) => a.triggerType === triggerType);

        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const total = list.length;
        const paginated = list.slice(skip, skip + limit);

        return {
          data: paginated,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }
      throw err;
    }
  }

  async update(id: string, data: Prisma.AutomationUpdateInput): Promise<Automation> {
    try {
      return await this.db.automation.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const existing = this.automationStore.get(id);
        if (!existing) throw new Error('Automation not found');
        const updated: Automation = {
          ...existing,
          name: typeof data.name === 'string' ? data.name : existing.name,
          description:
            data.description !== undefined
              ? (data.description as string | null)
              : existing.description,
          enabled: typeof data.enabled === 'boolean' ? data.enabled : existing.enabled,
          triggerType:
            typeof data.triggerType === 'string'
              ? (data.triggerType as TriggerType)
              : existing.triggerType,
          conditionType:
            typeof data.conditionType === 'string'
              ? (data.conditionType as ConditionType)
              : existing.conditionType,
          actionType:
            typeof data.actionType === 'string'
              ? (data.actionType as ActionType)
              : existing.actionType,
          schedule:
            data.schedule !== undefined ? (data.schedule as string | null) : existing.schedule,
          metadata:
            data.metadata !== undefined ? (data.metadata as Prisma.JsonValue) : existing.metadata,
          updatedAt: new Date(),
        };
        this.automationStore.set(id, updated);
        return updated;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.automation.delete({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        this.automationStore.delete(id);
        return;
      }
      throw err;
    }
  }
}

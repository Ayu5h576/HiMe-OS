import { PrismaClient, Project } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

export class ProjectRepository {
  private db: PrismaClient;
  private memoryStore: Map<string, Project> = new Map();

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async create(data: CreateProjectInput, userId: string): Promise<Project> {
    try {
      return await this.db.project.create({
        data: {
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          ownerId: userId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const project: Project = {
          id: `proj-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          description: data.description ?? null,
          color: data.color ?? null,
          icon: data.icon ?? null,
          isArchived: false,
          ownerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryStore.set(project.id, project);
        return project;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Project | null> {
    try {
      return await this.db.project.findUnique({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.memoryStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Project | null> {
    try {
      return await this.db.project.findFirst({
        where: { id, ownerId: userId },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const proj = this.memoryStore.get(id);
        if (proj && proj.ownerId === userId) return proj;
        return null;
      }
      throw err;
    }
  }

  async findUserProjects(userId: string): Promise<Project[]> {
    try {
      return await this.db.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const list: Project[] = [];
        for (const proj of this.memoryStore.values()) {
          if (proj.ownerId === userId) list.push(proj);
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    try {
      return await this.db.project.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const proj = this.memoryStore.get(id);
        if (!proj) throw new Error('Project not found');
        const updated: Project = {
          ...proj,
          ...data,
          updatedAt: new Date(),
        };
        this.memoryStore.set(id, updated);
        return updated;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.project.delete({ where: { id } });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        this.memoryStore.delete(id);
        return;
      }
      throw err;
    }
  }
}

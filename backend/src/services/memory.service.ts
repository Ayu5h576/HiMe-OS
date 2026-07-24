import { Memory, Prisma } from '@prisma/client';
import { MemoryRepository, PaginatedResult } from '../repositories/memory.repository';
import { ProjectService } from './project.service';
import { NotFoundError } from '../utils/errors';
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  GetMemoriesQueryInput,
} from '../schemas/memory.schema';

export class MemoryService {
  private repository: MemoryRepository;
  private projectService: ProjectService;

  constructor(
    repository: MemoryRepository = new MemoryRepository(),
    projectService: ProjectService = new ProjectService(),
  ) {
    this.repository = repository;
    this.projectService = projectService;
  }

  async createMemory(userId: string, projectId: string, input: CreateMemoryInput): Promise<Memory> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.repository.create(input, projectId);
  }

  async getProjectMemories(
    userId: string,
    projectId: string,
    query: GetMemoriesQueryInput,
  ): Promise<PaginatedResult<Memory>> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.repository.findProjectMemories(projectId, query);
  }

  async getMemoryById(userId: string, memoryId: string): Promise<Memory> {
    const memory = await this.repository.findById(memoryId);
    if (!memory) {
      throw new NotFoundError('Memory not found');
    }
    // Verify user owns the project to which this memory belongs
    await this.projectService.getProjectById(userId, memory.projectId);
    return memory;
  }

  async updateMemory(userId: string, memoryId: string, input: UpdateMemoryInput): Promise<Memory> {
    await this.getMemoryById(userId, memoryId);

    const updateData: Prisma.MemoryUpdateInput = {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.importance !== undefined && { importance: input.importance }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.metadata !== undefined && {
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      }),
    };

    return this.repository.update(memoryId, updateData);
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    await this.getMemoryById(userId, memoryId);
    await this.repository.delete(memoryId);
  }
}

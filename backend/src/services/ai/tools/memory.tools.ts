import { z } from 'zod';
import { MemoryType } from '@prisma/client';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { MemoryService } from '../../memory.service';
import { VectorSearchService } from '../vector/vector-search.service';

export class CreateMemoryTool implements ITool {
  readonly name = 'createMemory';
  readonly description = 'Save a new memory (note, fact, preference, summary) in a project.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    title: z.string().min(1, 'title is required').max(200),
    content: z.string().min(1, 'content is required'),
    type: z.nativeEnum(MemoryType).default(MemoryType.NOTE),
    importance: z.number().int().min(1).max(10).default(1),
    tags: z.array(z.string()).default([]),
  });

  private memoryService: MemoryService;

  constructor(memoryService: MemoryService = new MemoryService()) {
    this.memoryService = memoryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          type: { type: 'string', enum: Object.values(MemoryType) },
          importance: { type: 'number', minimum: 1, maximum: 10 },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['projectId', 'title', 'content'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const memory = await this.memoryService.createMemory(userId, validated.projectId, {
      title: validated.title,
      content: validated.content,
      type: validated.type ?? MemoryType.NOTE,
      importance: validated.importance ?? 1,
      tags: validated.tags ?? [],
    });
    return ToolResponseFormatter.success(this.name, memory);
  }
}

export class SearchMemoryTool implements ITool {
  readonly name = 'searchMemory';
  readonly description = 'Perform a semantic vector search for relevant project memories.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    query: z.string().min(1, 'query is required'),
    topK: z.number().int().min(1).max(20).default(5),
  });

  private vectorSearchService: VectorSearchService;

  constructor(vectorSearchService: VectorSearchService = new VectorSearchService()) {
    this.vectorSearchService = vectorSearchService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          query: { type: 'string' },
          topK: { type: 'number', minimum: 1, maximum: 20 },
        },
        required: ['projectId', 'query'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const results = await this.vectorSearchService.searchMemories(userId, {
      projectId: validated.projectId,
      query: validated.query,
      topK: validated.topK ?? 5,
    });
    return ToolResponseFormatter.success(this.name, results);
  }
}

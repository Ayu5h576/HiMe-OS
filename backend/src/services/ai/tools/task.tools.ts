import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { TaskService } from '../../task.service';

export class CreateTaskTool implements ITool {
  readonly name = 'createTask';
  readonly description = 'Create a new task in a project workspace.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    title: z.string().min(1, 'title is required').max(200),
    description: z.string().max(1000).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().optional(),
  });

  private taskService: TaskService;

  constructor(taskService: TaskService = new TaskService()) {
    this.taskService = taskService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of project workspace' },
          title: { type: 'string', description: 'Title of the task' },
          description: { type: 'string', description: 'Task description' },
          priority: { type: 'string', enum: Object.values(TaskPriority) },
          dueDate: { type: 'string', description: 'ISO date string' },
        },
        required: ['projectId', 'title'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const task = await this.taskService.createTask(userId, validated.projectId, {
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });
    return ToolResponseFormatter.success(this.name, task);
  }
}

export class UpdateTaskTool implements ITool {
  readonly name = 'updateTask';
  readonly description = 'Update an existing task status, priority, or details.';
  readonly parameterSchema = z.object({
    taskId: z.string().min(1, 'taskId is required'),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
  });

  private taskService: TaskService;

  constructor(taskService: TaskService = new TaskService()) {
    this.taskService = taskService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: Object.values(TaskStatus) },
          priority: { type: 'string', enum: Object.values(TaskPriority) },
        },
        required: ['taskId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const task = await this.taskService.updateTask(userId, validated.taskId, {
      title: validated.title,
      description: validated.description ?? undefined,
      status: validated.status,
      priority: validated.priority,
    });
    return ToolResponseFormatter.success(this.name, task);
  }
}

export class DeleteTaskTool implements ITool {
  readonly name = 'deleteTask';
  readonly description = 'Delete a task from a project.';
  readonly parameterSchema = z.object({
    taskId: z.string().min(1, 'taskId is required'),
  });

  private taskService: TaskService;

  constructor(taskService: TaskService = new TaskService()) {
    this.taskService = taskService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to delete' },
        },
        required: ['taskId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    await this.taskService.deleteTask(userId, validated.taskId);
    return ToolResponseFormatter.success(this.name, { deleted: true, taskId: validated.taskId });
  }
}

export class ListTasksTool implements ITool {
  readonly name = 'listTasks';
  readonly description = 'List tasks in a project workspace.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  });

  private taskService: TaskService;

  constructor(taskService: TaskService = new TaskService()) {
    this.taskService = taskService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          status: { type: 'string', enum: Object.values(TaskStatus) },
          priority: { type: 'string', enum: Object.values(TaskPriority) },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
        required: ['projectId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const result = await this.taskService.getProjectTasks(userId, validated.projectId, {
      status: validated.status,
      priority: validated.priority,
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return ToolResponseFormatter.success(this.name, result);
  }
}

import { Task, TaskStatus, Prisma } from '@prisma/client';
import { TaskRepository, PaginatedResult } from '../repositories/task.repository';
import { ProjectService } from './project.service';
import { NotFoundError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput, GetTasksQueryInput } from '../schemas/task.schema';

export class TaskService {
  private repository: TaskRepository;
  private projectService: ProjectService;

  constructor(
    repository: TaskRepository = new TaskRepository(),
    projectService: ProjectService = new ProjectService(),
  ) {
    this.repository = repository;
    this.projectService = projectService;
  }

  async createTask(userId: string, projectId: string, input: CreateTaskInput): Promise<Task> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.repository.create(input, projectId);
  }

  async getProjectTasks(
    userId: string,
    projectId: string,
    query: GetTasksQueryInput,
  ): Promise<PaginatedResult<Task>> {
    // Verify project exists and belongs to authenticated user
    await this.projectService.getProjectById(userId, projectId);
    return this.repository.findProjectTasks(projectId, query);
  }

  async getTaskById(userId: string, taskId: string): Promise<Task> {
    const task = await this.repository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    // Verify user owns the project to which this task belongs
    await this.projectService.getProjectById(userId, task.projectId);
    return task;
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    const existingTask = await this.getTaskById(userId, taskId);

    const updateData: Prisma.TaskUpdateInput = {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    };

    // Business rule: Manage completedAt status transitions
    if (input.status !== undefined) {
      if (input.status === TaskStatus.COMPLETED) {
        if (existingTask.status !== TaskStatus.COMPLETED) {
          updateData.completedAt = new Date();
        }
      } else {
        if (existingTask.status === TaskStatus.COMPLETED) {
          updateData.completedAt = null;
        }
      }
    }

    return this.repository.update(taskId, updateData);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.getTaskById(userId, taskId);
    await this.repository.delete(taskId);
  }
}

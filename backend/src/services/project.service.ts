import { Project } from '@prisma/client';
import { ProjectRepository } from '../repositories/project.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

export class ProjectService {
  private repository: ProjectRepository;

  constructor(repository: ProjectRepository = new ProjectRepository()) {
    this.repository = repository;
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    return this.repository.create(input, userId);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return this.repository.findUserProjects(userId);
  }

  async getProjectById(userId: string, projectId: string): Promise<Project> {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    if (project.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }
    return project;
  }

  async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    await this.getProjectById(userId, projectId);
    return this.repository.update(projectId, input);
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    await this.getProjectById(userId, projectId);
    await this.repository.delete(projectId);
  }
}

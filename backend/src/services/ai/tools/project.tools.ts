import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { ProjectService } from '../../project.service';

export class ListProjectsTool implements ITool {
  readonly name = 'listProjects';
  readonly description = 'List project workspaces owned by the current user.';
  readonly parameterSchema = z.object({
    includeArchived: z.boolean().default(false),
  });

  private projectService: ProjectService;

  constructor(projectService: ProjectService = new ProjectService()) {
    this.projectService = projectService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          includeArchived: { type: 'boolean' },
        },
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    ToolValidator.validate(this.parameterSchema, params, this.name);
    const projects = await this.projectService.getUserProjects(userId);
    return ToolResponseFormatter.success(this.name, projects);
  }
}

export class GetProjectTool implements ITool {
  readonly name = 'getProject';
  readonly description = 'Retrieve details of a single project workspace.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
  });

  private projectService: ProjectService;

  constructor(projectService: ProjectService = new ProjectService()) {
    this.projectService = projectService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
        },
        required: ['projectId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const project = await this.projectService.getProjectById(userId, validated.projectId);
    return ToolResponseFormatter.success(this.name, project);
  }
}

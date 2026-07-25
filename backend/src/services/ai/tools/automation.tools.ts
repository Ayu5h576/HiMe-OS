import { z } from 'zod';
import { TriggerType } from '@prisma/client';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { AutomationService } from '../../automation/automation.service';

export class RunAutomationTool implements ITool {
  readonly name = 'runAutomation';
  readonly description = 'Trigger an internal automation rule execution.';
  readonly parameterSchema = z.object({
    automationId: z.string().min(1, 'automationId is required'),
    input: z.record(z.unknown()).optional(),
  });

  private automationService: AutomationService;

  constructor(automationService: AutomationService = new AutomationService()) {
    this.automationService = automationService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          automationId: { type: 'string' },
          input: { type: 'object' },
        },
        required: ['automationId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const execution = await this.automationService.runAutomation(
      userId,
      validated.automationId,
      validated.input,
    );
    return ToolResponseFormatter.success(this.name, execution);
  }
}

export class ListAutomationsTool implements ITool {
  readonly name = 'listAutomations';
  readonly description = 'List automation rules configured for a project.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    enabled: z.boolean().optional(),
    triggerType: z.nativeEnum(TriggerType).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  });

  private automationService: AutomationService;

  constructor(automationService: AutomationService = new AutomationService()) {
    this.automationService = automationService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          enabled: { type: 'boolean' },
          triggerType: { type: 'string', enum: Object.values(TriggerType) },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
        required: ['projectId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const result = await this.automationService.getProjectAutomations(userId, validated.projectId, {
      enabled: validated.enabled,
      triggerType: validated.triggerType,
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
    });
    return ToolResponseFormatter.success(this.name, result);
  }
}

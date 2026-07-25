import { z } from 'zod';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { ConversationService } from '../../conversation.service';

export class CreateConversationTool implements ITool {
  readonly name = 'createConversation';
  readonly description = 'Start a new conversation thread in a project workspace.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    title: z.string().min(1, 'title is required').max(200),
  });

  private conversationService: ConversationService;

  constructor(conversationService: ConversationService = new ConversationService()) {
    this.conversationService = conversationService;
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
        },
        required: ['projectId', 'title'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const conversation = await this.conversationService.createConversation(
      userId,
      validated.projectId,
      {
        title: validated.title,
      },
    );
    return ToolResponseFormatter.success(this.name, conversation);
  }
}

export class GetConversationTool implements ITool {
  readonly name = 'getConversation';
  readonly description = 'Retrieve conversation details and message metadata.';
  readonly parameterSchema = z.object({
    conversationId: z.string().min(1, 'conversationId is required'),
  });

  private conversationService: ConversationService;

  constructor(conversationService: ConversationService = new ConversationService()) {
    this.conversationService = conversationService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          conversationId: { type: 'string' },
        },
        required: ['conversationId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
    const conversation = await this.conversationService.getConversationById(
      userId,
      validated.conversationId,
    );
    return ToolResponseFormatter.success(this.name, conversation);
  }
}

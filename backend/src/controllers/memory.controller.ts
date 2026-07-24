import { FastifyRequest, FastifyReply } from 'fastify';
import { MemoryService } from '../services/memory.service';
import {
  createMemorySchema,
  updateMemorySchema,
  getMemoriesQuerySchema,
  memoryIdSchema,
  projectIdParamSchema,
} from '../schemas/memory.schema';

export class MemoryController {
  private service: MemoryService;

  constructor(service: MemoryService = new MemoryService()) {
    this.service = service;
  }

  createMemory = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const body = createMemorySchema.parse(req.body);
    const userId = req.user.id;
    const memory = await this.service.createMemory(userId, projectId, body);
    return reply.status(201).send({ success: true, data: memory });
  };

  getProjectMemories = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const query = getMemoriesQuerySchema.parse(req.query);
    const userId = req.user.id;
    const result = await this.service.getProjectMemories(userId, projectId, query);
    return reply.status(200).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };

  getMemoryById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = memoryIdSchema.parse(req.params);
    const userId = req.user.id;
    const memory = await this.service.getMemoryById(userId, id);
    return reply.status(200).send({ success: true, data: memory });
  };

  updateMemory = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = memoryIdSchema.parse(req.params);
    const body = updateMemorySchema.parse(req.body);
    const userId = req.user.id;
    const memory = await this.service.updateMemory(userId, id, body);
    return reply.status(200).send({ success: true, data: memory });
  };

  deleteMemory = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = memoryIdSchema.parse(req.params);
    const userId = req.user.id;
    await this.service.deleteMemory(userId, id);
    return reply.status(204).send();
  };
}

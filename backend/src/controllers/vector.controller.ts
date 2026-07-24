import { FastifyRequest, FastifyReply } from 'fastify';
import { VectorSearchService } from '../services/ai/vector/vector-search.service';
import {
  vectorSearchSchema,
  reindexSchema,
  similarMemoryQuerySchema,
} from '../schemas/vector.schema';

export class VectorController {
  private vectorSearchService: VectorSearchService;

  constructor(vectorSearchService: VectorSearchService = new VectorSearchService()) {
    this.vectorSearchService = vectorSearchService;
  }

  search = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = vectorSearchSchema.parse(req.body);
    const userId = req.user.id;

    const results = await this.vectorSearchService.searchMemories(userId, input);

    return reply.status(200).send({
      success: true,
      data: results,
    });
  };

  reindex = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = reindexSchema.parse(req.body);
    const userId = req.user.id;

    const result = await this.vectorSearchService.reindexProjectMemories(userId, projectId);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  };

  similar = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const query = similarMemoryQuerySchema.parse(req.query);
    const userId = req.user.id;

    const results = await this.vectorSearchService.findSimilarMemories(userId, id, query);

    return reply.status(200).send({
      success: true,
      data: results,
    });
  };
}

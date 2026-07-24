import { ProjectService } from '../../project.service';
import { MemoryService } from '../../memory.service';
import { EmbeddingService } from './embedding.service';
import { VectorRepository } from './vector.repository';
import { SimilarityService } from './similarity.service';
import { RankingService } from './ranking.service';
import { SearchMemoryOptions, VectorSearchResult } from '../../../types/vector';
import { AI_CONFIG } from '../../../config/ai';

export class VectorSearchService {
  private projectService: ProjectService;
  private memoryService: MemoryService;
  private embeddingService: EmbeddingService;
  private vectorRepository: VectorRepository;

  constructor(
    projectService: ProjectService = new ProjectService(),
    memoryService: MemoryService = new MemoryService(),
    embeddingService: EmbeddingService = new EmbeddingService(),
    vectorRepository: VectorRepository = new VectorRepository(),
  ) {
    this.projectService = projectService;
    this.memoryService = memoryService;
    this.embeddingService = embeddingService;
    this.vectorRepository = vectorRepository;
  }

  async searchMemories(
    userId: string,
    options: SearchMemoryOptions,
  ): Promise<VectorSearchResult[]> {
    // 1. Validate project existence & ownership
    await this.projectService.getProjectById(userId, options.projectId);

    // 2. Generate embedding for search query
    const queryVector = await this.embeddingService.generateEmbedding(options.query);

    // 3. Fetch candidate memories
    const candidateMemories = await this.vectorRepository.findMemoriesForVectorSearch(
      options.projectId,
      {
        conversationId: options.conversationId,
        type: options.type,
        minImportance: options.minImportance,
      },
    );

    const threshold = options.threshold ?? AI_CONFIG.vector.similarityThreshold;
    const topK = options.topK ?? AI_CONFIG.vector.maxMemoryResults;

    // 4. Compute cosine similarity & filter by threshold
    const items: Array<{ memory: (typeof candidateMemories)[0]; similarity: number }> = [];

    for (const memory of candidateMemories) {
      let memoryVector = memory.embedding;

      // If embedding missing on memory, auto-generate and persist
      if (!memoryVector || memoryVector.length === 0) {
        memoryVector = await this.embeddingService.generateEmbedding(
          `${memory.title}\n${memory.content}`,
        );
        await this.vectorRepository.saveEmbedding(memory.id, memoryVector);
        memory.embedding = memoryVector;
      }

      const similarity = SimilarityService.cosineSimilarity(queryVector, memoryVector);

      if (similarity >= threshold) {
        items.push({ memory, similarity });
      }
    }

    // 5. Apply multi-factor ranking & sort
    const ranked = RankingService.rankAndSort(items);

    // 6. Return top-K results
    return ranked.slice(0, topK);
  }

  async reindexProjectMemories(
    userId: string,
    projectId: string,
  ): Promise<{ reindexedCount: number }> {
    await this.projectService.getProjectById(userId, projectId);

    const memories = await this.vectorRepository.findMemoriesForVectorSearch(projectId);

    let reindexedCount = 0;

    for (const memory of memories) {
      const textToEmbed = `${memory.title}\n${memory.content}`;
      const embedding = await this.embeddingService.generateEmbedding(textToEmbed);
      await this.vectorRepository.saveEmbedding(memory.id, embedding);
      reindexedCount += 1;
    }

    return { reindexedCount };
  }

  async findSimilarMemories(
    userId: string,
    memoryId: string,
    options?: { topK?: number; threshold?: number },
  ): Promise<VectorSearchResult[]> {
    // 1. Fetch memory and check ownership
    const targetMemory = await this.memoryService.getMemoryById(userId, memoryId);

    let targetVector = targetMemory.embedding;
    if (!targetVector || targetVector.length === 0) {
      targetVector = await this.embeddingService.generateEmbedding(
        `${targetMemory.title}\n${targetMemory.content}`,
      );
      await this.vectorRepository.saveEmbedding(targetMemory.id, targetVector);
    }

    // 2. Fetch sibling memories in the same project excluding target memory
    const candidateMemories = await this.vectorRepository.findMemoriesForVectorSearch(
      targetMemory.projectId,
    );

    const filteredCandidates = candidateMemories.filter((m) => m.id !== targetMemory.id);

    const threshold = options?.threshold ?? AI_CONFIG.vector.similarityThreshold;
    const topK = options?.topK ?? AI_CONFIG.vector.maxMemoryResults;

    const items: Array<{ memory: (typeof filteredCandidates)[0]; similarity: number }> = [];

    for (const memory of filteredCandidates) {
      let memoryVector = memory.embedding;
      if (!memoryVector || memoryVector.length === 0) {
        memoryVector = await this.embeddingService.generateEmbedding(
          `${memory.title}\n${memory.content}`,
        );
        await this.vectorRepository.saveEmbedding(memory.id, memoryVector);
        memory.embedding = memoryVector;
      }

      const similarity = SimilarityService.cosineSimilarity(targetVector, memoryVector);

      if (similarity >= threshold) {
        items.push({ memory, similarity });
      }
    }

    const ranked = RankingService.rankAndSort(items);
    return ranked.slice(0, topK);
  }
}

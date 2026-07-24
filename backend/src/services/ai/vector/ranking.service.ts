import { Memory } from '@prisma/client';
import { VectorSearchResult } from '../../../types/vector';

export class RankingService {
  static computeImportanceScore(importance: number): number {
    const clamped = Math.max(1, Math.min(10, importance));
    return clamped / 10;
  }

  static computeRecencyScore(createdAt: Date): number {
    const now = Date.now();
    const ageInDays = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-ageInDays / 30);
    return Math.max(0, Math.min(1, decay));
  }

  static rankMemory(memory: Memory, similarity: number): VectorSearchResult {
    const importanceScore = RankingService.computeImportanceScore(memory.importance);
    const recencyScore = RankingService.computeRecencyScore(memory.createdAt);

    const finalScore = similarity * 0.6 + importanceScore * 0.25 + recencyScore * 0.15;

    return {
      memory,
      similarity,
      importanceScore,
      recencyScore,
      finalScore: Number(finalScore.toFixed(4)),
    };
  }

  static rankAndSort(items: Array<{ memory: Memory; similarity: number }>): VectorSearchResult[] {
    return items
      .map((item) => RankingService.rankMemory(item.memory, item.similarity))
      .sort((a, b) => b.finalScore - a.finalScore);
  }
}

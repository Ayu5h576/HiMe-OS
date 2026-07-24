import { VectorSearchResult } from '../../../types/vector';
import { AI_CONFIG } from '../../../config/ai';

export interface RAGFilterOptions {
  maxMemories?: number;
  minImportance?: number;
  similarityThreshold?: number;
}

export class RAGMemoryFormatter {
  static filterAndDeduplicate(
    results: VectorSearchResult[],
    options: RAGFilterOptions = {},
  ): VectorSearchResult[] {
    const maxMemories = options.maxMemories ?? AI_CONFIG.rag.maxRagMemories;
    const minImportance = options.minImportance ?? AI_CONFIG.rag.minMemoryImportance;
    const similarityThreshold = options.similarityThreshold ?? AI_CONFIG.rag.similarityThreshold;

    const seenIds = new Set<string>();
    const seenContent = new Set<string>();

    const filtered: VectorSearchResult[] = [];

    for (const item of results) {
      // 1. Threshold & Importance check
      if (item.similarity < similarityThreshold || item.memory.importance < minImportance) {
        continue;
      }

      // 2. ID deduplication
      if (seenIds.has(item.memory.id)) {
        continue;
      }

      // 3. Near-identical content deduplication
      const cleanContent = item.memory.content.trim().toLowerCase();
      if (seenContent.has(cleanContent)) {
        continue;
      }

      seenIds.add(item.memory.id);
      seenContent.add(cleanContent);
      filtered.push(item);

      if (filtered.length >= maxMemories) {
        break;
      }
    }

    return filtered;
  }

  static formatRAGContext(results: VectorSearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const lines = results.map((item) => {
      const type = item.memory.type;
      const importance = item.memory.importance;
      const title = item.memory.title;
      const content = item.memory.content;
      return `- [${type}] (Importance: ${importance}) ${title}: ${content}`;
    });

    return `=== Relevant Memories ===\n${lines.join('\n')}`;
  }
}

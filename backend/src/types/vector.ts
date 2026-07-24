import { Memory, MemoryType } from '@prisma/client';

export type EmbeddingProviderName = 'openai';

export interface VectorSearchResult {
  memory: Memory;
  similarity: number;
  importanceScore: number;
  recencyScore: number;
  finalScore: number;
}

export interface SearchMemoryOptions {
  projectId: string;
  query: string;
  conversationId?: string;
  type?: MemoryType;
  minImportance?: number;
  topK?: number;
  threshold?: number;
}

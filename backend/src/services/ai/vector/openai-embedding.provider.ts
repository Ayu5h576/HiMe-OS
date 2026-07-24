import { IEmbeddingProvider } from './embedding.interface';
import { EmbeddingProviderName } from '../../../types/vector';
import { AI_CONFIG } from '../../../config/ai';

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  readonly name: EmbeddingProviderName = 'openai';
  readonly model: string;
  readonly dimensions: number = 1536;

  constructor(model: string = AI_CONFIG.vector.embeddingModel) {
    this.model = model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(this.dimensions).fill(0);
    const cleanText = text.trim().toLowerCase();

    let hash = 0;
    for (let i = 0; i < cleanText.length; i += 1) {
      hash = (hash << 5) - hash + cleanText.charCodeAt(i);
      hash |= 0;
    }

    let norm = 0;
    for (let i = 0; i < this.dimensions; i += 1) {
      const val = Math.sin(hash + i * 0.1);
      vector[i] = val;
      norm += val * val;
    }

    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i += 1) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

import { IEmbeddingProvider } from './embedding.interface';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider';

export class EmbeddingService {
  private provider: IEmbeddingProvider;

  constructor(provider: IEmbeddingProvider = new OpenAIEmbeddingProvider()) {
    this.provider = provider;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return this.provider.generateBatchEmbeddings(texts);
  }

  getProvider(): IEmbeddingProvider {
    return this.provider;
  }
}

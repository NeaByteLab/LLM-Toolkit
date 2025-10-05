import { Encoder } from '@core/embedding/Encoder'
import type { EmbeddingResult } from '@interfaces/Embedding'

/**
 * Simple static Decoder class for vector operations.
 * @description Provides static methods for encoding text and querying similar content.
 */
export class Decoder {
  /** Encoder instance for text to vector conversion */
  private static readonly encoder: Encoder = new Encoder()
  /** Array to store encoded vectors with optional file paths */
  private static readonly vectors: Array<{ vector: number[]; filePath?: string }> = []
  /** Flag to track if the encoder has been initialized */
  private static initialized: boolean = false

  /**
   * Initialize the encoder for embedding operations.
   * @description Ensures the underlying encoder is ready for processing.
   * @returns Promise resolving when initialization is done
   */
  static async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.encoder.initialize()
      this.initialized = true
    }
  }

  /**
   * Encode text data and store the resulting vector.
   * @description Converts text into a vector representation and stores it.
   * @param data - Text content to encode into a vector
   * @param filePath - Optional file path to associate with the encoded data
   * @returns Promise resolving when encoding and storage is done
   */
  static async encode(data: string, filePath?: string): Promise<void> {
    await this.initialize()
    const result: EmbeddingResult = await this.encoder.extract([data])
    const vector: number[] = result.data[0] ?? []
    if (filePath !== undefined) {
      this.vectors.push({ vector, filePath })
    } else {
      this.vectors.push({ vector })
    }
  }

  /**
   * Query for similar vectors using cosine similarity.
   * @description Finds the most similar stored vectors to the query text.
   * @param query - Query text to find similar content for
   * @returns Promise resolving to array of similar vectors with similarity scores
   */
  static async query(
    query: string
  ): Promise<Array<{ vector: number[]; filePath?: string; similarity: number }>> {
    await this.initialize()
    const result: EmbeddingResult = await this.encoder.extract([query])
    const queryVector: number[] = result.data[0] ?? []
    return this.vectors
      .map((item: { vector: number[]; filePath?: string }) => ({
        ...item,
        similarity: this.cosineSimilarity(queryVector, item.vector)
      }))
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
  }

  /**
   * Calculate cosine similarity between two vectors.
   * @description Computes the cosine similarity score between two vector arrays.
   * @param a - First vector array
   * @param b - Second vector array
   * @returns Cosine similarity score between 0 and 1 (higher is more similar)
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    let dot: number = 0
    let normA: number = 0
    let normB: number = 0
    for (let i: number = 0; i < a.length; i++) {
      const aVal: number = a[i] ?? 0
      const bVal: number = b[i] ?? 0
      dot += aVal * bVal
      normA += aVal * aVal
      normB += bVal * bVal
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

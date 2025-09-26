/**
 * Interface for embedding extraction options.
 * @description Configuration options for feature extraction pipeline.
 */
export interface EmbeddingOptions {
  /** Batch size for processing multiple sentences */
  batchSize?: number
  /** Pooling strategy for sentence embeddings */
  pooling?: 'mean' | 'cls' | 'max'
  /** Whether to normalize the embeddings */
  normalize?: boolean
}

/**
 * Interface for embedding extraction result.
 * @description Result structure returned by the embedding extractor.
 */
export interface EmbeddingResult {
  /** Number of input sentences processed */
  count: number
  /** The computed embeddings as a tensor */
  data: number[][]
  /** Dimensions of the embeddings */
  dimensions: number
}

/**
 * Interface for embedding extractor.
 * @description Main interface for the embedding extraction functionality.
 */
export interface EmbeddingExtractor {
  /**
   * Extract embeddings from input sentences.
   * @param sentences - Array of sentences to process
   * @param options - Configuration options for extraction
   * @returns Promise resolving to embedding results
   */
  extract(sentences: string[], options?: EmbeddingOptions): Promise<EmbeddingResult>

  /**
   * Initialize the embedding pipeline.
   * @param model - Model identifier for the pipeline
   * @returns Promise resolving when initialization is complete
   */
  initialize(model?: string): Promise<void>

  /**
   * Check if the extractor is initialized and ready.
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean
}

/**
 * Interface for query result.
 * @description Result of a similarity query.
 */
export interface EmbeddingQuery {
  /** The matched embedding item */
  item: EmbeddingStored
  /** Similarity score (0-1, higher is more similar) */
  similarity: number
}

/**
 * Interface for stored embedding item.
 * @description Represents a stored embedding with metadata.
 */
export interface EmbeddingStored {
  /** Unique identifier for the embedding */
  id: string
  /** The embedding vector */
  vector: number[]
  /** Original text content */
  content: string
  /** File path if applicable */
  filePath?: string
  /** Whether this item is marked as important */
  important: boolean
  /** Timestamp when stored */
  timestamp: number
}

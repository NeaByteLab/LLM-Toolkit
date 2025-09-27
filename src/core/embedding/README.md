# 🧠 Embedding Module

A TypeScript module for text vectorization and similarity search using transformer models.

## 🎯 Purpose

The embedding module converts text into numerical vectors (embeddings) that capture semantic meaning, enabling:

- **Semantic Search**: Find similar content based on meaning, not just keywords
- **Text Similarity**: Compare documents, sentences, or phrases
- **Content Clustering**: Group related text together
- **Recommendation Systems**: Suggest similar content to users

---

## 🚀 Quick Start

### Installation
```bash
npm install @xenova/transformers
```

### Basic Usage

#### 1. **Text to Vectors (Encoder)**
```typescript
import { Encoder } from '@core/embedding/Encoder'

// Initialize encoder
const encoder = new Encoder()
await encoder.initialize()

// Convert text to vectors
const sentences = ['Hello world', 'How are you?', 'Good morning']
const result = await encoder.extract(sentences)

console.log(result.data)        // [[0.1, 0.2, ...], [0.3, 0.4, ...], ...]
console.log(result.dimensions)  // Vector dimensions (varies by model)
console.log(result.count)       // Number of sentences processed
```

#### 2. **Similarity Search (Decoder)**
```typescript
import { Decoder } from '@core/embedding/Decoder'

// Initialize decoder
await Decoder.initialize()

// Store some content
await Decoder.encode('Machine learning algorithms process data', '/path/to/ml.txt')
await Decoder.encode('Artificial intelligence systems help users', '/path/to/ai.txt')
await Decoder.encode('Cooking recipes provide instructions', '/path/to/cooking.txt')

// Find similar content
const similar = await Decoder.query('AI and ML topics')
console.log(similar)
// [
//   { vector: [...], filePath: '/path/to/ai.txt', similarity: 0.89 },
//   { vector: [...], filePath: '/path/to/ml.txt', similarity: 0.85 },
//   { vector: [...], filePath: '/path/to/cooking.txt', similarity: 0.12 }
// ]
```

---

## ⚙️ Configuration Options

### Encoder Options
```typescript
const result = await encoder.extract(sentences, {
  pooling: 'mean',      // 'mean' | 'cls' | 'max' (default: 'mean')
  normalize: true,      // Normalize vectors (default: true)
  batchSize: 32         // Process in batches (default: 32)
})
```

### Model Selection
```typescript
// Use custom model
await encoder.initialize('Xenova/model-name')
```

---

## 📋 API Reference

### Encoder Class

#### `initialize(model?: string): Promise<void>`
Loads the transformer model for embedding extraction.

#### `extract(sentences: string[], options?: EmbeddingOptions): Promise<EmbeddingResult>`
Converts text sentences into vector embeddings.

#### `isInitialized(): boolean`
Checks if the encoder is ready for use.

#### `dispose(): void`
Cleans up resources and resets state.

### Decoder Class (Static Methods)

#### `initialize(): Promise<void>`
Initializes the underlying encoder for operations.

#### `encode(data: string, filePath?: string): Promise<void>`
Converts text to vector and stores it for similarity queries.

#### `query(query: string): Promise<Array<{vector: number[], filePath?: string, similarity: number}>>`
Finds similar stored content using cosine similarity.

---

## 🔍 How It Works

1. **Text Input**: You provide text sentences or documents
2. **Vectorization**: The transformer model converts text to numerical vectors
3. **Storage**: Vectors are stored in memory with optional file associations
4. **Similarity**: Cosine similarity finds the most similar stored vectors
5. **Results**: Returns ranked results with similarity scores (0-1)

---

## 💡 Use Cases

### Document Search
```typescript
// Index documents
await Decoder.initialize()
await Decoder.encode(document1, '/path/to/doc1.txt')
await Decoder.encode(document2, '/path/to/doc2.txt')

// Search for relevant documents
const results = await Decoder.query('machine learning algorithms')
```

### Content Recommendation
```typescript
// Store user preferences
await Decoder.encode('User prefers sci-fi movies', 'user_prefs')
await Decoder.encode('User enjoys action movies', 'user_prefs')

// Find similar content
const recommendations = await Decoder.query('space adventure films')
```

### Text Clustering
```typescript
// Process multiple texts
const texts = ['AI research', 'Machine learning', 'Cooking tips', 'Recipe ideas']
for (const text of texts) {
  await Decoder.encode(text)
}

// Group similar content
const aiContent = await Decoder.query('artificial intelligence')
const cookingContent = await Decoder.query('food preparation')
```

---

## ⚡ Performance Tips

- **Batch Processing**: Process multiple texts at once for better performance
- **Memory Management**: Call `dispose()` when done to free resources
- **Model Size**: Default model is lightweight; use larger models for better accuracy
- **Batch Size**: Adjust `batchSize` based on available memory

---

## 🛠️ Error Handling

```typescript
try {
  await encoder.initialize()
  const result = await encoder.extract(['Hello world'])
} catch (error) {
  console.error('Embedding failed:', error.message)
}
```

---

## 📦 Dependencies

- `@xenova/transformers`: Transformer model execution
- `@interfaces/Embedding`: TypeScript type definitions

---

**Note**: The embedding module uses a lightweight model by default, which provides a good balance between accuracy and performance for most use cases.

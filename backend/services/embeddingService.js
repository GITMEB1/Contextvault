const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class EmbeddingService {
  constructor() {
    this.openaiApiKey = config.openaiApiKey;
    this.embeddingModel = config.openaiModel;
    this.embeddingDimension = config.embeddingDimension;
    this.useLocalEmbeddings = !this.openaiApiKey || config.useLocalEmbeddings;
    
    if (this.useLocalEmbeddings) {
      this.initializeLocalModel();
    }
  }

  async initializeLocalModel() {
    try {
      // Initialize local embedding model (when packages are available)
      // const { pipeline } = require('@xenova/transformers');
      // this.localModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      logger.info('Local embedding model would be initialized here');
    } catch (error) {
      logger.warn('Local embedding model not available, falling back to OpenAI API');
      this.useLocalEmbeddings = false;
    }
  }

  /**
   * Generate embeddings for text using OpenAI API
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateOpenAIEmbedding(text) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: this.embeddingModel,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const embedding = response.data.data[0].embedding;
      
      logger.info('Generated OpenAI embedding', {
        textLength: text.length,
        embeddingDimension: embedding.length,
        model: this.embeddingModel
      });

      return embedding;
    } catch (error) {
      logger.error('Failed to generate OpenAI embedding', {
        error: error.message,
        textLength: text.length
      });
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings using local model
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateLocalEmbedding(text) {
    try {
      // Local embedding generation (when model is available)
      // const output = await this.localModel(text, { pooling: 'mean', normalize: true });
      // return Array.from(output.data);
      
      // Mock embedding for development
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random() - 0.5);
      
      logger.info('Generated local (mock) embedding', {
        textLength: text.length,
        embeddingDimension: mockEmbedding.length
      });
      
      return mockEmbedding;
    } catch (error) {
      logger.error('Failed to generate local embedding', {
        error: error.message,
        textLength: text.length
      });
      throw new Error(`Local embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embedding for text (automatically chooses method)
   * @param {string} text - Text to embed
   * @returns {Promise<{vector: number[], model: string, dimension: number}>}
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    // Preprocess text
    const cleanText = this.preprocessText(text);
    
    let vector, model;
    
    if (this.useLocalEmbeddings) {
      vector = await this.generateLocalEmbedding(cleanText);
      model = 'local-all-MiniLM-L6-v2';
    } else {
      vector = await this.generateOpenAIEmbedding(cleanText);
      model = this.embeddingModel;
    }

    return {
      vector,
      model,
      dimension: vector.length,
      checksum: this.calculateChecksum(vector)
    };
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param {string[]} texts - Array of texts to embed
   * @returns {Promise<Array>} - Array of embedding objects
   */
  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        logger.error('Failed to generate embedding for text', {
          error: error.message,
          textPreview: text.substring(0, 100)
        });
        embeddings.push(null);
      }
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} - Similarity score (0-1)
   */
  calculateCosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find most similar vectors using cosine similarity
   * @param {number[]} queryVector - Query vector
   * @param {Array} candidateVectors - Array of {id, vector} objects
   * @param {number} limit - Maximum number of results
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array} - Sorted array of {id, similarity} objects
   */
  findSimilarVectors(queryVector, candidateVectors, limit = 10, threshold = 0.5) {
    const similarities = candidateVectors
      .map(candidate => ({
        id: candidate.id,
        similarity: this.calculateCosineSimilarity(queryVector, candidate.vector),
        ...candidate.metadata
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }

  /**
   * Preprocess text for embedding
   * @param {string} text - Raw text
   * @returns {string} - Cleaned text
   */
  preprocessText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .substring(0, 8000); // Limit length for API constraints
  }

  /**
   * Calculate checksum for vector to detect changes
   * @param {number[]} vector - Embedding vector
   * @returns {string} - Checksum
   */
  calculateChecksum(vector) {
    const sum = vector.reduce((acc, val) => acc + val, 0);
    return Math.abs(sum).toString(36).substring(0, 8);
  }

  /**
   * Chunk text into smaller pieces for embedding
   * @param {string} text - Text to chunk
   * @param {number} maxLength - Maximum chunk length
   * @param {number} overlap - Overlap between chunks
   * @returns {string[]} - Array of text chunks
   */
  chunkText(text, maxLength = 1000, overlap = 100) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxLength, text.length);
      const chunk = text.substring(start, end);
      
      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastNewline = chunk.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start + maxLength * 0.5) {
          chunks.push(text.substring(start, breakPoint + 1).trim());
          start = breakPoint + 1 - overlap;
        } else {
          chunks.push(chunk.trim());
          start = end - overlap;
        }
      } else {
        chunks.push(chunk.trim());
        break;
      }
    }

    return chunks.filter(chunk => chunk.length > 0);
  }
}

module.exports = new EmbeddingService(); 
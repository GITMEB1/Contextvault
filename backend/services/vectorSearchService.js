const embeddingService = require('./embeddingService');
const Entry = require('../models/Entry');
const config = require('../config/config');
const logger = require('../utils/logger');

class VectorSearchService {
  constructor() {
    this.embeddingService = embeddingService;
    this.similarityThreshold = config.vectorSimilarityThreshold || 0.7;
    this.maxResults = config.maxSearchResults || 50;
  }

  /**
   * Generate and store embeddings for an entry
   * @param {Object} entry - Entry document
   * @returns {Promise<Object>} - Updated entry with embeddings
   */
  async generateEntryEmbeddings(entry) {
    try {
      // Combine relevant text fields for embedding
      const textToEmbed = this.prepareTextForEmbedding(entry);
      
      // Generate embedding
      const embeddingData = await this.embeddingService.generateEmbedding(textToEmbed);
      
      // Update entry with embedding data
      entry.embeddings = {
        vector: embeddingData.vector,
        model: embeddingData.model,
        dimension: embeddingData.dimension,
        checksum: embeddingData.checksum,
        generatedAt: new Date()
      };

      // Update token count
      entry.content.tokenCount = this.estimateTokenCount(textToEmbed);
      
      await entry.save();
      
      logger.info('Generated embeddings for entry', {
        entryId: entry._id,
        model: embeddingData.model,
        dimension: embeddingData.dimension,
        tokenCount: entry.content.tokenCount
      });

      return entry;
    } catch (error) {
      logger.error('Failed to generate embeddings for entry', {
        entryId: entry._id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple entries
   * @param {Array} entries - Array of entry documents
   * @returns {Promise<Array>} - Array of updated entries
   */
  async generateBatchEmbeddings(entries) {
    const results = [];
    
    for (const entry of entries) {
      try {
        const updatedEntry = await this.generateEntryEmbeddings(entry);
        results.push(updatedEntry);
      } catch (error) {
        logger.error('Failed to generate embedding for entry in batch', {
          entryId: entry._id,
          error: error.message
        });
        results.push(entry); // Return original entry on failure
      }
    }
    
    return results;
  }

  /**
   * Perform vector similarity search
   * @param {string} query - Search query
   * @param {string} userId - User ID for filtering
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Search results with similarity scores
   */
  async vectorSearch(query, userId, options = {}) {
    const {
      limit = 20,
      threshold = this.similarityThreshold,
      includeContent = false
    } = options;

    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Get all entries with embeddings for the user
      const entries = await Entry.find({
        userId,
        'embeddings.vector': { $exists: true, $ne: null }
      }).select('_id content.processed metadata source embeddings createdAt updatedAt');

      if (entries.length === 0) {
        return {
          results: [],
          query,
          count: 0,
          message: 'No entries with embeddings found'
        };
      }

      // Calculate similarities
      const candidateVectors = entries.map(entry => ({
        id: entry._id,
        vector: entry.embeddings.vector,
        metadata: {
          entry: entry,
          title: entry.metadata.title,
          tags: entry.metadata.tags,
          source: entry.source,
          createdAt: entry.createdAt
        }
      }));

      const similarities = this.embeddingService.findSimilarVectors(
        queryEmbedding.vector,
        candidateVectors,
        limit,
        threshold
      );

      // Format results
      const results = similarities.map(result => ({
        id: result.id,
        similarity: result.similarity,
        title: result.title || 'Untitled',
        preview: this.generatePreview(result.entry.content.processed || result.entry.content.raw),
        tags: result.tags || [],
        source: result.source,
        createdAt: result.createdAt,
        content: includeContent ? result.entry.content : undefined
      }));

      logger.info('Vector search completed', {
        query,
        userId,
        totalEntries: entries.length,
        resultsFound: results.length,
        avgSimilarity: results.length > 0 ? 
          results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
      });

      return {
        results,
        query,
        count: results.length,
        searchType: 'vector',
        model: queryEmbedding.model,
        threshold,
        totalEntries: entries.length
      };

    } catch (error) {
      logger.error('Vector search failed', {
        query,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Perform hybrid search combining text and vector similarity
   * @param {string} query - Search query
   * @param {string} userId - User ID for filtering
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Combined search results
   */
  async hybridSearch(query, userId, options = {}) {
    const {
      limit = 20,
      textWeight = 0.3,
      vectorWeight = 0.7,
      threshold = 0.5
    } = options;

    try {
      // Perform both searches in parallel
      const [textResults, vectorResults] = await Promise.all([
        this.textSearch(query, userId, { limit: limit * 2 }),
        this.vectorSearch(query, userId, { limit: limit * 2, threshold: 0.3 })
      ]);

      // Combine and score results
      const combinedResults = this.combineSearchResults(
        textResults.results,
        vectorResults.results,
        textWeight,
        vectorWeight
      );

      // Sort by combined score and limit
      const finalResults = combinedResults
        .filter(result => result.combinedScore >= threshold)
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, limit);

      logger.info('Hybrid search completed', {
        query,
        userId,
        textResults: textResults.count,
        vectorResults: vectorResults.count,
        finalResults: finalResults.length,
        weights: { textWeight, vectorWeight }
      });

      return {
        results: finalResults,
        query,
        count: finalResults.length,
        searchType: 'hybrid',
        weights: { textWeight, vectorWeight },
        breakdown: {
          textResults: textResults.count,
          vectorResults: vectorResults.count
        }
      };

    } catch (error) {
      logger.error('Hybrid search failed', {
        query,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Perform traditional text search
   * @param {string} query - Search query
   * @param {string} userId - User ID for filtering
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Text search results
   */
  async textSearch(query, userId, options = {}) {
    const { limit = 20 } = options;

    try {
      const results = await Entry.find({
        $text: { $search: query },
        userId
      }, { 
        score: { $meta: 'textScore' } 
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .select('_id content.processed metadata source createdAt')
        .lean();

      const formattedResults = results.map(entry => ({
        id: entry._id,
        textScore: entry.score,
        title: entry.metadata?.title || 'Untitled',
        preview: this.generatePreview(entry.content.processed || entry.content.raw),
        tags: entry.metadata?.tags || [],
        source: entry.source,
        createdAt: entry.createdAt
      }));

      return {
        results: formattedResults,
        query,
        count: formattedResults.length,
        searchType: 'text'
      };

    } catch (error) {
      logger.error('Text search failed', {
        query,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find similar entries to a given entry
   * @param {string} entryId - Entry ID to find similar entries for
   * @param {string} userId - User ID for filtering
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Similar entries
   */
  async findSimilarEntries(entryId, userId, options = {}) {
    const { limit = 10, threshold = 0.7 } = options;

    try {
      // Get the reference entry
      const referenceEntry = await Entry.findOne({
        _id: entryId,
        userId,
        'embeddings.vector': { $exists: true }
      });

      if (!referenceEntry || !referenceEntry.embeddings.vector) {
        throw new Error('Reference entry not found or has no embeddings');
      }

      // Get other entries with embeddings
      const otherEntries = await Entry.find({
        userId,
        _id: { $ne: entryId },
        'embeddings.vector': { $exists: true, $ne: null }
      }).select('_id content.processed metadata source embeddings createdAt');

      const candidateVectors = otherEntries.map(entry => ({
        id: entry._id,
        vector: entry.embeddings.vector,
        metadata: {
          entry: entry,
          title: entry.metadata.title,
          tags: entry.metadata.tags,
          source: entry.source,
          createdAt: entry.createdAt
        }
      }));

      const similarities = this.embeddingService.findSimilarVectors(
        referenceEntry.embeddings.vector,
        candidateVectors,
        limit,
        threshold
      );

      const results = similarities.map(result => ({
        id: result.id,
        similarity: result.similarity,
        title: result.title || 'Untitled',
        preview: this.generatePreview(result.entry.content.processed || result.entry.content.raw),
        tags: result.tags || [],
        source: result.source,
        createdAt: result.createdAt
      }));

      return {
        results,
        referenceEntry: {
          id: referenceEntry._id,
          title: referenceEntry.metadata?.title || 'Untitled'
        },
        count: results.length
      };

    } catch (error) {
      logger.error('Find similar entries failed', {
        entryId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Prepare text content for embedding generation
   * @param {Object} entry - Entry document
   * @returns {string} - Combined text for embedding
   */
  prepareTextForEmbedding(entry) {
    const parts = [];
    
    // Add title if available
    if (entry.metadata?.title) {
      parts.push(entry.metadata.title);
    }
    
    // Add main content
    const content = entry.content.processed || entry.content.raw;
    if (content) {
      parts.push(content);
    }
    
    // Add tags
    if (entry.metadata?.tags && entry.metadata.tags.length > 0) {
      parts.push(`Tags: ${entry.metadata.tags.join(', ')}`);
    }
    
    return parts.join('\n\n');
  }

  /**
   * Generate preview text from content
   * @param {string} content - Full content
   * @param {number} maxLength - Maximum preview length
   * @returns {string} - Preview text
   */
  generatePreview(content, maxLength = 200) {
    if (!content) return '';
    
    const cleaned = content.trim();
    if (cleaned.length <= maxLength) return cleaned;
    
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > maxLength * 0.8 ? 
      truncated.substring(0, lastSpace) + '...' : 
      truncated + '...';
  }

  /**
   * Combine text and vector search results
   * @param {Array} textResults - Text search results
   * @param {Array} vectorResults - Vector search results
   * @param {number} textWeight - Weight for text scores
   * @param {number} vectorWeight - Weight for vector scores
   * @returns {Array} - Combined results
   */
  combineSearchResults(textResults, vectorResults, textWeight, vectorWeight) {
    const resultMap = new Map();
    
    // Add text results
    textResults.forEach(result => {
      resultMap.set(result.id.toString(), {
        ...result,
        textScore: result.textScore || 0,
        similarity: 0,
        combinedScore: (result.textScore || 0) * textWeight
      });
    });
    
    // Add or update with vector results
    vectorResults.forEach(result => {
      const id = result.id.toString();
      if (resultMap.has(id)) {
        const existing = resultMap.get(id);
        existing.similarity = result.similarity;
        existing.combinedScore = (existing.textScore * textWeight) + (result.similarity * vectorWeight);
      } else {
        resultMap.set(id, {
          ...result,
          textScore: 0,
          combinedScore: result.similarity * vectorWeight
        });
      }
    });
    
    return Array.from(resultMap.values());
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to count tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Regenerate embeddings for all entries of a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Regeneration results
   */
  async regenerateAllEmbeddings(userId) {
    try {
      const entries = await Entry.find({ userId });
      const results = await this.generateBatchEmbeddings(entries);
      
      const successful = results.filter(entry => entry.embeddings?.vector).length;
      
      logger.info('Regenerated embeddings for user', {
        userId,
        totalEntries: entries.length,
        successful,
        failed: entries.length - successful
      });
      
      return {
        totalEntries: entries.length,
        successful,
        failed: entries.length - successful
      };
    } catch (error) {
      logger.error('Failed to regenerate embeddings', {
        userId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new VectorSearchService(); 
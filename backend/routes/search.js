const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Entry = require('../models/Entry');
const { auth } = require('../middleware/auth');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/config');
const vectorSearchService = require('../services/vectorSearchService');

const router = express.Router();

// All search routes require authentication
router.use(auth);

/**
 * @swagger
 * /search/text:
 *   get:
 *     summary: Full-text search entries
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of results to return
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Entry'
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 responseTime:
 *                   type: string
 */

// GET /search/text - Full-text search
router.get('/text', asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q) {
    throw new APIError('Search query is required', 400, 'MISSING_QUERY');
  }

  const startTime = Date.now();

  const results = await Entry.find({
    $text: { $search: q },
    userId: req.user._id
  }, { 
    score: { $meta: 'textScore' } 
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .select('-embeddings.vector');

  const responseTime = Date.now() - startTime;

  // Update user search stats
  req.user.stats.totalSearches += 1;
  await req.user.save();

  logger.logSearch(q, results.length, responseTime, req.user._id);

  res.json({
    results,
    query: q,
    count: results.length,
    responseTime: `${responseTime}ms`
  });
}));

/**
 * @swagger
 * /search/vector:
 *   post:
 *     summary: Vector similarity search
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Text query to convert to embedding
 *               vector:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Pre-computed embedding vector
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *               threshold:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Vector search results
 */

// POST /search/vector - Vector similarity search
router.post('/vector', [
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: config.maxSearchResults })
    .withMessage(`Limit must be between 1 and ${config.maxSearchResults}`),
  body('threshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Threshold must be between 0 and 1'),
  body('includeContent')
    .optional()
    .isBoolean()
    .withMessage('includeContent must be a boolean')
], asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', { errors: errors.array() });
  }

  const { 
    query, 
    limit = 20, 
    threshold = config.vectorSimilarityThreshold,
    includeContent = false 
  } = req.body;

  try {
    const results = await vectorSearchService.vectorSearch(req.user._id, query, {
      limit: parseInt(limit),
      threshold: parseFloat(threshold),
      includeContent
    });

    const responseTime = Date.now() - startTime;

    // Update user search stats
    req.user.stats.totalSearches += 1;
    await req.user.save();

    logger.logSearch(`vector: ${query}`, results.count, responseTime, req.user._id);

    res.json({
      ...results,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    logger.error('Vector search failed', {
      query,
      userId: req.user._id,
      error: error.message
    });
    
    // Fallback to text search if vector search fails
    const textResults = await Entry.find({
      $text: { $search: query },
      userId: req.user._id
    }, { 
      score: { $meta: 'textScore' } 
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .select('-embeddings.vector')
      .lean();

    const responseTime = Date.now() - startTime;

    res.json({
      results: textResults.map(entry => ({
        id: entry._id,
        similarity: entry.score / 10, // Normalize to 0-1 range
        title: entry.metadata?.title || 'Untitled',
        preview: entry.content.processed?.substring(0, 200) + '...' || '',
        tags: entry.metadata?.tags || [],
        source: entry.source,
        createdAt: entry.createdAt
      })),
      query,
      count: textResults.length,
      searchType: 'text_fallback',
      responseTime: `${responseTime}ms`,
      note: 'Fell back to text search due to vector search error'
    });
  }
}));

/**
 * @swagger
 * /search/hybrid:
 *   post:
 *     summary: Hybrid search combining text and vector similarity
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               textWeight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 default: 0.3
 *               vectorWeight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 default: 0.7
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 */

// POST /search/hybrid - Hybrid search
router.post('/hybrid', [
  body('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters'),
  body('textWeight')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Text weight must be between 0 and 1'),
  body('vectorWeight')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Vector weight must be between 0 and 1'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: config.maxSearchResults })
    .withMessage(`Limit must be between 1 and ${config.maxSearchResults}`)
], asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', { errors: errors.array() });
  }

  const { 
    query, 
    textWeight = 0.3, 
    vectorWeight = 0.7, 
    limit = 20 
  } = req.body;

  // Validate weights sum to 1
  if (Math.abs(textWeight + vectorWeight - 1) > 0.001) {
    throw new APIError('Text weight and vector weight must sum to 1', 400, 'INVALID_WEIGHTS');
  }

  try {
    const results = await vectorSearchService.hybridSearch(query, req.user._id, {
      limit: parseInt(limit),
      textWeight: parseFloat(textWeight),
      vectorWeight: parseFloat(vectorWeight),
      threshold: 0.3
    });

    const responseTime = Date.now() - startTime;

    // Update user search stats
    req.user.stats.totalSearches += 1;
    await req.user.save();

    logger.logSearch(`hybrid: ${query}`, results.count, responseTime, req.user._id);

    res.json({
      ...results,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    logger.error('Hybrid search failed', {
      query,
      userId: req.user._id,
      error: error.message
    });

    // Fallback to text search
    const textResults = await Entry.find({
      $text: { $search: query },
      userId: req.user._id
    }, { 
      score: { $meta: 'textScore' } 
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .select('-embeddings.vector -content.raw')
      .lean();

    const responseTime = Date.now() - startTime;

    // Update user search stats
    req.user.stats.totalSearches += 1;
    await req.user.save();

    logger.logSearch(`hybrid_fallback: ${query}`, textResults.length, responseTime, req.user._id);

    res.json({
      results: textResults.map(entry => ({
        id: entry._id,
        title: entry.metadata?.title || 'Untitled',
        preview: entry.content.processed?.substring(0, 200) + '...' || '',
        tags: entry.metadata?.tags || [],
        source: entry.source,
        combinedScore: entry.score * textWeight,
        textScore: entry.score,
        similarity: 0,
        createdAt: entry.createdAt
      })),
      query,
      count: textResults.length,
      searchType: 'text_fallback',
      weights: { textWeight, vectorWeight },
      responseTime: `${responseTime}ms`,
      note: 'Fell back to text search due to hybrid search error'
    });
  }
}));

/**
 * @swagger
 * /search/similar/{entryId}:
 *   get:
 *     summary: Find entries similar to a given entry
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID to find similar entries for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         description: Number of similar entries to return
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         description: Minimum similarity threshold
 *     responses:
 *       200:
 *         description: Similar entries found
 */

// GET /search/similar/:entryId - Find similar entries
router.get('/similar/:entryId', asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const { limit = 10, threshold = 0.7 } = req.query;

  try {
    const results = await vectorSearchService.findSimilarEntries(
      entryId, 
      req.user._id, 
      {
        limit: parseInt(limit),
        threshold: parseFloat(threshold)
      }
    );

    res.json(results);

  } catch (error) {
    if (error.message.includes('not found')) {
      throw new APIError('Entry not found or has no embeddings', 404, 'ENTRY_NOT_FOUND');
    }
    throw new APIError('Failed to find similar entries', 500, 'SIMILARITY_SEARCH_FAILED');
  }
}));

/**
 * @swagger
 * /search/embeddings/generate:
 *   post:
 *     summary: Generate embeddings for entries
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific entry IDs to generate embeddings for
 *               regenerateAll:
 *                 type: boolean
 *                 description: Regenerate embeddings for all user entries
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 */

// POST /search/embeddings/generate - Generate embeddings for entries
router.post('/embeddings/generate', [
  body('entryIds')
    .optional()
    .isArray()
    .withMessage('entryIds must be an array'),
  body('regenerateAll')
    .optional()
    .isBoolean()
    .withMessage('regenerateAll must be a boolean')
], asyncHandler(async (req, res) => {
  const { entryIds, regenerateAll = false } = req.body;

  try {
    let results;

    if (regenerateAll) {
      results = await vectorSearchService.regenerateAllEmbeddings(req.user._id);
    } else if (entryIds && entryIds.length > 0) {
      const entries = await Entry.find({
        _id: { $in: entryIds },
        userId: req.user._id
      });

      if (entries.length === 0) {
        throw new APIError('No valid entries found', 404, 'ENTRIES_NOT_FOUND');
      }

      const updatedEntries = await vectorSearchService.generateBatchEmbeddings(entries);
      const successful = updatedEntries.filter(entry => entry.embeddings?.vector).length;

      results = {
        totalEntries: entries.length,
        successful,
        failed: entries.length - successful
      };
    } else {
      // Generate embeddings for entries without them
      const entriesWithoutEmbeddings = await Entry.find({
        userId: req.user._id,
        $or: [
          { 'embeddings.vector': { $exists: false } },
          { 'embeddings.vector': null }
        ]
      });

      if (entriesWithoutEmbeddings.length === 0) {
        return res.json({
          message: 'All entries already have embeddings',
          totalEntries: 0,
          successful: 0,
          failed: 0
        });
      }

      const updatedEntries = await vectorSearchService.generateBatchEmbeddings(entriesWithoutEmbeddings);
      const successful = updatedEntries.filter(entry => entry.embeddings?.vector).length;

      results = {
        totalEntries: entriesWithoutEmbeddings.length,
        successful,
        failed: entriesWithoutEmbeddings.length - successful
      };
    }

    res.json({
      message: 'Embedding generation completed',
      ...results
    });

  } catch (error) {
    logger.error('Embedding generation failed', {
      userId: req.user._id,
      error: error.message
    });
    throw new APIError('Failed to generate embeddings', 500, 'EMBEDDING_GENERATION_FAILED');
  }
}));

// GET /search/suggestions - Get search suggestions based on user's data
router.get('/suggestions', asyncHandler(async (req, res) => {
  // Get most common tags from user's entries
  const tagStats = await Entry.aggregate([
    { $match: { userId: req.user._id } },
    { $unwind: '$metadata.tags' },
    { $group: { _id: '$metadata.tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get recent search terms (would need to store these)
  const recentSearches = []; // Placeholder

  // Get popular content types
  const sourceStats = await Entry.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$source.type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get embedding statistics
  const embeddingStats = await Entry.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        withEmbeddings: {
          $sum: {
            $cond: [
              { $and: [{ $exists: ['$embeddings.vector'] }, { $ne: ['$embeddings.vector', null] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const embeddingInfo = embeddingStats[0] || { totalEntries: 0, withEmbeddings: 0 };

  res.json({
    suggestions: {
      popularTags: tagStats.map(t => ({ tag: t._id, count: t.count })),
      recentSearches,
      contentSources: sourceStats.map(s => ({ source: s._id, count: s.count }))
    },
    embeddingStatus: {
      totalEntries: embeddingInfo.totalEntries,
      withEmbeddings: embeddingInfo.withEmbeddings,
      withoutEmbeddings: embeddingInfo.totalEntries - embeddingInfo.withEmbeddings,
      vectorSearchEnabled: embeddingInfo.withEmbeddings > 0
    }
  });
}));

module.exports = router; 
const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Entry = require('../models/Entry');
const { auth } = require('../middleware/auth');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/config');

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

// POST /search/vector - Vector similarity search (placeholder)
router.post('/vector', asyncHandler(async (req, res) => {
  res.json({
    message: 'Vector search not yet implemented',
    results: [],
    count: 0
  });
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

  // For now, fallback to text search
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

  logger.logSearch(`hybrid: ${query}`, textResults.length, responseTime, req.user._id);

  res.json({
    results: textResults.map(entry => ({
      id: entry._id,
      title: entry.metadata.title,
      preview: entry.content.processed?.substring(0, 200) + '...',
      tags: entry.metadata.tags,
      source: entry.source,
      hybridScore: entry.score * textWeight, // Mock hybrid scoring
      textScore: entry.score,
      vectorScore: 0, // Placeholder
      createdAt: entry.createdAt
    })),
    query,
    count: textResults.length,
    weights: { textWeight, vectorWeight },
    responseTime: `${responseTime}ms`,
    note: 'Currently using text search only - vector component pending implementation'
  });
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

  res.json({
    suggestions: {
      popularTags: tagStats.map(t => ({ tag: t._id, count: t.count })),
      recentSearches,
      contentSources: sourceStats.map(s => ({ source: s._id, count: s.count }))
    }
  });
}));

module.exports = router; 
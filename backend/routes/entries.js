const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Entry = require('../models/Entry');
const { auth } = require('../middleware/auth');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config/config');
const vectorSearchService = require('../services/vectorSearchService');

const router = express.Router();

// All entry routes require authentication
router.use(auth);

// GET /entries - Get user's entries with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('tags').optional().isString(),
  query('source').optional().isIn(['chatgpt', 'claude', 'manual', 'api']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', { errors: errors.array() });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  const query = { userId: req.user._id };

  if (req.query.tags) {
    const tags = req.query.tags.split(',').map(tag => tag.trim());
    query['metadata.tags'] = { $in: tags };
  }

  if (req.query.source) {
    query['source.type'] = req.query.source;
  }

  if (req.query.startDate || req.query.endDate) {
    query['metadata.timestamp'] = {};
    if (req.query.startDate) {
      query['metadata.timestamp'].$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query['metadata.timestamp'].$lte = new Date(req.query.endDate);
    }
  }

  // Execute query
  const [entries, total] = await Promise.all([
    Entry.find(query)
      .sort({ 'metadata.timestamp': -1 })
      .skip(skip)
      .limit(limit)
      .select('-embeddings.vector'), // Exclude large vector data
    Entry.countDocuments(query)
  ]);

  res.json({
    entries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// GET /entries/:id - Get specific entry
router.get('/:id', asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('-embeddings.vector');

  if (!entry) {
    throw new APIError('Entry not found', 404, 'ENTRY_NOT_FOUND');
  }

  // Increment view count
  await entry.incrementView();

  res.json({ entry });
}));

// POST /entries - Create new entry
router.post('/', [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50,000 characters'),
  body('source.type')
    .isIn(['chatgpt', 'claude', 'manual', 'api'])
    .withMessage('Invalid source type'),
  body('metadata.tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('metadata.title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', { errors: errors.array() });
  }

  // Create entry
  const entryData = {
    userId: req.user._id,
    content: {
      raw: req.body.content
    },
    source: req.body.source || { type: 'manual' },
    metadata: {
      tags: req.body.metadata?.tags || [],
      title: req.body.metadata?.title,
      customFields: req.body.metadata?.customFields || {}
    },
    audit: {
      createdBy: req.user._id
    }
  };

  const entry = new Entry(entryData);
  await entry.save();

  // Generate embeddings for the new entry (async, don't wait)
  vectorSearchService.generateEntryEmbeddings(entry).catch(error => {
    logger.warn('Failed to generate embeddings for new entry', {
      entryId: entry._id,
      error: error.message
    });
  });

  // Update user stats
  req.user.stats.totalEntries += 1;
  await req.user.save();

  logger.info('Entry created', {
    entryId: entry._id,
    userId: req.user._id,
    source: entry.source.type,
    contentLength: entry.content.raw.length
  });

  res.status(201).json({
    message: 'Entry created successfully',
    entry: {
      id: entry._id,
      title: entry.metadata.title,
      preview: entry.preview,
      source: entry.source,
      createdAt: entry.createdAt
    }
  });
}));

// PUT /entries/:id - Update entry
router.put('/:id', [
  body('content')
    .optional()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50,000 characters'),
  body('metadata.tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('metadata.title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400, 'VALIDATION_ERROR', { errors: errors.array() });
  }

  const entry = await Entry.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!entry) {
    throw new APIError('Entry not found', 404, 'ENTRY_NOT_FOUND');
  }

  // Update fields
  if (req.body.content) {
    entry.content.raw = req.body.content;
  }

  if (req.body.metadata) {
    if (req.body.metadata.tags) {
      entry.metadata.tags = req.body.metadata.tags;
    }
    if (req.body.metadata.title !== undefined) {
      entry.metadata.title = req.body.metadata.title;
    }
    if (req.body.metadata.customFields) {
      entry.metadata.customFields = req.body.metadata.customFields;
    }
  }

  entry.audit.updatedBy = req.user._id;
  entry.logChange('update', req.user._id, req.body);

  await entry.save();

  // Regenerate embeddings if content was changed (async, don't wait)
  if (req.body.content) {
    vectorSearchService.generateEntryEmbeddings(entry).catch(error => {
      logger.warn('Failed to regenerate embeddings for updated entry', {
        entryId: entry._id,
        error: error.message
      });
    });
  }

  logger.info('Entry updated', {
    entryId: entry._id,
    userId: req.user._id,
    changes: Object.keys(req.body)
  });

  res.json({
    message: 'Entry updated successfully',
    entry: {
      id: entry._id,
      title: entry.metadata.title,
      preview: entry.preview,
      updatedAt: entry.updatedAt
    }
  });
}));

// DELETE /entries/:id - Delete entry
router.delete('/:id', asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!entry) {
    throw new APIError('Entry not found', 404, 'ENTRY_NOT_FOUND');
  }

  await entry.deleteOne();

  // Update user stats
  req.user.stats.totalEntries = Math.max(0, req.user.stats.totalEntries - 1);
  await req.user.save();

  logger.info('Entry deleted', {
    entryId: entry._id,
    userId: req.user._id
  });

  res.json({
    message: 'Entry deleted successfully'
  });
}));

// GET /entries/:id/stats - Get entry statistics
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!entry) {
    throw new APIError('Entry not found', 404, 'ENTRY_NOT_FOUND');
  }

  res.json({
    stats: {
      viewCount: entry.searchStats.viewCount,
      searchHits: entry.searchStats.searchHits,
      lastViewed: entry.searchStats.lastViewed,
      age: entry.age,
      tokenCount: entry.content.tokenCount,
      relevanceScore: entry.searchStats.relevanceScore
    }
  });
}));

router.get('/', (req, res) => {
  res.json({ message: 'Entries endpoint working' });
});

module.exports = router; 
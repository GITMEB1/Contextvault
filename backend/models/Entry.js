const mongoose = require('mongoose');
const config = require('../config/config');

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Source information
  source: {
    type: {
      type: String,
      enum: ['chatgpt', 'claude', 'manual', 'api'],
      required: [true, 'Source type is required']
    },
    version: String,
    exportDate: Date,
    originalFormat: String
  },
  
  // Content data
  content: {
    raw: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [50000, 'Content cannot exceed 50,000 characters']
    },
    processed: String,
    chunks: [String],
    tokenCount: {
      type: Number,
      default: 0
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Metadata
  metadata: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    customFields: {
      type: Map,
      of: String
    },
    title: {
      type: String,
      maxlength: 200
    },
    summary: {
      type: String,
      maxlength: 500
    }
  },
  
  // Vector embeddings
  embeddings: {
    model: {
      type: String,
      default: 'text-embedding-ada-002'
    },
    vector: [{
      type: Number,
      validate: {
        validator: function(arr) {
          return arr.length === config.embeddingDimension;
        },
        message: `Embedding vector must have ${config.embeddingDimension} dimensions`
      }
    }],
    generationDate: {
      type: Date,
      default: Date.now
    },
    checksum: String
  },
  
  // Privacy and compliance
  privacy: {
    containsPii: {
      type: Boolean,
      default: false
    },
    sensitivityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    retentionDate: {
      type: Date
    },
    anonymized: {
      type: Boolean,
      default: false
    },
    geographicRestriction: String
  },
  
  // Search and analytics
  searchStats: {
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    searchHits: {
      type: Number,
      default: 0
    },
    relevanceScore: {
      type: Number,
      default: 0
    }
  },
  
  // Audit trail
  audit: {
    createdBy: {
      type: String,
      default: 'system'
    },
    updatedBy: String,
    version: {
      type: Number,
      default: 1
    },
    changeLog: [{
      action: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      userId: String,
      changes: mongoose.Schema.Types.Mixed
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
entrySchema.index({ userId: 1, 'metadata.timestamp': -1 });
entrySchema.index({ 'metadata.tags': 1 });
entrySchema.index({ 'source.type': 1 });
entrySchema.index({ 'privacy.retentionDate': 1 });
entrySchema.index({ 'privacy.containsPii': 1 });
entrySchema.index({ 'privacy.sensitivityLevel': 1 });
entrySchema.index({ 'content.language': 1 });
entrySchema.index({ 'searchStats.relevanceScore': -1 });

// Text index for full-text search
entrySchema.index({
  'content.raw': 'text',
  'content.processed': 'text',
  'metadata.title': 'text',
  'metadata.summary': 'text',
  'metadata.tags': 'text'
});

// Vector index for similarity search (will be created in MongoDB Atlas)
entrySchema.index({ 'embeddings.vector': '2dsphere' });

// Virtual for content preview
entrySchema.virtual('preview').get(function() {
  const content = this.content.processed || this.content.raw;
  return content.length > 200 ? content.substring(0, 200) + '...' : content;
});

// Virtual for age calculation
entrySchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update retention date
entrySchema.pre('save', function(next) {
  if (this.isNew && !this.privacy.retentionDate) {
    const retentionDays = this.privacy.sensitivityLevel === 'high' ? 90 :
                         this.privacy.sensitivityLevel === 'medium' ? 180 : 365;
    
    this.privacy.retentionDate = new Date(Date.now() + (retentionDays * 24 * 60 * 60 * 1000));
  }
  
  // Update version on changes
  if (!this.isNew) {
    this.audit.version += 1;
  }
  
  next();
});

// Pre-save middleware to process content
entrySchema.pre('save', function(next) {
  if (this.isModified('content.raw')) {
    // Basic content processing
    this.content.processed = this.content.raw
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
    
    // Estimate token count (rough approximation)
    this.content.tokenCount = Math.ceil(this.content.processed.length / 4);
    
    // Extract title if not provided
    if (!this.metadata.title) {
      const firstLine = this.content.processed.split('\n')[0];
      this.metadata.title = firstLine.length > 100 ? 
        firstLine.substring(0, 100) + '...' : firstLine;
    }
  }
  
  next();
});

// Instance methods
entrySchema.methods.incrementView = async function() {
  this.searchStats.viewCount += 1;
  this.searchStats.lastViewed = new Date();
  await this.save();
};

entrySchema.methods.incrementSearchHit = async function() {
  this.searchStats.searchHits += 1;
  await this.save();
};

entrySchema.methods.updateRelevanceScore = async function(score) {
  this.searchStats.relevanceScore = score;
  await this.save();
};

entrySchema.methods.addTag = async function(tag) {
  if (!this.metadata.tags.includes(tag)) {
    this.metadata.tags.push(tag);
    await this.save();
  }
};

entrySchema.methods.removeTag = async function(tag) {
  this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
  await this.save();
};

entrySchema.methods.logChange = function(action, userId, changes = {}) {
  this.audit.changeLog.push({
    action,
    userId,
    changes,
    timestamp: new Date()
  });
};

// Static methods
entrySchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.tags) {
    query['metadata.tags'] = { $in: options.tags };
  }
  
  if (options.source) {
    query['source.type'] = options.source;
  }
  
  if (options.dateRange) {
    query['metadata.timestamp'] = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .sort({ 'metadata.timestamp': -1 })
    .limit(options.limit || 50);
};

entrySchema.statics.findExpired = function() {
  return this.find({
    'privacy.retentionDate': { $lt: new Date() }
  });
};

entrySchema.statics.textSearch = function(query, userId, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    userId
  };
  
  if (options.tags) {
    searchQuery['metadata.tags'] = { $in: options.tags };
  }
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || config.maxSearchResults);
};

entrySchema.statics.getStatsByUser = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalViews: { $sum: '$searchStats.viewCount' },
        totalSearchHits: { $sum: '$searchStats.searchHits' },
        avgTokens: { $avg: '$content.tokenCount' },
        sourceBreakdown: {
          $push: '$source.type'
        },
        tagBreakdown: {
          $push: '$metadata.tags'
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Entry', entrySchema); 
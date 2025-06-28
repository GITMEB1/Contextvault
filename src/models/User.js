const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  
  // Privacy and compliance
  privacy: {
    dataProcessingConsent: {
      type: Boolean,
      default: false,
      required: [true, 'Data processing consent is required']
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    dataRetentionDays: {
      type: Number,
      default: 365,
      min: [30, 'Data retention cannot be less than 30 days'],
      max: [3650, 'Data retention cannot exceed 10 years']
    },
    consentDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Usage statistics
  stats: {
    totalEntries: {
      type: Number,
      default: 0
    },
    totalSearches: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, config.bcryptRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.stats.lastActivity = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema); 
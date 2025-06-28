const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { APIError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All user routes require authentication
router.use(auth);

// GET /users/profile - Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      stats: user.stats,
      privacy: user.privacy,
      createdAt: user.createdAt
    }
  });
}));

// PUT /users/profile - Update user profile
router.put('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  const { username, privacy } = req.body;

  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new APIError('Username already exists', 409, 'USERNAME_EXISTS');
    }
    user.username = username;
  }

  if (privacy) {
    if (privacy.marketingConsent !== undefined) {
      user.privacy.marketingConsent = privacy.marketingConsent;
    }
    if (privacy.dataRetentionDays !== undefined) {
      user.privacy.dataRetentionDays = privacy.dataRetentionDays;
    }
  }

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      privacy: user.privacy
    }
  });
}));

module.exports = router; 
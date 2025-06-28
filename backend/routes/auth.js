const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - privacy
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         privacy:
 *           type: object
 *           properties:
 *             dataProcessingConsent:
 *               type: boolean
 *             marketingConsent:
 *               type: boolean
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

// Register new user
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('privacy.dataProcessingConsent')
    .isBoolean()
    .custom(value => {
      if (value !== true) {
        throw new Error('Data processing consent is required');
      }
      return true;
    })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors: errors.array() }
    );
  }

  const { username, email, password, privacy } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    throw new APIError(
      `User with this ${field} already exists`,
      409,
      'USER_EXISTS',
      { field }
    );
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    privacy: {
      dataProcessingConsent: privacy.dataProcessingConsent,
      marketingConsent: privacy.marketingConsent || false,
      ipAddress: req.ip
    }
  });

  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  logger.logAuth('register', user._id, {
    username,
    email,
    ip: req.ip
  });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account disabled
 */

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors: errors.array() }
    );
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new APIError(
      'Invalid email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  // Check if account is active
  if (!user.isActive) {
    throw new APIError(
      'Account is disabled',
      403,
      'ACCOUNT_DISABLED'
    );
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new APIError(
      'Invalid email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = user.generateAuthToken();

  logger.logAuth('login', user._id, {
    email,
    ip: req.ip
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid or expired token
 */

// Verify token
router.get('/verify', require('../middleware/auth').auth, asyncHandler(async (req, res) => {
  // If we reach here, the token is valid (middleware verified it)
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (client-side token invalidation)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

// Logout (mainly for logging purposes, actual token invalidation happens on client)
router.post('/logout', require('../middleware/auth').auth, asyncHandler(async (req, res) => {
  // Log logout
  logger.logAuth('logout', req.user.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    message: 'Logout successful'
  });
}));

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */

// Get user profile
router.get('/profile', require('../middleware/auth').auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user: user.profile
  });
}));

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               privacy:
 *                 type: object
 *                 properties:
 *                   marketingConsent:
 *                     type: boolean
 *                   dataRetentionDays:
 *                     type: number
 *                     minimum: 30
 *                     maximum: 3650
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */

// Update user profile
router.put('/profile', [
  require('../middleware/auth').auth,
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('privacy.dataRetentionDays')
    .optional()
    .isInt({ min: 30, max: 3650 })
    .withMessage('Data retention must be between 30 and 3650 days'),
  
  body('privacy.marketingConsent')
    .optional()
    .isBoolean()
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors: errors.array() }
    );
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  const { username, privacy } = req.body;

  // Check if username is being updated and if it's available
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new APIError(
        'Username already exists',
        409,
        'USERNAME_EXISTS'
      );
    }
    user.username = username;
  }

  // Update privacy settings
  if (privacy) {
    if (privacy.marketingConsent !== undefined) {
      user.privacy.marketingConsent = privacy.marketingConsent;
    }
    if (privacy.dataRetentionDays !== undefined) {
      user.privacy.dataRetentionDays = privacy.dataRetentionDays;
    }
  }

  await user.save();

  // Log profile update
  logger.logAuth('profile_update', user._id, {
    changes: req.body,
    ip: req.ip
  });

  res.json({
    message: 'Profile updated successfully',
    user: user.profile
  });
}));

module.exports = router; 
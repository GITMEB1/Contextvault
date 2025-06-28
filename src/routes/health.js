const express = require('express');
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "connected"
 *                         responseTime:
 *                           type: string
 *                           example: "5ms"
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */

// Basic health check
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
    uptime: process.uptime(),
    dependencies: {}
  };

  const errors = [];

  try {
    // Check database connection
    const dbStart = Date.now();
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test database with a simple query
      await mongoose.connection.db.admin().ping();
      healthCheck.dependencies.database = {
        status: 'connected',
        responseTime: `${Date.now() - dbStart}ms`,
        state: dbStatus[dbState]
      };
    } else {
      healthCheck.dependencies.database = {
        status: 'disconnected',
        state: dbStatus[dbState]
      };
      errors.push('Database not connected');
    }
  } catch (error) {
    healthCheck.dependencies.database = {
      status: 'error',
      error: error.message
    };
    errors.push(`Database error: ${error.message}`);
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  healthCheck.system = {
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
      unit: 'MB'
    },
    uptime: `${Math.floor(process.uptime())}s`,
    platform: process.platform,
    nodeVersion: process.version
  };

  // Overall response time
  healthCheck.responseTime = `${Date.now() - startTime}ms`;

  // Determine overall health status
  if (errors.length > 0) {
    healthCheck.status = 'unhealthy';
    healthCheck.errors = errors;
    
    logger.warn('Health check failed', { errors, healthCheck });
    return res.status(503).json(healthCheck);
  }

  logger.debug('Health check successful', { responseTime: healthCheck.responseTime });
  res.json(healthCheck);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns whether the API is ready to serve requests
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is ready
 *       503:
 *         description: API is not ready
 */

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected'
      });
    }

    // Test database connectivity
    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'not ready',
      reason: error.message
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Returns whether the API process is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is alive
 */

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Basic metrics endpoint
 *     description: Returns basic application metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Metrics data
 */

// Basic metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        state: mongoose.connection.readyState,
        collections: Object.keys(mongoose.connection.collections).length
      }
    };

    // Add database-specific metrics if connected
    if (mongoose.connection.readyState === 1) {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      metrics.database.stats = {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize
      };
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed', error);
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message
    });
  }
});

module.exports = router; 
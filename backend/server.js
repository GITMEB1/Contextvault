const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Compression middleware (now that we have more resources)
app.use(compression());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.enableRequestLogging) {
  app.use(requestLogger);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`/${config.apiVersion}`, limiter);

// Swagger documentation
if (config.enableSwagger) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ContextVault API',
        version: '1.0.0',
        description: 'Scalable conversational data storage and retrieval system with semantic search capabilities',
        contact: {
          name: 'ContextVault Team',
          email: 'support@contextvault.com'
        },
      },
      servers: [
        {
          url: `http://localhost:${config.port}/${config.apiVersion}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.js', './src/models/*.js'],
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// API routes
app.use(`/${config.apiVersion}/health`, healthRoutes);
app.use(`/${config.apiVersion}/auth`, authRoutes);
app.use(`/${config.apiVersion}/users`, userRoutes);
app.use(`/${config.apiVersion}/entries`, entryRoutes);
app.use(`/${config.apiVersion}/search`, searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ContextVault API',
    version: '1.0.0',
    status: 'operational',
    documentation: config.enableSwagger ? '/api-docs' : 'disabled',
    endpoints: {
      health: `/${config.apiVersion}/health`,
      auth: `/${config.apiVersion}/auth`,
      entries: `/${config.apiVersion}/entries`,
      search: `/${config.apiVersion}/search`,
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    if (config.enableMockData) {
      logger.info('Running in mock data mode - skipping database connection');
      return;
    }
    
    const conn = await mongoose.connect(config.mongodbUri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    if (!config.enableMockData) {
      process.exit(1);
    }
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    if (config.enableMockData) {
      logger.info('Mock data mode - skipping index creation');
      return;
    }
    
    const Entry = require('./models/Entry');
    const User = require('./models/User');

    // Entry indexes
    await Entry.createIndexes();
    logger.info('Entry indexes created successfully');

    // User indexes  
    await User.createIndexes();
    logger.info('User indexes created successfully');

  } catch (error) {
    logger.error('Error creating indexes:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(config.port, () => {
      logger.info(`ContextVault API server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`Health check: http://localhost:${config.port}/${config.apiVersion}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  startServer();
}

module.exports = app; 
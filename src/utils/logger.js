const winston = require('winston');
const config = require('../config/config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: config.logLevel,
  }),
];

// Add file transports in production
if (config.nodeEnv === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // Exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add helper methods for structured logging
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logRequest = (req, res, responseTime) => {
  logger.http({
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
};

logger.logAuth = (action, userId, details = {}) => {
  logger.info({
    type: 'auth',
    action,
    userId,
    ...details,
  });
};

logger.logDatabase = (operation, collection, details = {}) => {
  logger.debug({
    type: 'database',
    operation,
    collection,
    ...details,
  });
};

logger.logSearch = (query, resultsCount, responseTime, userId) => {
  logger.info({
    type: 'search',
    query: query.substring(0, 100), // Truncate long queries
    resultsCount,
    responseTime: `${responseTime}ms`,
    userId,
  });
};

logger.logEmbedding = (source, tokensUsed, responseTime) => {
  logger.info({
    type: 'embedding',
    source,
    tokensUsed,
    responseTime: `${responseTime}ms`,
  });
};

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = logger; 
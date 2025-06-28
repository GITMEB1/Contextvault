const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Record start time
  const startTime = Date.now();
  
  // Log request details
  logger.info({
    type: 'request_start',
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
  });
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log response details
    logger.info({
      type: 'request_complete',
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: JSON.stringify(data).length,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  // Override res.end to catch non-JSON responses
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    if (!res.headersSent) {
      const responseTime = Date.now() - startTime;
      
      logger.info({
        type: 'request_complete',
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        contentLength: chunk ? chunk.length : 0,
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      });
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Handle response errors
  res.on('error', (error) => {
    const responseTime = Date.now() - startTime;
    
    logger.error({
      type: 'request_error',
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      error: error.message,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });
  });
  
  next();
};

module.exports = requestLogger; 
require('dotenv').config();

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contextvault',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/contextvault_test',

  // Redis configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD || '',

  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

  // OpenAI configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'text-embedding-ada-002',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // Development mode
  enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
  mockUserId: process.env.MOCK_USER_ID || 'dev-user-123',

  // Security
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',

  // Monitoring & logging
  logLevel: process.env.LOG_LEVEL || 'info',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',

  // Vector search configuration
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION, 10) || 1536,
  vectorSimilarityThreshold: parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD) || 0.7,
  maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS, 10) || 50,
  useLocalEmbeddings: process.env.USE_LOCAL_EMBEDDINGS === 'true',
  autoGenerateEmbeddings: process.env.AUTO_GENERATE_EMBEDDINGS !== 'false',

  // File upload configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB instead of 10MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',') 
    : [
        'application/json', 
        'text/plain', 
        'text/csv', 
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/markdown',
        'application/xml'
      ],

  // Privacy & compliance
  enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 365,
  enablePiiDetection: process.env.ENABLE_PII_DETECTION === 'true',
};

// Validation
const validateConfig = () => {
  const requiredInProduction = ['JWT_SECRET', 'MONGODB_URI'];
  
  if (config.nodeEnv === 'production') {
    const missing = requiredInProduction.filter(key => 
      !process.env[key] || process.env[key] === config[key.toLowerCase().replace(/_/g, '')]
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }
  }

  // Validate database URI format
  if (!config.mongodbUri.startsWith('mongodb://') && !config.mongodbUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }

  // Validate embedding dimension
  if (config.embeddingDimension < 1 || config.embeddingDimension > 3072) {
    throw new Error('Embedding dimension must be between 1 and 3072');
  }

  // Validate rate limiting values
  if (config.rateLimitMaxRequests < 1) {
    throw new Error('Rate limit max requests must be at least 1');
  }

  console.log(`Configuration loaded for environment: ${config.nodeEnv}`);
  
  if (config.nodeEnv === 'development') {
    console.log('Development mode features:');
    console.log(`- Mock data: ${config.enableMockData ? 'enabled' : 'disabled'}`);
    console.log(`- Swagger docs: ${config.enableSwagger ? 'enabled' : 'disabled'}`);
    console.log(`- Request logging: ${config.enableRequestLogging ? 'enabled' : 'disabled'}`);
  }
};

// Run validation
validateConfig();

module.exports = config; 
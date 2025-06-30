const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
NODE_ENV=development
PORT=8000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/contextvault
MONGODB_TEST_URI=mongodb://localhost:27017/contextvault_test

# Redis Configuration (for caching and queues)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=sbDZwMKhGqFUBM+cgMLV+QxdEG1zrF0aTrF1ymAOg1ll6zJbVWQODimxUYRL864HEzOrnr8uUN9jo8+aOX/Kfg==
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# OpenAI Configuration (for embeddings fallback)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=text-embedding-ada-002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development Mode (enables mock data)
ENABLE_MOCK_DATA=false
MOCK_USER_ID=dev-user-123

# Security
CORS_ORIGIN=http://localhost:3000
ENABLE_SWAGGER=true

# Monitoring & Logging
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true

# Vector Search Configuration
EMBEDDING_DIMENSION=1536
VECTOR_SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=50
USE_LOCAL_EMBEDDINGS=true
AUTO_GENERATE_EMBEDDINGS=true

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/json,text/plain

# Privacy & Compliance
ENABLE_AUDIT_LOGGING=true
DATA_RETENTION_DAYS=365
ENABLE_PII_DETECTION=false`;

// Create backend .env file
const backendEnvPath = path.join(__dirname, 'backend', '.env');
fs.writeFileSync(backendEnvPath, envContent);

console.log('✅ Created backend/.env file successfully!');
console.log('🔐 JWT Secret configured with secure random key');
console.log('🚀 Ready to start with Docker!'); 
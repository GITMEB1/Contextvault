# ContextVault - Intelligent Conversational Data Management

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ContextVault is a scalable, intelligent system for storing, organizing, and retrieving conversational data with advanced semantic search capabilities. It provides a robust backend API for managing chat conversations, documents, and any text-based content with AI-powered search and similarity matching.

## 🚀 Features

### Core Functionality
- **Secure User Authentication** - JWT-based auth with registration, login, and profile management
- **Entry Management** - Full CRUD operations for conversational data and documents
- **Advanced Search** - Text search, vector similarity search, and hybrid search combining both
- **Intelligent Tagging** - Automatic and manual tagging system for content organization
- **Source Tracking** - Track content origin (ChatGPT, Claude, manual entry, API)

### AI-Powered Search
- **Vector Embeddings** - Generate embeddings using OpenAI API or local models
- **Semantic Search** - Find content by meaning, not just keywords
- **Hybrid Search** - Combine text and vector search with weighted scoring
- **Similarity Detection** - Find related entries based on content similarity
- **Smart Suggestions** - AI-powered search suggestions and content recommendations

### Developer Experience
- **RESTful API** - Clean, well-documented REST endpoints
- **OpenAPI Documentation** - Interactive Swagger UI at `/api-docs`
- **Comprehensive Validation** - Input validation and error handling
- **Health Monitoring** - System health checks and metrics
- **Development Mode** - Mock data support for database-less development

### Security & Privacy
- **Data Privacy** - GDPR-compliant data handling and user privacy controls
- **Rate Limiting** - Protect against abuse with configurable rate limits
- **Security Headers** - Helmet.js security middleware
- **Input Sanitization** - Comprehensive input validation and sanitization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   Backend API   │────│    MongoDB      │
│  (React/Vue)    │    │   (Node.js)     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌──────┴──────┐
                       │             │
                ┌─────────────┐ ┌─────────────┐
                │  OpenAI API │ │ Local Model │
                │ Embeddings  │ │ Embeddings  │
                └─────────────┘ └─────────────┘
```

## 📋 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `GET /v1/auth/profile` - Get user profile
- `PUT /v1/auth/profile` - Update user profile
- `GET /v1/auth/verify` - Verify JWT token

### Entry Management
- `GET /v1/entries` - List entries with pagination and filtering
- `POST /v1/entries` - Create new entry
- `GET /v1/entries/:id` - Get specific entry
- `PUT /v1/entries/:id` - Update entry
- `DELETE /v1/entries/:id` - Delete entry
- `GET /v1/entries/:id/stats` - Get entry statistics

### Search & Discovery
- `GET /v1/search/text` - Full-text search
- `POST /v1/search/vector` - Vector similarity search
- `POST /v1/search/hybrid` - Hybrid search (text + vector)
- `GET /v1/search/similar/:id` - Find similar entries
- `POST /v1/search/embeddings/generate` - Generate embeddings
- `GET /v1/search/suggestions` - Get search suggestions

### System
- `GET /v1/health` - Health check with system metrics
- `GET /api-docs` - Interactive API documentation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+ (optional for development with mock data)
- OpenAI API key (optional, for production embeddings)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ContextVAULT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp config.env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm run dev  # Development mode with hot reload
   npm start    # Production mode
   ```

5. **Access the API**
   - API: `http://localhost:8000`
   - Documentation: `http://localhost:8000/api-docs`
   - Health Check: `http://localhost:8000/v1/health`

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=8000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/contextvault

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=text-embedding-ada-002

# Development Features
ENABLE_MOCK_DATA=true
ENABLE_SWAGGER=true
ENABLE_REQUEST_LOGGING=true

# Vector Search
EMBEDDING_DIMENSION=1536
VECTOR_SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=50
USE_LOCAL_EMBEDDINGS=false
AUTO_GENERATE_EMBEDDINGS=true
```

## 🚀 Development

### Development Mode
The application supports a development mode with mock data, allowing you to run and test without a database:

```bash
npm run dev
```

Features in development mode:
- Mock data for testing
- No database connection required
- Swagger UI enabled
- Request logging enabled
- Hot reload with nodemon

### Docker Support
```bash
# Build and run with Docker
docker build -t contextvault .
docker run -p 8000:8000 contextvault

# Or use Docker Compose
docker-compose up
```

### Testing
```bash
npm test        # Run tests
npm run lint    # Run linting
npm run lint:fix # Fix linting issues
```

## 📊 Data Models

### Entry Model
```javascript
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "content": {
    "raw": "string",
    "processed": "string",
    "tokenCount": "number"
  },
  "source": {
    "type": "chatgpt|claude|manual|api",
    "version": "string",
    "exportDate": "Date"
  },
  "metadata": {
    "title": "string",
    "tags": ["string"],
    "timestamp": "Date",
    "customFields": "object"
  },
  "embeddings": {
    "vector": [1536], // OpenAI embedding
    "model": "string",
    "dimension": "number",
    "checksum": "string",
    "generatedAt": "Date"
  },
  "privacy": {
    "isPrivate": "boolean",
    "retentionDate": "Date",
    "sensitivityLevel": "low|medium|high"
  }
}
```

### User Model
```javascript
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "string", // hashed
  "role": "user|admin",
  "stats": {
    "totalEntries": "number",
    "totalSearches": "number",
    "lastLogin": "Date"
  },
  "privacy": {
    "marketingConsent": "boolean",
    "dataRetentionDays": "number"
  }
}
```

## 🔍 Search Capabilities

### Text Search
Traditional full-text search using MongoDB text indexes:
```javascript
GET /v1/search/text?q=artificial intelligence&limit=20
```

### Vector Search
Semantic search using AI embeddings:
```javascript
POST /v1/search/vector
{
  "query": "machine learning algorithms",
  "limit": 20,
  "threshold": 0.7
}
```

### Hybrid Search
Combines text and vector search with weighted scoring:
```javascript
POST /v1/search/hybrid
{
  "query": "neural networks",
  "textWeight": 0.3,
  "vectorWeight": 0.7,
  "limit": 20
}
```

## 🎯 Use Cases

- **Personal Knowledge Management** - Store and search personal conversations and notes
- **Customer Support** - Organize and find relevant support conversations
- **Research & Documentation** - Manage research notes and documentation with semantic search
- **Content Management** - Organize any text-based content with AI-powered discovery
- **Team Knowledge Base** - Share and discover team conversations and insights

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Configurable request rate limiting
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js security middleware
- **CORS Protection** - Configurable CORS policies
- **Environment Isolation** - Separate development and production configs

## 📈 Performance

- **Pagination** - Efficient pagination for large datasets
- **Indexing** - Optimized MongoDB indexes for fast queries
- **Caching Ready** - Redis caching support (configurable)
- **Async Processing** - Non-blocking embedding generation
- **Connection Pooling** - Efficient database connection management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [OpenAI API](https://openai.com/api/) - For production embeddings
- [MongoDB](https://mongodb.com/) - Primary database
- [Express.js](https://expressjs.com/) - Web framework
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - API documentation

---

**Ready for frontend development!** This backend provides a complete API for building modern, intelligent applications with conversational data management and AI-powered search capabilities. 
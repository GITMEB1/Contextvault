# ContextVault API

A scalable conversational data storage and retrieval system with semantic search capabilities.

## Features

- **Secure Authentication**: JWT-based authentication with privacy compliance
- **Conversational Data Storage**: Store ChatGPT exports, Claude conversations, and manual entries
- **Advanced Search**: Full-text search with planned vector similarity search
- **Privacy by Design**: GDPR-compliant data handling with retention policies
- **RESTful API**: Clean, documented API with Swagger/OpenAPI specification

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (recommended)

### Development Setup

1. **Start with Docker (Recommended):**
```bash
docker-compose up -d
```

2. **Manual Setup:**
```bash
npm install
cp config.env.example .env
npm run dev
```

3. **Access the API:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/api-docs
- MongoDB Admin: http://localhost:8081

## API Endpoints

### Authentication
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - User login

### Entries
- `GET /v1/entries` - List entries
- `POST /v1/entries` - Create entry
- `GET /v1/entries/:id` - Get entry
- `PUT /v1/entries/:id` - Update entry
- `DELETE /v1/entries/:id` - Delete entry

### Search
- `GET /v1/search/text?q=query` - Text search
- `POST /v1/search/vector` - Vector search (planned)

### Health
- `GET /v1/health` - Health check

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:8000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "privacy": {
      "dataProcessingConsent": true
    }
  }'
```

### Create Entry
```bash
curl -X POST http://localhost:8000/v1/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Conversation about AI ethics...",
    "source": { "type": "chatgpt" },
    "metadata": {
      "tags": ["ai", "ethics"]
    }
  }'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/contextvault` | Database URI |
| `JWT_SECRET` | - | JWT secret (required) |
| `ENABLE_SWAGGER` | `false` | Enable API docs |

## Project Structure

```
src/
├── config/          # Configuration
├── middleware/      # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Utilities
└── server.js        # Entry point
```

## Roadmap

- ✅ **Phase 1**: Core API, authentication, basic search
- 🔄 **Phase 2**: Vector search, embeddings
- 📅 **Phase 3**: Advanced AI features, analytics

## License

MIT License 
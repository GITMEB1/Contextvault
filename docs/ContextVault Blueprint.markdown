# ContextVault Blueprint

ContextVault is a scalable system designed to store, manage, and retrieve conversational data (e.g., ChatGPT exports) for downstream AI analysis. This blueprint outlines its architecture, core functionality, and technical decisions, optimized for clarity and developer integration.

## Overview

- **Purpose**: Store and query structured conversational data with semantic search capabilities for AI systems.
- **Core Components**:
  - RESTful API for integration simplicity.
  - MongoDB Atlas for unified storage of JSON data and vector embeddings.
  - Python ingestion script for processing ChatGPT exports.
- **Target Scale**: Supports 1 billion+ entries with efficient search and retrieval.

## Architecture

### Design Choices
- **RESTful API**: Chosen for its simplicity, widespread adoption, and compatibility with HTTP standards, making it easier for developers to integrate compared to GraphQL’s added complexity.
- **MongoDB Atlas**: Combines structured JSON storage with vector search, reducing architectural complexity while scaling horizontally via sharding.
- **OAuth2 Authentication**: Secures access for users and AI clients using JWT tokens.

### Data Flow
1. **Ingestion**: ChatGPT JSON exports are processed by a Python script, generating embeddings via OpenAI’s API, then stored via the API.
2. **Storage**: Data resides in MongoDB Atlas, with embeddings embedded in entries for efficient retrieval.
3. **Querying**: Full-text and vector search endpoints enable flexible data access.

## Core Functionality

### Data Entities
- **User**: Tracks user identity (ID, username, email).
- **Entry**: Stores conversational content, metadata (timestamp, source, tags), and embeddings.
- **Source**: Identifies data origin (e.g., ChatGPT).
- **Tag**: Organizes entries for filtering.

### Key Features
- **Ingestion**: Batch processes JSON exports, generating 1536-dimensional embeddings with OpenAI’s `text-embedding-ada-002`.
- **CRUD Operations**: Create, read, update, and delete entries via REST endpoints.
- **Search**:
  - Full-text search on content.
  - Vector search for semantic queries using embeddings.
- **Security**: OAuth2 ensures authenticated access with role-based scopes.

## Technical Details

### API Endpoints
- **POST /v1/entries**: Ingests a new entry with content and embedding.
- **GET /v1/entries/{id}**: Retrieves an entry.
- **PUT /v1/entries/{id}**: Updates an entry.
- **DELETE /v1/entries/{id}**: Deletes an entry.
- **GET /v1/search/text?q={query}**: Full-text search.
- **POST /v1/search/vector**: Vector search with text or embedding input.

### Schema Example (Entry)
```json
{
  "user_id": "123",
  "source_id": "chatgpt",
  "content": "User asked about AI ethics...",
  "timestamp": "2023-10-01T12:00:00Z",
  "tags": ["ethics", "AI"],
  "embedding": [0.1, 0.2, ...], // 1536 floats
  "schema_version": 1
}
```

### Scalability
- **Sharding**: Distributes entries across MongoDB nodes using `user_id` or `timestamp`.
- **Indexing**: Optimizes queries with indexes on `user_id`, `timestamp`, and a vector index for embeddings.
- **Future Options**: Tiered storage (SSD/HDD) and caching (Redis) for performance.

## Extensibility

- **Plugins**: Planned ChatGPT plugin for real-time exports.
- **Dashboard**: Admin interface for data visualization and management.
- **Recommender**: Suggests relevant entries using vector similarity.

## Why This Approach?
- **Simplicity**: REST and MongoDB reduce setup overhead for developers.
- **Scalability**: Handles massive datasets with built-in MongoDB features.
- **AI-Ready**: Vector embeddings enable semantic analysis out of the box.

This blueprint ensures ContextVault is clear, actionable, and tailored for technical users building AI-driven applications.
# 🚀 Bolt.new Prompt for ContextVault Frontend

## Project Overview
Create a **modern, beautiful, and highly functional React frontend** for **ContextVault** - an intelligent conversational data management system with AI-powered semantic search capabilities.

## 🎯 What You're Building
A sophisticated web application that showcases the power of AI-driven content management and semantic search. Think of it as "Google for your personal conversations and documents" but with AI that understands meaning, not just keywords.

## 📋 Repository Information
**GitHub Repository:** [Repository URL will be provided]
**Backend API:** Fully functional Node.js/Express backend with comprehensive REST API
**API Documentation:** Available at `http://localhost:8000/api-docs` (Swagger UI)

## 🎨 Design Vision

### Style & Aesthetics
- **Modern & Professional** - Clean, contemporary design suitable for both personal and business use
- **AI-First Design** - Emphasize the intelligent search and semantic capabilities
- **Color Palette:**
  - Primary: Deep blue (#1e40af) and electric blue (#3b82f6)
  - Success: Emerald green (#10b981)
  - Warning: Amber (#f59e0b)
  - Error: Red (#ef4444)
  - Neutrals: Modern grays (#f8fafc, #e2e8f0, #64748b)
- **Typography:** Inter or Poppins for headers, clean sans-serif for body text
- **Layout:** Spacious, card-based design with subtle shadows and gradients

### User Experience Principles
- **Intuitive Navigation** - Users should immediately understand how to search and manage content
- **Progressive Disclosure** - Advanced features available but not overwhelming
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Fast & Smooth** - Optimistic updates, skeleton loading, smooth animations

## 🚀 Core Features to Implement

### 1. Authentication & Landing
- **Landing Page** with compelling hero showcasing AI search capabilities
- **Login/Register** forms with smooth validation and error handling
- **User Dashboard** with stats, recent activity, and quick actions

### 2. Intelligent Search Interface (PRIMARY FOCUS)
This is the core differentiator - make this exceptional:

- **Unified Search Bar** with three modes:
  - **Text Search** (traditional keyword matching)
  - **Vector Search** (AI semantic understanding)
  - **Hybrid Search** (combined with adjustable weights)
- **Real-time Search Suggestions** as user types
- **Search Results** with:
  - Relevance/similarity scores displayed prominently
  - Content previews with highlighted matches
  - Source indicators (ChatGPT, Claude, Manual, API)
  - "Find Similar" buttons for each result
- **Advanced Filters** - source, date range, tags, content type
- **Search Analytics** - show search patterns and insights

### 3. Entry Management
- **Entry List** with pagination, filtering, and sorting
- **Entry Creation** with rich text editor and auto-tagging
- **Entry Detail View** with full content and metadata
- **Bulk Operations** for power users

### 4. AI-Powered Features
- **Similarity Explorer** - visual network of related content
- **Embedding Status** - show which entries have AI embeddings
- **Smart Recommendations** based on user behavior
- **Content Insights** and analytics

## 🛠️ Technical Requirements

### Tech Stack
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for API state management
- **React Router** for navigation
- **React Hook Form** for forms
- **Zustand** for global state management

### Key Components to Build
```
src/
├── components/
│   ├── auth/           # Login, register, profile
│   ├── search/         # Search bar, results, filters
│   ├── entries/        # Entry list, detail, create/edit
│   ├── dashboard/      # Dashboard widgets and stats
│   ├── ui/            # Reusable UI components
│   └── layout/        # Navigation, header, sidebar
├── hooks/             # Custom hooks for API calls
├── services/          # API integration
├── store/            # Global state management
└── utils/            # Helper functions
```

### Performance Features
- **Code Splitting** with React.lazy
- **Virtual Scrolling** for large entry lists
- **Debounced Search** to prevent excessive API calls
- **Optimistic Updates** for better UX
- **Error Boundaries** for graceful error handling

## 🔧 API Integration Guide

### Authentication Flow
```javascript
// Login
POST http://localhost:8000/v1/auth/login
{ "email": "user@example.com", "password": "password" }

// Register
POST http://localhost:8000/v1/auth/register
{ "username": "user", "email": "user@example.com", "password": "password" }

// Get Profile
GET http://localhost:8000/v1/auth/profile
Authorization: Bearer <jwt-token>
```

### Entry Management
```javascript
// Get entries with pagination and filters
GET http://localhost:8000/v1/entries?page=1&limit=20&tags=ai,ml&source=chatgpt

// Create entry
POST http://localhost:8000/v1/entries
{
  "content": "Your content here...",
  "metadata": {
    "title": "Entry Title",
    "tags": ["ai", "machine-learning"]
  },
  "source": { "type": "manual" }
}

// Get entry details
GET http://localhost:8000/v1/entries/:id
```

### Search Endpoints (CRITICAL)
```javascript
// Text search
GET http://localhost:8000/v1/search/text?q=machine learning&limit=20

// Vector search (AI semantic)
POST http://localhost:8000/v1/search/vector
{
  "query": "artificial intelligence concepts",
  "limit": 20,
  "threshold": 0.7
}

// Hybrid search (combined)
POST http://localhost:8000/v1/search/hybrid
{
  "query": "neural networks",
  "textWeight": 0.3,
  "vectorWeight": 0.7,
  "limit": 20
}

// Find similar entries
GET http://localhost:8000/v1/search/similar/:entryId?limit=10&threshold=0.7

// Search suggestions and stats
GET http://localhost:8000/v1/search/suggestions
```

## 🎯 Key User Flows to Nail

### 1. First-Time User Experience
1. Land on homepage → See compelling AI search demo
2. Register → Quick onboarding
3. Add first entry → See auto-embedding generation
4. Perform first search → Experience AI magic
5. Explore similar content → Understand the value

### 2. Power User Workflow
1. Dashboard → See all stats and recent activity
2. Advanced search → Use filters and multiple search types
3. Bulk operations → Manage multiple entries efficiently
4. Analytics → Understand content patterns and insights

### 3. Search Experience (MOST IMPORTANT)
1. Type in search bar → See real-time suggestions
2. Toggle search types → Understand different capabilities
3. View results → See relevance scores and previews
4. Find similar → Discover related content
5. Refine search → Use filters and advanced options

## 🎨 UI/UX Highlights to Implement

### Search Interface Design
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search your knowledge base...           [⚙️ Advanced]   │
│                                                             │
│  ○ Text Search    ● Vector Search    ○ Hybrid Search       │
│                                                             │
│  📊 Filters: [All Sources ▼] [Tags ▼] [Date ▼]            │
└─────────────────────────────────────────────────────────────┘

Results with similarity scores, content previews, and "Find Similar" buttons
```

### Entry Cards
- **Visual Hierarchy** - Title, preview, metadata clearly organized
- **Source Indicators** - Icons for ChatGPT, Claude, Manual, API
- **Similarity Scores** - When shown in search results
- **Quick Actions** - View, Edit, Find Similar, Delete
- **Tag Pills** - Colorful, clickable tags

### Dashboard Widgets
- **Stats Cards** - Total entries, searches, AI insights
- **Recent Activity** - Timeline of recent entries and searches
- **Quick Actions** - Add entry, quick search, bulk operations
- **Embedding Status** - Progress of AI processing

## 🚀 Advanced Features to Showcase

### AI Capabilities
- **Semantic Search Demo** - Show how AI understands meaning vs keywords
- **Content Clustering** - Visual representation of related content
- **Smart Suggestions** - AI-powered recommendations
- **Similarity Visualization** - Network graphs or heatmaps

### Analytics & Insights
- **Search Performance** - Charts showing search patterns
- **Content Growth** - Timeline of entries added
- **Popular Topics** - Tag clouds and trending content
- **AI Utilization** - How much users leverage vector search

## 🎯 Success Criteria

Your frontend should:

1. **Immediately Demonstrate Value** - Users understand why AI search is better
2. **Feel Fast & Responsive** - Smooth interactions, optimistic updates
3. **Handle Complexity Gracefully** - Advanced features don't overwhelm
4. **Look Professional** - Suitable for business and personal use
5. **Showcase AI Power** - Make semantic search capabilities obvious

## 🔥 Special Focus Areas

### 1. Search Experience (60% of effort)
This is the core differentiator. Make searching feel magical:
- Instant feedback as users type
- Clear visual distinction between search types
- Prominent similarity scores and relevance indicators
- Smooth animations when switching between search modes
- "Wow factor" when users see AI understanding their intent

### 2. Visual Design (25% of effort)
Modern, clean, professional:
- Consistent spacing and typography
- Subtle animations and hover effects
- Clear visual hierarchy
- Beautiful color usage
- Responsive design that works everywhere

### 3. Performance & UX (15% of effort)
Fast and smooth:
- Skeleton loading states
- Optimistic updates
- Error handling with helpful messages
- Keyboard shortcuts for power users
- Mobile-optimized interactions

## 🎬 Demo Scenarios to Enable

1. **AI Search Demo** - User searches "machine learning" and sees semantically related content about "neural networks" and "artificial intelligence"
2. **Similarity Discovery** - User clicks "Find Similar" and discovers related content they forgot they had
3. **Hybrid Search** - User adjusts weights between text and vector search to fine-tune results
4. **Content Growth** - User sees their knowledge base grow and become more searchable over time

## 🚀 Get Started

1. **Clone the repository** and examine the backend API structure
2. **Start with authentication** - login/register flow
3. **Build the search interface** - this is your primary focus
4. **Add entry management** - CRUD operations
5. **Implement dashboard** - stats and overview
6. **Polish and optimize** - animations, performance, mobile

The backend is production-ready with comprehensive API documentation. Focus on creating a frontend that showcases the full potential of AI-powered content management and semantic search.

**Make it beautiful. Make it fast. Make the AI capabilities shine.** 🌟 
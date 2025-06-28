# ContextVault Frontend Requirements for Bolt.new

## 🎯 Project Overview

**ContextVault** is an intelligent conversational data management system with a complete backend API. Your task is to create a modern, beautiful, and highly functional frontend that showcases the power of AI-driven semantic search and content management.

## 🏗️ Backend API Information

**Base URL:** `http://localhost:8000`
**API Documentation:** `http://localhost:8000/api-docs` (Swagger UI)
**Health Check:** `http://localhost:8000/v1/health`

The backend is fully functional with:
- JWT Authentication system
- Complete CRUD operations for entries
- Advanced search (text, vector, hybrid)
- User management and profiles
- Real-time health monitoring
- Comprehensive error handling

## 🎨 Design Requirements

### Design Philosophy
- **Modern & Clean** - Contemporary design with plenty of whitespace
- **AI-First** - Emphasize the intelligent search and AI capabilities
- **Professional** - Suitable for both personal and business use
- **Responsive** - Perfect on desktop, tablet, and mobile
- **Accessible** - WCAG 2.1 AA compliance

### Color Scheme & Branding
- **Primary Colors:** Deep blue (#1e40af) and electric blue (#3b82f6)
- **Secondary Colors:** Emerald green (#10b981) for success states
- **Neutral Colors:** Modern grays (#f8fafc, #e2e8f0, #64748b)
- **Accent Colors:** Amber (#f59e0b) for highlights, red (#ef4444) for errors
- **Background:** Clean whites and light grays with subtle gradients

### Typography
- **Headers:** Modern sans-serif (Inter, Poppins, or similar)
- **Body:** Readable sans-serif with good spacing
- **Code/Data:** Monospace font for technical content
- **Emphasis on hierarchy** with clear font weights and sizes

## 🚀 Core Features to Implement

### 1. Authentication Flow
- **Landing Page** with compelling hero section showcasing AI search
- **Login/Register** with smooth animations and validation
- **Password Reset** functionality
- **User Profile** management with stats and preferences

### 2. Dashboard Overview
- **Welcome Section** with user stats and recent activity
- **Quick Actions** - Add entry, quick search, recent entries
- **Search Statistics** - Total entries, searches performed, AI insights
- **Embedding Status** - Show how many entries have AI embeddings
- **Recent Entries** preview with thumbnails/previews

### 3. Entry Management
- **Entry List** with advanced filtering and sorting
  - Filter by source (ChatGPT, Claude, Manual, API)
  - Filter by date range, tags, content type
  - Sort by relevance, date, title, similarity
- **Entry Creation** with rich text editor
  - Support for markdown
  - Auto-tagging suggestions
  - Source selection
  - Real-time preview
- **Entry Detail View** with full content and metadata
- **Entry Editing** with change tracking
- **Bulk Operations** - Delete, tag, export multiple entries

### 4. Intelligent Search Interface
- **Unified Search Bar** with search type toggle
- **Search Types:**
  - Text Search (traditional keyword)
  - Vector Search (AI semantic)
  - Hybrid Search (combined with weight sliders)
- **Advanced Search Builder** with visual query construction
- **Search Results** with:
  - Relevance scores and similarity percentages
  - Content previews with highlighted matches
  - Source indicators and metadata
  - "Find Similar" buttons for each result
- **Search History** and saved searches
- **Search Suggestions** based on user's content

### 5. AI-Powered Features
- **Similarity Explorer** - Visual network of related content
- **Content Insights** - AI-generated summaries and themes
- **Smart Tagging** - Automatic tag suggestions
- **Embedding Management** - Generate/regenerate embeddings with progress
- **AI Search Analytics** - Show search patterns and insights

### 6. Data Visualization
- **Content Timeline** - Visual timeline of entries
- **Tag Cloud** - Interactive tag visualization
- **Search Analytics** - Charts showing search patterns
- **Content Sources** - Pie chart of content origins
- **Similarity Heatmap** - Visual representation of content relationships

## 🛠️ Technical Requirements

### Framework & Tools
- **React 18+** with modern hooks and concurrent features
- **TypeScript** for type safety
- **Tailwind CSS** for styling (preferred) or styled-components
- **React Query/TanStack Query** for API state management
- **React Router** for navigation
- **React Hook Form** for form management
- **Zustand** or **Redux Toolkit** for global state

### Component Architecture
- **Atomic Design** principles (atoms, molecules, organisms)
- **Reusable Components** for consistent UI
- **Custom Hooks** for API interactions and business logic
- **Error Boundaries** for graceful error handling
- **Loading States** and skeleton screens

### Performance Optimizations
- **Code Splitting** with React.lazy
- **Virtual Scrolling** for large lists
- **Debounced Search** to prevent excessive API calls
- **Image Optimization** and lazy loading
- **Memoization** for expensive calculations

## 📱 User Experience Features

### Interactive Elements
- **Smart Search Autocomplete** with suggestions
- **Drag & Drop** for file uploads and organization
- **Keyboard Shortcuts** for power users
- **Contextual Menus** for quick actions
- **Toast Notifications** for user feedback
- **Progressive Disclosure** for complex features

### Animations & Transitions
- **Smooth Page Transitions** between routes
- **Micro-animations** for user interactions
- **Loading Animations** that feel fast and engaging
- **Hover Effects** that provide feedback
- **Search Result Animations** when filtering/sorting

### Responsive Design
- **Mobile-First** approach with progressive enhancement
- **Touch-Friendly** interfaces on mobile
- **Adaptive Layouts** that work on all screen sizes
- **Optimized Navigation** for mobile devices

## 🔧 API Integration Patterns

### Authentication
```javascript
// Login flow
POST /v1/auth/login
Authorization: Store JWT in httpOnly cookie or localStorage
Auto-refresh: Implement token refresh logic
```

### Entry Management
```javascript
// Get entries with pagination
GET /v1/entries?page=1&limit=20&tags=ai,ml&source=chatgpt

// Create entry with auto-embedding
POST /v1/entries
{
  "content": "...",
  "metadata": { "title": "...", "tags": [...] },
  "source": { "type": "manual" }
}
```

### Search Implementation
```javascript
// Hybrid search with weight controls
POST /v1/search/hybrid
{
  "query": "machine learning",
  "textWeight": 0.3,
  "vectorWeight": 0.7,
  "limit": 20
}

// Find similar entries
GET /v1/search/similar/entry-id?limit=10&threshold=0.7
```

## 🎯 Key Pages & Components

### 1. Landing Page
- Hero section with animated search demo
- Feature highlights with icons and descriptions
- Social proof and testimonials
- Call-to-action for registration

### 2. Dashboard
- Stats cards with animations
- Recent activity feed
- Quick action buttons
- Search shortcuts

### 3. Search Page
- Prominent search bar with type toggles
- Advanced filters sidebar
- Results grid with cards
- Pagination and infinite scroll

### 4. Entry Detail
- Full content display with syntax highlighting
- Metadata sidebar
- Related entries section
- Edit/delete actions

### 5. Profile Settings
- User information form
- Privacy preferences
- API key management
- Data export options

## 🚀 Advanced Features to Showcase

### AI Capabilities
- **Semantic Search Demo** - Show how AI understands meaning
- **Content Clustering** - Visual groups of related content
- **Smart Recommendations** - "You might be interested in..."
- **Embedding Visualization** - 2D/3D plots of content relationships

### Power User Features
- **Bulk Operations** with progress tracking
- **Advanced Query Builder** with visual interface
- **Export/Import** functionality
- **API Integration** examples and documentation

### Analytics & Insights
- **Search Performance** metrics and charts
- **Content Growth** over time
- **Usage Patterns** and recommendations
- **AI Insights** about user's content

## 🎨 UI Component Examples

### Search Interface
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [Search your knowledge base...]           [🎛️ Advanced] │
│                                                             │
│ ○ Text Search  ● Vector Search  ○ Hybrid Search            │
│                                                             │
│ Filters: [All Sources ▼] [All Tags ▼] [Date Range ▼]      │
└─────────────────────────────────────────────────────────────┘
```

### Entry Card
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Machine Learning Fundamentals              🏷️ AI, ML, DL │
│                                                             │
│ A comprehensive overview of machine learning algorithms...  │
│                                                             │
│ 📊 ChatGPT  📅 2 days ago  👁️ 5 views  🎯 95% similarity  │
│                                                             │
│ [View] [Edit] [Find Similar] [⋮ More]                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Search Experience Flow

1. **Initial State** - Empty search with suggestions
2. **Typing** - Real-time suggestions and autocomplete
3. **Search Types** - Easy toggle between text/vector/hybrid
4. **Results** - Cards with previews and metadata
5. **Refinement** - Filters and sorting options
6. **Deep Dive** - Similar content and related entries

## 📊 Success Metrics to Display

- **Search Relevance** - Show confidence scores
- **Content Growth** - Entries added over time
- **AI Utilization** - Percentage using vector search
- **User Engagement** - Time spent, searches per session
- **Content Insights** - Most popular topics and tags

## 🎯 Call-to-Action for Bolt.new

Create a **modern, intelligent, and beautiful** frontend that:

1. **Showcases AI Power** - Make the semantic search capabilities obvious and impressive
2. **Feels Fast & Responsive** - Smooth interactions and quick feedback
3. **Handles Complexity Gracefully** - Advanced features don't overwhelm basic users
4. **Looks Professional** - Suitable for both personal and business use
5. **Demonstrates Value** - Users immediately understand why this is better than basic search

**Focus on the search experience** - this is the core differentiator. Make searching feel magical with AI-powered semantic understanding, visual similarity indicators, and intelligent suggestions.

The backend is production-ready. Your frontend should match that quality and showcase the full potential of intelligent content management with AI-powered search capabilities. 
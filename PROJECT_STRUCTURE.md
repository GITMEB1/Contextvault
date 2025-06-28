# ContextVault Project Structure

This document outlines the organized structure of the ContextVault project, which has been cleanly separated into frontend and backend components.

## 📁 Project Organization

```
ContextVAULT/
├── 📁 backend/                     # Backend API (Node.js/Express)
│   ├── package.json               # Backend dependencies and scripts
│   ├── server.js                  # Main server entry point
│   ├── server-simple.js           # Simplified server for testing
│   ├── config.env.example         # Environment configuration template
│   ├── Dockerfile                 # Docker configuration for backend
│   ├── 📁 routes/                 # API route handlers
│   ├── 📁 models/                 # Database models
│   ├── 📁 middleware/             # Express middleware
│   ├── 📁 services/               # Business logic services
│   ├── 📁 utils/                  # Backend utilities
│   └── 📁 config/                 # Configuration files
│
├── 📁 frontend/                    # Frontend React App (TypeScript)
│   ├── package.json               # Frontend dependencies and scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite build configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── index.html                 # Main HTML template
│   └── 📁 src/                    # React source code
│       ├── 📁 components/         # React components
│       ├── 📁 pages/              # Page components
│       ├── 📁 store/              # State management
│       ├── 📁 services/           # API services
│       └── 📁 utils/              # Frontend utilities
│
├── docker-compose.yml             # Docker orchestration
├── .gitignore                     # Git ignore rules
└── [documentation files]         # Project documentation
```

## 🚀 Development Workflow

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start development server
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev         # Start Vite development server
```

### Full Stack Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🔧 Configuration

### Backend Configuration
- Environment variables: `backend/config.env.example`
- Application config: `backend/config/config.js`
- Docker config: `backend/Dockerfile`

### Frontend Configuration
- TypeScript: `frontend/tsconfig.json`
- Vite: `frontend/vite.config.ts`
- Tailwind CSS: `frontend/tailwind.config.js`
- Environment variables: `frontend/.env` (create as needed)

## 📡 API Endpoints

The backend API runs on `http://localhost:8000` and provides:

- **Authentication**: `/v1/auth/*`
- **Entries**: `/v1/entries/*`
- **Search**: `/v1/search/*`
- **Users**: `/v1/users/*`
- **Health**: `/v1/health`

## 🎨 Frontend Features

The frontend React app runs on `http://localhost:3000` and includes:

- **Authentication**: Login/Register with JWT
- **Dashboard**: Overview and statistics
- **Search**: AI-powered semantic search
- **Entries**: CRUD operations for conversational data
- **Profile**: User settings and preferences

## 🔄 Data Flow

1. **Frontend** (React) makes API calls to **Backend** (Express)
2. **Backend** processes requests and interacts with **MongoDB**
3. **Vector Search** uses **OpenAI embeddings** for semantic search
4. **Redis** caches frequently accessed data
5. **Authentication** uses JWT tokens for session management

## 📝 Notes

- Backend uses JavaScript (Node.js/Express)
- Frontend uses TypeScript (React/Vite)
- Clear separation of concerns between client and server
- Each component has its own package.json and dependencies
- Docker configuration supports full-stack development
- Comprehensive documentation for easy onboarding 
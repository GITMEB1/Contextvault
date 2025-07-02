# ContextVault Project Structure

This document outlines the structure of the ContextVault application after cleanup and optimization for deployment.

## Root Directory
```
ContextVAULT/
├── backend/                 # Node.js Express API
├── frontend/                # React + TypeScript + Vite frontend
├── docs/                    # Documentation files
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Multi-service development setup
├── vercel.json             # Vercel deployment configuration
├── README.md               # Main project documentation
└── PROJECT_STRUCTURE.md    # This file
```

## Backend Structure (`/backend/`)
```
backend/
├── config/
│   ├── config.js           # Application configuration
│   └── config.env.example  # Environment variables template
├── middleware/             # Express middleware
├── models/                 # MongoDB/Mongoose models
├── routes/                 # API route handlers
├── services/               # Business logic services
├── tests/                  # Test files
├── utils/                  # Utility functions
├── Dockerfile              # Backend containerization
├── package.json            # Backend dependencies
└── server.js              # Main server entry point
```

## Frontend Structure (`/frontend/`)
```
frontend/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   └── ui/            # UI components (Button, Input, etc.)
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── store/             # State management (Zustand)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Frontend utilities
├── public/                # Static assets
├── Dockerfile             # Frontend containerization (with Nginx)
├── nginx.conf             # Nginx configuration for production
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── .env.example           # Environment variables template
```

## Key Changes Made for Deployment Readiness

### 1. Cleaned Up Root Directory
- Removed duplicate `package.json` files
- Removed conflicting configuration files
- Separated frontend and backend concerns clearly

### 2. Enhanced Frontend Build Process
- Updated Vite configuration with production optimizations
- Implemented multi-stage Docker build with Nginx
- Added proper chunk splitting for better performance
- Created Nginx configuration for SPA routing

### 3. Deployment Configuration
- Added `vercel.json` for Vercel deployment
- Created environment variable templates
- Optimized Docker configurations for production

### 4. Development vs Production
- Backend: Use `npm run dev` for development, `npm start` for production
- Frontend: Use `npm run dev` for development, `npm run build` for production builds
- Docker: Use `docker-compose up` for full-stack development environment

## Deployment Instructions

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend/`
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Backend (Railway/Heroku/DigitalOcean)
1. Use the `backend/` directory as deployment source
2. Set required environment variables
3. Ensure MongoDB connection string is configured
4. Deploy using platform-specific methods

### Full Stack (Docker)
```bash
# For development
docker-compose up

# For production deployment
docker-compose -f docker-compose.prod.yml up
```

## Environment Variables

### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API base URL

### Backend (.env)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `CORS_ORIGIN`: Frontend URL for CORS
- See `backend/config.env.example` for complete list

## Development Workflow

1. **Setup**:
   ```bash
   # Backend
   cd backend && npm install
   cp config.env.example .env
   
   # Frontend
   cd frontend && npm install
   cp .env.example .env
   ```

2. **Development**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

3. **Production Build**:
   ```bash
   # Frontend
   cd frontend && npm run build
   
   # Backend
   cd backend && npm start
   ```

## Architecture Overview

- **Frontend**: React SPA with TypeScript, served via Nginx in production
- **Backend**: Node.js Express API with MongoDB
- **Database**: MongoDB with Redis for caching
- **Deployment**: Frontend on Vercel, Backend on Railway/Heroku
- **Development**: Docker Compose for full local environment 
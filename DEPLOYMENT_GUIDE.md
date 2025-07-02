# 🚀 ContextVault Deployment Guide

This guide covers deploying ContextVault with frontend on Vercel and backend on Railway.

## 🏗️ Architecture Overview

```
Frontend (Vercel)     Backend (Railway)     Database (MongoDB Atlas)
React + TypeScript ──► Node.js Express ──► MongoDB + Redis
HTTPS Served         ┃   REST API         ┃   Vector Search
Auto-deploy         ┃   Health Checks    ┃   User Data
```

## 📋 Prerequisites

- [x] GitHub account with ContextVault repository
- [x] Vercel account (free tier works)
- [x] Railway account (free tier works)
- [x] MongoDB Atlas account (free tier works)

## 🚂 Backend Deployment (Railway)

### 1. Setup Railway Project

1. **Visit [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Select** `GITMEB1/Contextvault` repository
5. **Set root directory** to `backend/`

### 2. Configure Environment Variables

In Railway dashboard → Your Project → Variables:

```env
# Required Variables
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contextvault
JWT_SECRET=5ab1aa4696460191cceb1be638aff8efe1d081c9e367a17fda001448062b540e87101c432220b053bb559b1bc0a5ec70e
CORS_ORIGIN=https://your-frontend.vercel.app

# Optional but Recommended
ENABLE_SWAGGER=true
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
OPENAI_API_KEY=your-openai-key-optional
```

### 3. MongoDB Atlas Setup

1. **Create MongoDB Atlas account**
2. **Create free cluster**
3. **Database Access**: Create user with read/write permissions
4. **Network Access**: Allow access from anywhere (0.0.0.0/0)
5. **Get connection string**: Replace `<password>` with your password
6. **Add to Railway**: Set `MONGODB_URI` variable

### 4. Deploy & Verify

- **Railway auto-deploys** on GitHub push
- **Check logs** in Railway dashboard
- **Get your URL**: `https://your-app.up.railway.app`
- **Test**: Visit `https://your-app.up.railway.app/v1/health`

## 🌐 Frontend Deployment (Vercel)

### 1. Setup Vercel Project

1. **Visit [vercel.com](https://vercel.com)**
2. **Import Git Repository** → Select your ContextVault repo
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/v1
```

### 3. Deploy & Configure

- **Vercel auto-deploys** on GitHub push
- **Get your URL**: `https://your-app.vercel.app`
- **Update Railway CORS**: Set `CORS_ORIGIN` to your Vercel URL

## 🔧 Final Configuration

### Update CORS Origin in Railway

Once you have your Vercel URL, update Railway environment variables:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

### Test Full Stack

1. **Visit your Vercel frontend**
2. **Check browser console** for any CORS errors
3. **Test authentication** (register/login)
4. **Test API calls** (create entries, search)

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Ensure no trailing slashes

**2. Database Connection**
- Verify MongoDB Atlas connection string
- Check network access settings (allow 0.0.0.0/0)
- Ensure database user has correct permissions

**3. Environment Variables**
- Check all required variables are set in both platforms
- JWT_SECRET must be the same across deployments
- API URL in frontend must match Railway backend URL

**4. Build Failures**
- Check Railway build logs
- Ensure Node.js version compatibility (18+)
- Verify all dependencies are in package.json

### Health Check URLs

- **Backend Health**: `https://your-railway-app.up.railway.app/v1/health`
- **Backend API Docs**: `https://your-railway-app.up.railway.app/api-docs`
- **Frontend**: `https://your-vercel-app.vercel.app`

## 📊 Monitoring

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Application logs and errors
- **Deployments**: Build history and status

### Vercel Dashboard
- **Analytics**: Page views and performance
- **Functions**: Serverless function metrics
- **Deployments**: Build history and previews

## 🔄 Continuous Deployment

Both platforms auto-deploy on:
- **Push to main branch**
- **Pull request merges**
- **Manual triggers** from dashboard

## 💰 Cost Considerations

### Free Tier Limits
- **Railway**: 500 hours/month, $5 credit
- **Vercel**: 100 deployments/month, 100GB bandwidth
- **MongoDB Atlas**: 512MB storage, 3 projects

### Scaling
- Both platforms offer seamless paid upgrades
- Railway scales based on usage
- Vercel offers team features and more bandwidth

## 🔐 Security Checklist

- [x] Strong JWT secrets (64+ character random string)
- [x] HTTPS enforced on both platforms
- [x] CORS properly configured
- [x] Environment variables secured
- [x] Database access restricted
- [x] Rate limiting enabled
- [x] Input validation in place

## 📝 Maintenance

### Regular Tasks
- **Monitor logs** for errors
- **Update dependencies** monthly
- **Backup database** (Atlas handles this)
- **Review security** settings quarterly

### Updates
- **Push to GitHub** triggers automatic deployments
- **Test in development** before pushing to main
- **Use pull requests** for feature branches 
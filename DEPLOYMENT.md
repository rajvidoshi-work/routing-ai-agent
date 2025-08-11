# 🚀 Deployment Guide - Routing AI Agent

This guide will help you deploy the Routing AI Agent application to production using Netlify (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub account
- Netlify account
- Railway account (or Render/Vercel for backend)
- Environment variables ready

## 🏗️ Architecture

- **Frontend**: React app deployed on Netlify
- **Backend**: FastAPI app deployed on Railway
- **Database**: File-based (Excel/CSV) data storage

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Connect GitHub**: Link your GitHub repository
3. **Create New Project**: 
   - Select "Deploy from GitHub repo"
   - Choose your `routing-ai-agent` repository
4. **Configure Build**:
   - Railway will auto-detect the `railway.toml` configuration
   - Or manually set build command: `pip install -r requirements.txt`
   - Set start command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Set Environment Variables**:
   ```
   PYTHONPATH=/app
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key
   ```
6. **Deploy**: Railway will automatically deploy your backend
7. **Get Backend URL**: Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Netlify

1. **Create Netlify Account**: Go to [netlify.com](https://netlify.com) and sign up
2. **Connect GitHub**: Link your GitHub repository
3. **Create New Site**:
   - Select "Import an existing project"
   - Choose your `routing-ai-agent` repository
4. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Base directory: `frontend`
5. **Set Environment Variables** in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app/api
   GENERATE_SOURCEMAP=false
   ```
6. **Deploy**: Netlify will build and deploy your frontend
7. **Custom Domain** (optional): Configure your custom domain in Netlify settings

### Step 3: Update CORS Settings

After deployment, update the backend CORS settings in `app/main.py`:

```python
allow_origins=[
    "http://localhost:3003",  # Development
    "https://your-netlify-site.netlify.app",  # Your Netlify URL
    "https://your-custom-domain.com",  # Your custom domain (if any)
],
```

## 🔧 Configuration Files

### netlify.toml
```toml
[build]
  base = "frontend/"
  publish = "frontend/build/"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### railway.toml
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile.backend"

[deploy]
startCommand = "python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

## 🌍 Environment Variables

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.com/api
GENERATE_SOURCEMAP=false
REACT_APP_ENV=production
```

### Backend
```
PYTHONPATH=/app
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key
PORT=8000
```

## 🧪 Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.com/health`
2. **Frontend**: Visit your Netlify URL
3. **API Integration**: Test login and patient data loading
4. **CORS**: Ensure frontend can communicate with backend

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Update `allow_origins` in backend CORS settings
   - Ensure frontend URL is included

2. **Build Failures**:
   - Check Node.js version (use Node 18)
   - Verify all dependencies are installed
   - Check build logs for specific errors

3. **API Connection Issues**:
   - Verify `REACT_APP_API_URL` environment variable
   - Check backend health endpoint
   - Ensure backend is deployed and running

4. **Environment Variables**:
   - Double-check all required variables are set
   - Restart deployments after changing variables

## 📊 Monitoring

- **Netlify**: Check build logs and deploy status
- **Railway**: Monitor application logs and metrics
- **Health Checks**: Set up monitoring for `/health` endpoint

## 🔄 Updates

To update the application:

1. **Push to GitHub**: Commit and push changes
2. **Auto-Deploy**: Both Netlify and Railway will auto-deploy
3. **Manual Deploy**: Trigger manual deploys if needed

## 🆘 Support

If you encounter issues:

1. Check deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-app.railway.app`

The application will have the same functionality as your local development environment, but accessible from anywhere on the internet!

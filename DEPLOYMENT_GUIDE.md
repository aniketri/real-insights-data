# 🚀 Deployment Guide - Real Insights Data Platform

This guide walks you through deploying your Real Insights platform using CI/CD with Vercel (frontend) and Render (backend).

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **MongoDB Atlas**: Set up a production database at [mongodb.com](https://cloud.mongodb.com)

## 🎯 Deployment Architecture

```
GitHub Repository
├── Frontend (Next.js) → Vercel
├── Backend (NestJS) → Render
└── Database → MongoDB Atlas
```

## 🔧 Step 1: Database Setup (MongoDB Atlas)

1. Create a new cluster on MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist IP addresses (0.0.0.0/0 for production or specific IPs)
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

## 🌐 Step 2: Backend Deployment (Render)

### 2.1 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `real-insights-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd apps/api && npm install && npm run build`
   - **Start Command**: `cd apps/api && npm run start:prod`

### 2.2 Set Environment Variables

Add these environment variables in Render:

```bash
NODE_ENV=production
DATABASE_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_oauth_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_oauth_client_secret
RESEND_API_KEY=your_resend_api_key
PORT=3001
```

### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for the build to complete
3. Note your API URL (e.g., `https://your-api.onrender.com`)

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Create Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave as `./` (monorepo setup)
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install`

### 3.2 Set Environment Variables

Add these environment variables in Vercel:

```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key
DATABASE_URL=your_mongodb_atlas_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_oauth_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_oauth_client_secret
RESEND_API_KEY=your_resend_api_key
API_URL=https://your-api.onrender.com
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

### 3.3 Update Configuration Files

Update the URLs in your configuration files:

1. **vercel.json**: Replace `your-app.vercel.app` and `your-api.onrender.com` with actual URLs
2. **OAuth Providers**: Update redirect URIs in Google and Microsoft OAuth apps

### 3.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-app.vercel.app`

## 🔄 Step 4: GitHub Actions Setup

### 4.1 Add Repository Secrets

Go to GitHub Repository → Settings → Secrets and Variables → Actions, and add:

```bash
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Render
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id
```

### 4.2 Get Required Tokens

**Vercel Tokens:**
1. Go to Vercel → Settings → Tokens → Create Token
2. Get Org ID: Vercel → Settings → General → Organization ID
3. Get Project ID: Your Project → Settings → General → Project ID

**Render Tokens:**
1. Go to Render → Account Settings → API Keys → Create API Key
2. Get Service ID from your service URL or dashboard

## 🎯 Step 5: OAuth Configuration

Update your OAuth redirect URIs:

### Google OAuth
- Add: `https://your-app.vercel.app/api/auth/callback/google`

### Microsoft OAuth
- Add: `https://your-app.vercel.app/api/auth/callback/azure-ad`

## 🚀 Step 6: Deploy!

1. Push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Run tests and linting
   - Deploy frontend to Vercel
   - Deploy backend to Render
3. Monitor the deployment in GitHub Actions tab

## 🔍 Step 7: Testing

1. Visit your frontend URL
2. Test user registration and login
3. Verify API endpoints are working
4. Check database connections
5. Test OAuth providers

## 📊 Monitoring & Maintenance

### Performance Monitoring
- Use Vercel Analytics for frontend
- Use Render logs for backend monitoring
- Set up MongoDB Atlas monitoring

### Environment Management
- Development: Local environment
- Staging: Create separate Vercel preview deployments
- Production: Main branch deployments

### Database Management
- Regular backups on MongoDB Atlas
- Monitor database performance
- Set up alerts for high usage

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required vars are set
3. **CORS Issues**: Verify API URL configuration
4. **OAuth Errors**: Check redirect URI configuration
5. **Database Connection**: Verify MongoDB Atlas connection string

### Useful Commands

```bash
# Local development
pnpm dev

# Build locally to test
pnpm build

# Check logs
# Vercel: Dashboard → Functions → View Logs
# Render: Dashboard → Service → Logs
```

## 🎉 Success!

Your Real Insights platform is now deployed with:
- ✅ Automated CI/CD pipeline
- ✅ Frontend on Vercel
- ✅ Backend on Render
- ✅ Database on MongoDB Atlas
- ✅ OAuth authentication
- ✅ Environment management

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Vercel/Render deployment logs
3. Verify environment variables
4. Test API endpoints manually 
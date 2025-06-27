# Real Insights - Development Setup Guide

This guide will help you set up Real Insights for local development.

## Prerequisites

### Required Software
- **Node.js** (version 18 or higher)
- **pnpm** (version 9.6.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Install Prerequisites

```bash
# Install Node.js (using nvm - recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm@9.6.0

# Verify installations
node --version  # Should be 18.x
pnpm --version  # Should be 9.6.0
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/real-insights-data.git
cd real-insights-data

# Install all dependencies (this may take a few minutes)
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy example environment variables
cp .env.example .env  # If it exists, or create manually
```

**Required Environment Variables** (`.env`):

```env
# Database
DATABASE_URL="mongodb://localhost:27017/real-insights-dev"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-development-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft OAuth (optional)
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="common"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# API Configuration
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Development
NODE_ENV="development"
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally (macOS)
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Create development database
mongosh
> use real-insights-dev
> db.createCollection("users")
> exit
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get connection string and update `DATABASE_URL` in `.env`

### 4. Generate Prisma Client

```bash
# Generate Prisma client and push schema to database
pnpm db:generate
pnpm db:push
```

### 5. Start Development Servers

#### Start Both Frontend and Backend (Recommended)
```bash
# This starts both apps concurrently
pnpm dev
```

This will start:
- **Frontend (Next.js)**: http://localhost:3000
- **Backend (NestJS)**: http://localhost:3001

#### Or Start Individually

**Frontend Only:**
```bash
cd apps/web
pnpm dev
```

**Backend Only:**
```bash
cd apps/api
pnpm dev
```

## 🛠️ Development Workflow

### Available Scripts

**Root Level Commands:**
```bash
# Development
pnpm dev              # Start both frontend and backend
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm test             # Run tests

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Prisma Studio (database GUI)

# Individual Apps
pnpm build:web        # Build frontend only
pnpm build:api        # Build backend only
```

### Project Structure
```
real-insights-data/
├── apps/
│   ├── web/          # Next.js Frontend (localhost:3000)
│   └── api/          # NestJS Backend (localhost:3001)
├── packages/
│   └── db/           # Shared Prisma database package
├── .env              # Environment variables
└── pnpm-workspace.yaml
```

## 🔧 Development Features

### Database Management
```bash
# View/edit database with Prisma Studio
pnpm db:studio
# Opens at: http://localhost:5555
```

### Hot Reload
- **Frontend**: Automatic reload on file changes
- **Backend**: Automatic restart on file changes
- **Database**: Schema changes require `pnpm db:push`

### API Testing
- **Backend Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api (if Swagger enabled)

## 🔑 Authentication Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Microsoft OAuth Setup (Optional)
Follow the detailed guide in `MICROSOFT_OAUTH_SETUP.md`

## 🐛 Troubleshooting

### Common Issues

**"Prisma Client not found"**
```bash
pnpm db:generate
```

**"MongoDB connection failed"**
- Check if MongoDB is running: `brew services list | grep mongodb`
- Verify `DATABASE_URL` in `.env`

**"Module not found" errors**
```bash
# Clean install
rm -rf node_modules
pnpm install
```

**Port already in use**
```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Development Tips

1. **Use Prisma Studio** for database management
2. **Check browser console** for frontend errors
3. **Check terminal logs** for backend errors
4. **Use environment variables** for configuration
5. **Run linting** before committing: `pnpm lint`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

## 🚀 Ready to Code!

Your development environment should now be running:
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend**: http://localhost:3001  
- 🗃️ **Database**: Prisma Studio at http://localhost:5555

Happy coding! 🎉 
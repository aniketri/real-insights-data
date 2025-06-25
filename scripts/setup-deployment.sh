#!/bin/bash

# Real Insights - Deployment Setup Script
# This script prepares your project for deployment

set -e

echo "🚀 Setting up Real Insights for deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm@9.6.0"
    exit 1
fi

print_status "pnpm is installed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Build all packages
echo "🏗️ Building all packages..."
pnpm build

print_status "Project built successfully!"

# Check for environment files
echo "🔍 Checking environment configuration..."

if [ ! -f ".env" ]; then
    print_warning "No .env file found. You'll need to create one for local development."
    echo "See DEPLOYMENT_GUIDE.md for required environment variables."
fi

if [ ! -f "apps/web/.env.local" ]; then
    print_warning "No apps/web/.env.local file found."
fi

if [ ! -f "apps/api/.env" ]; then
    print_warning "No apps/api/.env file found."
fi

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. 📖 Read DEPLOYMENT_GUIDE.md for detailed deployment instructions"
echo "2. 🔐 Set up your environment variables"
echo "3. 🗄️ Configure MongoDB Atlas database"
echo "4. 🌐 Deploy to Vercel and Render"
echo "5. 🔧 Set up GitHub Actions secrets"
echo ""
echo "For questions, check the troubleshooting section in DEPLOYMENT_GUIDE.md" 
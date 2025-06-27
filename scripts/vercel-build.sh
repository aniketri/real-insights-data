#!/bin/bash
set -e

echo "🔧 Starting Vercel build process..."

# Install all dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🗃️ Generating Prisma client..."
cd packages/db
pnpm exec prisma generate --schema=schema.prisma
cd ../..

# Build the web app
echo "🏗️ Building web app..."
cd apps/web
pnpm run build

echo "✅ Build completed successfully!" 
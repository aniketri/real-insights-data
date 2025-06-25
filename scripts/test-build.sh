#!/bin/bash

echo "🧪 Testing build order locally..."

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf packages/db/dist
rm -rf apps/api/dist
rm -rf apps/web/.next

# Test the build sequence
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔧 Generating Prisma client..."
pnpm db:generate

echo "🏗️ Building db package..."
pnpm --filter @repo/db build

echo "🏗️ Building API..."
pnpm --filter api build

echo "🏗️ Building web..."
pnpm --filter web build

echo "✅ All builds successful! Ready for deployment." 
#!/bin/bash

set -e

echo "🔧 Testing Vercel build process locally..."

# Navigate to root
cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile --no-optional

echo "🗃️ Generating Prisma client..."
cd packages/db
pnpm exec prisma generate --schema=schema.prisma

echo "🏗️ Building web app..."
cd ../../apps/web
pnpm build

echo "✅ Build completed successfully!"
echo ""
echo "🚀 Your app is ready for Vercel deployment!" 
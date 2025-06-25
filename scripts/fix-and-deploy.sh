#!/bin/bash

# Fix and Deploy Script
echo "🔧 Committing GitHub Actions fixes..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Update GitHub Actions workflows to use pnpm instead of npm

- Fix CI workflow to use pnpm cache instead of npm cache
- Update deployment workflow with proper pnpm setup
- Fix Vercel and Render configurations for pnpm monorepo
- Resolves 'Dependencies lock file not found' error in GitHub Actions"

# Push to trigger deployment
echo "🚀 Pushing to GitHub to trigger deployment..."
git push origin main

echo "✅ Done! Check GitHub Actions for deployment status."
echo "🔗 Monitor at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions" 
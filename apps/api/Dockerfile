# syntax=docker/dockerfile:1

# Base stage
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm@9.6.0

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS build
COPY . .
RUN pnpm db:generate
RUN pnpm --filter api build

# Production stage
FROM node:18-alpine AS production
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@9.6.0

# Copy production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generate client
COPY packages/db/schema.prisma ./packages/db/
RUN pnpm db:generate

# Copy built application
COPY --from=build /usr/src/app/apps/api/dist ./apps/api/dist

# Set environment
ENV NODE_ENV=production
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "apps/api/dist/main"] 
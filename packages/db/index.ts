import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Simple Prisma client configuration for serverless
const createPrismaClient = () => {
  // Skip Prisma client creation during build time if DATABASE_URL is not available
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ DATABASE_URL not found, creating minimal Prisma client for build');
    return new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });
};

// Use global variable in development to prevent multiple instances
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Add utility methods
prisma.healthCheck = async function() {
  try {
    await this.organization.findFirst({ take: 1 });
    return { status: 'healthy', connected: true };
  } catch (error: any) {
    return { status: 'unhealthy', error: error?.message || 'Unknown error', connected: false };
  }
};

export default prisma;
export * from '@prisma/client';
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

// Add utility methods with better error handling
prisma.healthCheck = async function() {
  try {
    // Use a simple query with timeout for serverless
    const result = await Promise.race([
      this.organization.findFirst({ take: 1 }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout after 5s')), 5000)
      )
    ]);
    return { status: 'healthy', connected: true };
  } catch (error: any) {
    console.error('Health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error?.message || 'Unknown error', 
      connected: false,
      details: {
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    };
  }
};

export default prisma;
export * from '@prisma/client';
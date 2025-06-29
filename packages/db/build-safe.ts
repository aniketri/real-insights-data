import { PrismaClient } from '@prisma/client';

/**
 * Build-Safe Prisma Client
 * 
 * This client is safe to import during Next.js build time.
 * It only creates a real connection when actually used at runtime.
 */

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (isBuildTime) {
    // Return a mock client during build time
    console.warn('⚠️ Using mock Prisma client during build');
    return {} as PrismaClient;
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  return prismaInstance;
}

// Create a proxy that lazy-loads the client
const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    
    if (isBuildTime) {
      // Return empty functions during build
      return () => Promise.resolve({});
    }
    
    return client[prop as keyof PrismaClient];
  }
});

export default db; 
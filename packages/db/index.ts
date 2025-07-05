// @ts-ignore - Prisma client import issue
import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Simple Prisma client configuration for serverless
const createPrismaClient = () => {
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

export default prisma;
export * from '@prisma/client';
import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Enhanced Prisma client configuration for production performance
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
    // Enable query logging in development
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    
    // Configure connection pooling and timeouts
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Error formatting for better debugging
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });
};

// Use global variable in development to prevent multiple instances
// In production, create a new instance each time
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connection management
let isConnected = false;

const connectWithRetry = async () => {
  if (isConnected) return;
  
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log('✅ Database connected successfully');
      break;
    } catch (error) {
      retries++;
      console.error(`❌ Database connection attempt ${retries} failed:`, error);
      
      if (retries === maxRetries) {
        console.error('❌ Max database connection retries reached');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }
};

// Graceful disconnect
const disconnect = async () => {
  if (isConnected) {
    await prisma.$disconnect();
    isConnected = false;
    console.log('🔌 Database disconnected');
  }
};

// Handle process termination
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);
process.on('beforeExit', disconnect);

// Connect on module load only if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  connectWithRetry().catch(console.error);
} else if (process.env.NODE_ENV !== 'development') {
  console.warn('⚠️ Skipping database connection during build (DATABASE_URL not available)');
}

// Enhanced Prisma client with additional utilities
const enhancedPrisma = Object.assign(prisma, {
  // Utility methods for better performance
  async healthCheck() {
    try {
      // Use a simple query that works with MongoDB
      await prisma.organization.findFirst({ take: 1 });
      return { status: 'healthy', connected: isConnected };
    } catch (error: any) {
      return { status: 'unhealthy', error: error?.message || 'Unknown error', connected: false };
    }
  },
  
  // Batch operations helper
  async batchTransaction<T>(operations: Array<(prisma: any) => Promise<T>>): Promise<T[]> {
    return prisma.$transaction(async (tx: any) => {
      const results: T[] = [];
      for (const operation of operations) {
        results.push(await operation(tx));
      }
      return results;
    });
  },
  
  // Connection status
  get isConnected() {
    return isConnected;
  },
  
  // Force reconnect
  async reconnect() {
    isConnected = false;
    return connectWithRetry();
  }
});

export default enhancedPrisma;
export * from '@prisma/client';
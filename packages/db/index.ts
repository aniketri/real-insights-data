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
    
    // Configure connection pooling and timeouts for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Error formatting for better debugging
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    
    // Add transaction timeout settings for serverless
    transactionOptions: {
      timeout: 10000, // 10 seconds timeout for transactions
    },
  });
};

// Use global variable in development to prevent multiple instances
// In production, create a new instance each time
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connection management with shorter timeouts for serverless
let isConnected = false;

const connectWithRetry = async () => {
  if (isConnected) return;
  
  const maxRetries = 3; // Reduced retries for serverless
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Set shorter connection timeout for serverless
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
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
      
      // Shorter wait for serverless (1-2 seconds max)
      await new Promise(resolve => setTimeout(resolve, Math.min(2000, Math.pow(2, retries) * 500)));
    }
  }
};

// Graceful disconnect with timeout
const disconnect = async () => {
  if (isConnected) {
    try {
      await Promise.race([
        prisma.$disconnect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Disconnect timeout')), 3000)
        )
      ]);
      isConnected = false;
      console.log('🔌 Database disconnected');
    } catch (error) {
      console.error('❌ Database disconnect error:', error);
      isConnected = false; // Force reset connection state
    }
  }
};

// Handle process termination
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);
process.on('beforeExit', disconnect);

// Don't auto-connect in serverless environments - connect on demand
if (process.env.DATABASE_URL && process.env.NODE_ENV === 'development') {
  connectWithRetry().catch(console.error);
} else if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
  console.warn('⚠️ Skipping database connection during build (DATABASE_URL not available)');
}

// Enhanced Prisma client with additional utilities
const enhancedPrisma = Object.assign(prisma, {
  // Utility methods for better performance
  async healthCheck() {
    try {
      // Use a simple query with timeout
      const result = await Promise.race([
        prisma.organization.findFirst({ take: 1 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 3000)
        )
      ]);
      return { status: 'healthy', connected: isConnected };
    } catch (error: any) {
      return { status: 'unhealthy', error: error?.message || 'Unknown error', connected: false };
    }
  },
  
  // Batch operations helper with timeout
  async batchTransaction<T>(operations: Array<(prisma: any) => Promise<T>>): Promise<T[]> {
    return Promise.race([
      prisma.$transaction(async (tx: any) => {
        const results: T[] = [];
        for (const operation of operations) {
          results.push(await operation(tx));
        }
        return results;
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 8000)
      )
    ]);
  },
  
  // Connection status
  get isConnected() {
    return isConnected;
  },
  
  // Force reconnect with timeout
  async reconnect() {
    isConnected = false;
    return connectWithRetry();
  }
});

export default enhancedPrisma;
export * from '@prisma/client';
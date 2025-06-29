/**
 * Instrumentation file for Vercel deployment
 * This ensures Prisma engines are properly loaded
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 Initializing Prisma for Vercel...');
    
    try {
      // Import and initialize Prisma client to ensure engines are loaded
      const prismaModule = await import('@prisma/client');
      const PrismaClient = prismaModule.PrismaClient;
      
      const prisma = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      
      // Test connection
      await prisma.$connect();
      console.log('✅ Prisma initialized successfully');
      await prisma.$disconnect();
      
    } catch (error) {
      console.error('❌ Prisma initialization failed:', error);
    }
  }
} 
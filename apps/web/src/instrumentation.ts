/**
 * Instrumentation file for Vercel deployment
 * Disabled to prevent build issues
 */

export async function register() {
  // Disabled during all phases to prevent build issues
  // Prisma setup is handled by packages/db
  console.log('⏭️ Instrumentation disabled - using packages/db setup');
} 
import { NextResponse } from 'next/server';

/**
 * Check if database is available for API operations
 * Returns an error response if not available (during build time)
 */
export function checkDatabaseAvailable() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { 
        message: 'Service temporarily unavailable during deployment',
        error: 'DATABASE_NOT_AVAILABLE' 
      }, 
      { status: 503 }
    );
  }
  return null;
}

/**
 * Wrapper for API routes that require database access
 */
export function withDatabase<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const dbCheck = checkDatabaseAvailable();
    if (dbCheck) return dbCheck;
    
    return handler(...args);
  };
} 
import { NextResponse } from 'next/server';
import db from '@repo/db';

/**
 * Database Connection Test Endpoint
 * 
 * Use this to verify that your database connection is working from Vercel.
 * Visit: https://your-app.vercel.app/api/test-db
 */
export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const userCount = await db.user.count();
    const orgCount = await db.organization.count();
    
    console.log('✅ Database connection successful');
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection working perfectly!',
      data: {
        userCount,
        organizationCount: orgCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
    
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import prisma from '../../../../packages/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL format:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Using the enhanced prisma client from packages/db
    console.log('Using enhanced Prisma client...');

    // Test 1: Simple connection test
    console.log('Step 1: Testing $connect()...');
    const connectStart = Date.now();
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connect timeout after 10s')), 10000)
      )
    ]);
    const connectTime = Date.now() - connectStart;
    console.log(`✅ Connected in ${connectTime}ms`);

    // Test 2: Health check test
    console.log('Step 2: Testing health check...');
    const healthStart = Date.now();
    const healthResult = await Promise.race([
      prisma.healthCheck(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout after 5s')), 5000)
      )
    ]);
    const healthTime = Date.now() - healthStart;
    console.log(`✅ Health check completed in ${healthTime}ms:`, healthResult);

    // Test 3: Organization table test
    console.log('Step 3: Testing organization table...');
    const orgStart = Date.now();
    const orgCount = await Promise.race([
      prisma.organization.count(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Organization query timeout after 5s')), 5000)
      )
    ]);
    const orgTime = Date.now() - orgStart;
    console.log(`✅ Organization count query completed in ${orgTime}ms`);

    await prisma.$disconnect();

    return NextResponse.json({
      status: 'success',
      tests: {
        connection: { time: connectTime, status: 'passed' },
        healthCheck: { time: healthTime, result: healthResult, status: 'passed' },
        organizationQuery: { time: orgTime, count: orgCount, status: 'passed' }
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import prisma from '../../../../packages/db';

/**
 * Comprehensive Health Check Endpoint
 * 
 * Checks database connectivity, email service, and system status
 * to help diagnose authentication and OTP delivery issues
 */
export async function GET() {
  const healthStatus = {
    status: 'ok' as 'ok' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    services: {
      database: { status: 'unknown', message: '', connected: false } as any,
      email: { status: 'unknown', message: '' } as any,
      system: { status: 'ok', message: 'System operational' }
    }
  };

  // Check database connectivity
  try {
    const result = await prisma.organization.findFirst({ take: 1 });
    healthStatus.services.database = {
      status: 'healthy',
      message: 'Database connected successfully',
      connected: true
    };
  } catch (error: any) {
    healthStatus.services.database = {
      status: 'unhealthy',
      message: `Database error: ${error.message}`,
      connected: false
    };
    healthStatus.status = 'degraded';
  }

  // Check email service configuration
  try {
    const emailConfigured = !!(
      process.env.RESEND_API_KEY && 
      process.env.FROM_EMAIL
    );
    
    healthStatus.services.email = {
      status: emailConfigured ? 'configured' : 'misconfigured',
      message: emailConfigured 
        ? 'Email service configured' 
        : 'Missing RESEND_API_KEY or FROM_EMAIL environment variables',
      resendApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: !!process.env.FROM_EMAIL
    };

    if (!emailConfigured) {
      healthStatus.status = 'degraded';
    }
  } catch (error: any) {
    healthStatus.services.email = {
      status: 'error',
      message: `Email service check failed: ${error.message}`
    };
    healthStatus.status = 'degraded';
  }

  // Check environment variables critical for auth
  const criticalEnvVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    FROM_EMAIL: !!process.env.FROM_EMAIL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  };

  const missingEnvVars = Object.entries(criticalEnvVars)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name);

  if (missingEnvVars.length > 0) {
    healthStatus.status = 'degraded';
    healthStatus.services.system = {
      status: 'misconfigured',
      message: `Missing environment variables: ${missingEnvVars.join(', ')}`
    };
  }

  // Return appropriate HTTP status based on health
  const httpStatus = healthStatus.status === 'ok' ? 200 : 
                    healthStatus.status === 'degraded' ? 503 : 500;

  return NextResponse.json(healthStatus, { status: httpStatus });
} 
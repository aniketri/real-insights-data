import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../packages/db';
import bcrypt from 'bcryptjs';
import { resend } from '../../../lib/mailer';
import { OtpEmail } from '../../../components/emails/otp-email';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const testResults = {
    steps: [] as Array<{step: string, duration: number, status: 'success' | 'error', details?: any}>,
    totalDuration: 0,
    success: false
  };

  try {
    const { email } = await req.json();
    const testEmail = email || 'test@example.com';
    const testPassword = 'TestPassword123!';

    // Step 1: Database connection test
    let stepStart = Date.now();
    try {
      const health = await prisma.healthCheck();
      testResults.steps.push({
        step: 'Database Connection',
        duration: Date.now() - stepStart,
        status: 'success',
        details: health
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'Database Connection',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    // Step 2: Check existing user
    stepStart = Date.now();
    try {
      const existingUser = await prisma.user.findFirst({
        where: { email: testEmail }
      });
      testResults.steps.push({
        step: 'Check Existing User',
        duration: Date.now() - stepStart,
        status: 'success',
        details: { exists: !!existingUser, emailVerified: existingUser?.emailVerified }
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'Check Existing User',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    // Step 3: Password hashing
    stepStart = Date.now();
    try {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      testResults.steps.push({
        step: 'Password Hashing',
        duration: Date.now() - stepStart,
        status: 'success',
        details: { hashedLength: hashedPassword.length }
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'Password Hashing',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    // Step 4: Organization creation (simulated)
    stepStart = Date.now();
    try {
      // Check if we can simulate organization creation without actually creating
      const orgName = `${testEmail.split('@')[0]}'s Test Organization`;
      testResults.steps.push({
        step: 'Organization Creation (Simulated)',
        duration: Date.now() - stepStart,
        status: 'success',
        details: { orgName }
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'Organization Creation (Simulated)',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    // Step 5: OTP generation
    stepStart = Date.now();
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10);
      testResults.steps.push({
        step: 'OTP Generation',
        duration: Date.now() - stepStart,
        status: 'success',
        details: { otpLength: otp.length, expires: expires.toISOString() }
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'OTP Generation',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    // Step 6: Email service test (without actually sending)
    stepStart = Date.now();
    try {
      const emailConfigured = !!(
        process.env.RESEND_API_KEY && 
        process.env.FROM_EMAIL &&
        resend
      );
      testResults.steps.push({
        step: 'Email Service Test',
        duration: Date.now() - stepStart,
        status: 'success',
        details: { 
          configured: emailConfigured,
          resendApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: !!process.env.FROM_EMAIL,
          resendClient: !!resend
        }
      });
    } catch (error: any) {
      testResults.steps.push({
        step: 'Email Service Test',
        duration: Date.now() - stepStart,
        status: 'error',
        details: error.message
      });
      throw error;
    }

    testResults.success = true;
    testResults.totalDuration = Date.now() - startTime;

    return NextResponse.json({
      message: 'Registration flow test completed successfully',
      testResults,
      recommendations: [
        testResults.totalDuration > 5000 ? 'Consider optimizing slow database operations' : null,
        !process.env.RESEND_API_KEY ? 'Check RESEND_API_KEY environment variable' : null,
        !process.env.FROM_EMAIL ? 'Check FROM_EMAIL environment variable' : null
      ].filter(Boolean)
    });

  } catch (error: any) {
    testResults.success = false;
    testResults.totalDuration = Date.now() - startTime;

    return NextResponse.json({
      message: 'Registration flow test failed',
      error: error.message,
      testResults,
      recommendations: [
        'Check database connectivity',
        'Verify environment variables are set correctly',
        'Check server logs for detailed errors'
      ]
    }, { status: 500 });
  }
} 
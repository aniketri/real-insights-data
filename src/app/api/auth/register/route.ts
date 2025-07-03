import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';
import { checkDatabaseAvailable } from '../../../../lib/api-utils';
import bcrypt from 'bcryptjs';
import { resend } from '../../../../lib/mailer';
import { OtpEmail } from '../../../../components/emails/otp-email';
import { checkRateLimit } from '../../../../lib/rate-limiter';

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  console.log(`[${requestId}] Registration request started at ${new Date().toISOString()}`);

  // Check database availability during build
  const dbCheck = checkDatabaseAvailable();
  if (dbCheck) return dbCheck;
  
  try {
    // Skip execution during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { email, password } = await req.json();
    console.log(`[${requestId}] Parsed request body - Email: ${email}`);

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Rate limiting: max 5 registration attempts per email per 15 minutes
    let stepStart = Date.now();
    const rateLimitCheck = checkRateLimit(`register:${email}`, 5, 15 * 60 * 1000);
    console.log(`[${requestId}] Rate limit check: ${Date.now() - stepStart}ms`);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ 
        message: `Too many registration attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.` 
      }, { status: 429 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Generate OTP and hash password in parallel
    stepStart = Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);
    
    const [hashedPassword] = await Promise.all([
      bcrypt.hash(password, 10)
    ]);
    console.log(`[${requestId}] Password hashing: ${Date.now() - stepStart}ms`);

    // Perform all database operations in a single transaction for better performance
    stepStart = Date.now();
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if user already exists and is verified
      const existingUser = await tx.user.findFirst({
        where: { email, emailVerified: { not: null } },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: `${email.split('@')[0]}'s Organization`,
        },
      });

      // Create or update user
      const user = await tx.user.upsert({
        where: { email },
        update: {
          passwordHash: hashedPassword,
          organizationId: organization.id,
          emailVerified: null,
        },
        create: {
          email,
          passwordHash: hashedPassword,
          name: email.split('@')[0],
          organizationId: organization.id,
          role: 'MEMBER',
          permissions: ['READ_ALL'],
          emailVerified: null,
        },
      });

      // Clean up existing OTPs and create new one
      await tx.oneTimePassword.deleteMany({
        where: { 
          email
        },
      });

      // Create new OTP
      await tx.oneTimePassword.create({
        data: {
          email,
          token: otp,
          expires,
        },
      });

      return { user, organization };
    }, {
      timeout: 15000, // 15 second timeout for the transaction
    });
    
    console.log(`[${requestId}] Database transaction: ${Date.now() - stepStart}ms`);

    // Send email in background (don't wait for it)
    stepStart = Date.now();
    if (resend) {
      // Don't await email sending - let it happen in background
      resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
        to: email,
        subject: 'Verify your email address - Real Insights',
        react: OtpEmail({ otp }),
      }).then((emailResult) => {
        console.log(`[${requestId}] Email sent: ${Date.now() - stepStart}ms, ID: ${emailResult.data?.id}`);
      }).catch((emailError) => {
        console.error(`[${requestId}] Failed to send OTP email:`, emailError);
      });
    } else {
      console.log(`[${requestId}] Email service not configured, skipping email send`);
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] Registration completed successfully in ${totalDuration}ms`);

    return NextResponse.json({ 
      message: 'Account created successfully. Please check your email for the verification code.',
      debug: process.env.NODE_ENV === 'development' ? {
        requestId,
        duration: totalDuration,
        userId: result.user.id,
        organizationId: result.organization.id
      } : undefined
    }, { status: 201 });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] Registration error after ${totalDuration}ms:`, error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? {
        requestId,
        duration: totalDuration,
        error: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    }, { status: 500 });
  }
} 
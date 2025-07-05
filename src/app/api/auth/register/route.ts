import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';
import { checkDatabaseAvailable } from '../../../../lib/api-utils';
import bcrypt from 'bcryptjs';
import { resend } from '../../../../lib/mailer';
import { OtpEmail } from '../../../../components/emails/otp-email';
import { checkRateLimit } from '../../../../lib/rate-limiter';

interface RegistrationResult {
  user: { id: string };
  organization: { id: string };
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
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
    
    const { email, password, name, organizationName } = await req.json();
    console.log(`[${requestId}] Parsed request body - Email: ${email}`);

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
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

    // Check database connection first
    try {
      await Promise.race([
        prisma.user.findFirst({ take: 1 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 5000)
        )
      ]);
    } catch (error: any) {
      console.error('Database connection check failed:', error);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    let result: RegistrationResult | undefined;
    try {
      const transactionResult = await Promise.race([
        prisma.$transaction(async (tx: any) => {
    // Check if user already exists and is verified
          const existingUser = await tx.user.findFirst({
            where: { email },
            select: { id: true, emailVerified: true }
    });

          if (existingUser?.emailVerified) {
            throw new Error('User already exists');
    }

          // Create organization
          const organization = await tx.organization.create({
      data: {
              name: organizationName
            }
    });

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create or update user
          const user = await tx.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
              name,
              organizationId: organization.id
      },
      create: {
        email,
        passwordHash: hashedPassword,
              name,
        organizationId: organization.id,
              role: 'ADMIN'
            }
    });

          // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          // Create OTP record
          await (tx as any).oneTimePassword.create({
      data: {
        email,
        token: otp,
        expires,
              type: 'EMAIL_VERIFICATION'
            }
    });

          return { user, organization, otp };
        }, {
          timeout: 10000 // 10 second timeout for the transaction
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database transaction timeout')), 12000)
        )
      ]);
      
      const { user, organization, otp } = transactionResult as RegistrationResult & { otp: string };

    // Send OTP email
    if (resend) {
        await resend.emails.send({
          from: 'Real Insights <noreply@realinsights.io>',
          to: email,
          subject: 'Verify your email',
          react: OtpEmail({ otp })
        });
      }

      result = { user, organization };

    } catch (transactionError: any) {
      console.error(`[${requestId}] Transaction error:`, transactionError);
      const errorMessage = transactionError.message || 'Registration failed';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] Registration completed in ${totalDuration}ms`);

    return NextResponse.json({ 
      message: 'Registration successful',
      data: result ? {
        requestId,
        duration: totalDuration,
        userId: result.user.id,
        organizationId: result.organization.id
      } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error(`[${requestId}] Unhandled error:`, error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
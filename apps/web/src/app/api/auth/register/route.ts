import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';
import { checkDatabaseAvailable } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';
import { resend } from '@/lib/mailer';
import { OtpEmail } from '@/components/emails/otp-email';

export async function POST(req: NextRequest) {
  // Check database availability during build
  const dbCheck = checkDatabaseAvailable();
  if (dbCheck) return dbCheck;
  
  try {
    // Skip execution during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const { email, password } = await req.json();
    console.log('📝 Registration attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Test database connectivity
    try {
      await prisma.$connect();
      console.log('✅ Database connection established for registration');
    } catch (dbError) {
      console.error('❌ Database connection failed during registration:', dbError);
      return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findFirst({
      where: { email, emailVerified: { not: null } },
    });

    if (existingUser) {
      console.log('❌ User already exists and is verified:', email);
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🏢 Creating organization...');
    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: `${email.split('@')[0]}'s Organization`,
      },
    });

    console.log('👤 Creating/updating user...');
    // Create or update user with organization
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        organizationId: organization.id,
        // Reset emailVerified to null since we need to verify again
        emailVerified: null,
      },
      create: {
        email,
        passwordHash: hashedPassword,
        name: email.split('@')[0],
        organizationId: organization.id,
        role: 'MEMBER', // Default role for new users
        permissions: ['READ_ALL'], // Basic permissions for new users
        emailVerified: null, // Will be set after OTP verification
      },
    });

    console.log('🔢 Generating OTP...');
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // OTP expires in 10 minutes

    // Clean up any existing OTPs for this email
    await prisma.oneTimePassword.deleteMany({
      where: { email },
    });

    // Create new OTP
    await prisma.oneTimePassword.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    console.log('📧 Sending OTP email...');
    // Send OTP email
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
          to: email,
          subject: 'Verify your email address - Real Insights',
          react: OtpEmail({ otp }),
        });
        console.log('✅ OTP email sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send OTP email:', emailError);
        // Continue anyway - user can use resend OTP
      }
    } else {
      console.log('⚠️ Resend not configured - OTP email not sent');
    }

    return NextResponse.json({ 
      message: 'Account created successfully. Please check your email for the verification code.' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
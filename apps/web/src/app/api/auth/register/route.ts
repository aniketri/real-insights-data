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

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findFirst({
      where: { email, emailVerified: { not: null } },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: `${email.split('@')[0]}'s Organization`,
        // TODO: Add subscription fields when schema is updated
      },
    });

    // Create or update user with organization
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        organizationId: organization.id,
      },
      create: {
        email,
        passwordHash: hashedPassword,
        name: email.split('@')[0],
        // TODO: Add firstName when schema is updated
        organizationId: organization.id,
        role: 'MEMBER', // Default role for new users
        permissions: ['READ_ALL'], // Basic permissions for new users
      },
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // OTP expires in 10 minutes

    // Use OneTimePassword model instead of VerificationToken
    await prisma.oneTimePassword.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    // Send OTP email
    if (resend) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
        to: email,
        subject: 'Verify your email address - Real Insights',
        react: OtpEmail({ otp }),
      });
    }

    return NextResponse.json({ 
      message: 'Account created successfully. Please check your email for the verification code.' 
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';

// Conditionally import resend only in runtime
const getResend = async () => {
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
    const { resend } = await import('@/lib/mailer');
    return resend;
  }
  return null;
};
import { OtpEmail } from '@/components/emails/otp-email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ 
        message: 'No account found with this email address.' 
      }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: 'Email is already verified. You can sign in.' 
      }, { status: 400 });
    }

    // Delete any existing OTPs for this email
    await prisma.oneTimePassword.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Create new OTP record
    await prisma.oneTimePassword.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    // Send OTP email
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
      to: email,
      subject: 'Your New Verification Code - Real Insights',
      react: OtpEmail({ otp }),
    });

    return NextResponse.json({ 
      message: 'A new verification code has been sent to your email.' 
    }, { status: 200 });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
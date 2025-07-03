import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';
import { resend } from '@/lib/mailer';
import { OtpEmail } from '@/components/emails/otp-email';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Rate limiting: max 3 OTP resend attempts per email per 5 minutes
    const rateLimitCheck = checkRateLimit(`resend-otp:${email}`, 3, 5 * 60 * 1000);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ 
        message: `Too many resend attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.` 
      }, { status: 429 });
    }

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

    // Delete any existing OTPs for this email (only 6-digit OTPs, not password reset tokens)
    const existingTokens = await prisma.oneTimePassword.findMany({
      where: { email },
    });
    
    const otpTokensToDelete = existingTokens.filter(t => t.token.length === 6);
    
    if (otpTokensToDelete.length > 0) {
      await prisma.oneTimePassword.deleteMany({
        where: { 
          id: { in: otpTokensToDelete.map(t => t.id) }
        },
      });
    }

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
    if (resend) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
        to: email,
        subject: 'Your New Verification Code - Real Insights',
        react: OtpEmail({ otp }),
      });
    }

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
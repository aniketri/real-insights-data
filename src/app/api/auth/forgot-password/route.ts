import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';
import { checkDatabaseAvailable } from '../../../../lib/api-utils';
import { resend } from '../../../../lib/mailer';
import crypto from 'crypto';
import { checkRateLimit } from '../../../../lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Check database availability during build
  const dbCheck = checkDatabaseAvailable();
  if (dbCheck) return dbCheck;
  
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Rate limiting: max 3 password reset attempts per email per 15 minutes
    const rateLimitCheck = checkRateLimit(`forgot-password:${email}`, 3, 15 * 60 * 1000);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ 
        message: `Too many password reset attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.` 
      }, { status: 429 });
    }

    // Check if user exists and is verified
    const user = await prisma.user.findFirst({
      where: { 
        email,
        emailVerified: { not: null },
        isActive: true
      },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, password reset instructions have been sent.' 
      }, { status: 200 });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    // Clean up any existing password reset tokens for this email
    // We'll identify them by token length: password reset = 64 chars, OTP = 6 chars
    const existingTokens = await prisma.oneTimePassword.findMany({
      where: { email },
    });
    
    const resetTokensToDelete = existingTokens.filter((t: any) => t.token.length === 64);
    
    if (resetTokensToDelete.length > 0) {
      await prisma.oneTimePassword.deleteMany({
        where: { 
          id: { in: resetTokensToDelete.map((t: any) => t.id) }
        },
      });
    }

    // Create new password reset token
    await prisma.oneTimePassword.create({
      data: {
        email,
        token: resetToken,
        expires,
      },
    });

    // Send password reset email
    if (resend) {
      try {
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
          to: email,
          subject: 'Reset your password - Real Insights',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p>You requested a password reset for your Real Insights account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
              </p>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                ${resetUrl}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return NextResponse.json({ 
          message: 'Failed to send reset email. Please try again.' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: 'If an account with that email exists, password reset instructions have been sent.' 
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
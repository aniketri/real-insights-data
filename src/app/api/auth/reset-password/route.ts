import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';
import { checkDatabaseAvailable } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  // Check database availability during build
  const dbCheck = checkDatabaseAvailable();
  if (dbCheck) return dbCheck;
  
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Find the password reset token
    const resetToken = await prisma.oneTimePassword.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json({ 
        message: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    // Verify it's a password reset token (64 chars) not an OTP (6 chars)
    if (resetToken.token.length !== 64) {
      return NextResponse.json({ 
        message: 'Invalid reset token' 
      }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json({ 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Delete the used reset token
    await prisma.oneTimePassword.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ 
      message: 'Password reset successful' 
    }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
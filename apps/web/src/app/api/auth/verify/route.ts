import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    const otpRecord = await prisma.oneTimePassword.findFirst({
      where: {
        email,
        token: otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        message: 'Invalid or expired verification code. Please try again.' 
      }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.oneTimePassword.delete({
      where: {
        id: otpRecord.id,
      },
    });

    return NextResponse.json({ 
      message: 'Email verified successfully. You can now sign in.' 
    }, { status: 200 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
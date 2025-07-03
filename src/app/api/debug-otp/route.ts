import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../packages/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get OTPs for the email
    const otps = await prisma.oneTimePassword.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get user info
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      email,
      user,
      otps: otps.map((otp: any) => ({
        id: otp.id,
        token: otp.token,
        expires: otp.expires,
        expired: new Date() > otp.expires,
        createdAt: otp.createdAt
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Debug OTP error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug info',
      details: error.message 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db';

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ message: 'Token and email are required' }, { status: 400 });
    }

    // Find the invitation token
    const invitation = await prisma.oneTimePassword.findFirst({
      where: {
        token,
        email,
        expires: { gt: new Date() }, // Token not expired
      },
    });

    if (!invitation) {
      return NextResponse.json({ message: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Find the invited user (should be inactive)
    const invitedUser = await prisma.user.findFirst({
      where: {
        email,
        isActive: false, // Should be inactive until invitation is accepted
      },
      include: {
        organization: true,
      },
    });

    if (!invitedUser) {
      return NextResponse.json({ message: 'Invitation user not found' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      organizationName: invitedUser.organization?.name,
      role: invitedUser.role,
      permissions: invitedUser.permissions,
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 
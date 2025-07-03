import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  // Skip during build time if DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
  }
  try {
    const { token, email, firstName, lastName, password } = await req.json();

    if (!token || !email || !firstName || !lastName || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Find and validate the invitation token
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
    });

    if (!invitedUser) {
      return NextResponse.json({ message: 'Invitation user not found' }, { status: 404 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Activate and update the user
    await prisma.user.update({
      where: { id: invitedUser.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        passwordHash: hashedPassword,
        emailVerified: new Date(),
        isActive: true, // Activate the user
      },
    });

    // Remove the used invitation token
    await prisma.oneTimePassword.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({ 
      message: 'Account set up successfully',
      user: {
        email,
        firstName,
        lastName,
        role: invitedUser.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 
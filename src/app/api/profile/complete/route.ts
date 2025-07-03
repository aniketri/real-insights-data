import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@repo/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      phone,
      organizationName,
      organizationType,
      website,
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !organizationName) {
      return NextResponse.json(
        { message: 'First name, last name, and organization name are required.' },
        { status: 400 }
      );
    }

    // Get the user's current data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || undefined,
      },
    });

    // Update organization information if user has one
    if (currentUser.organizationId) {
      await prisma.organization.update({
        where: { id: currentUser.organizationId },
        data: {
          name: organizationName,
          website: website || undefined,
        },
      });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while updating your profile.' },
      { status: 500 }
    );
  }
} 
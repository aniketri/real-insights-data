import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../../packages/db';
import { resend } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    // Skip execution during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    const session = await auth();
    
    // Only admins can invite users
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized. Only admins can invite users.' }, { status: 403 });
    }

    const { email, role = 'MEMBER', permissions = [] } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Get the admin's organization
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!adminUser?.organizationId) {
      return NextResponse.json({ message: 'Admin user has no organization' }, { status: 400 });
    }

    // Check if user already exists in this organization
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        organizationId: adminUser.organizationId,
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists in this organization' }, { status: 409 });
    }

    // Generate invitation token
    const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Invitation expires in 24 hours

    // Store invitation
    await prisma.oneTimePassword.create({
      data: {
        email,
        token: inviteToken,
        expires,
      },
    });

    // Set default permissions based on role
    const defaultPermissions = {
      'ADMIN': ['READ_ALL', 'WRITE_ALL', 'DELETE_ALL', 'ADMIN_PANEL'],
      'MANAGER': ['READ_ALL', 'WRITE_LOANS', 'WRITE_PROPERTIES', 'WRITE_REPORTS'],
      'MEMBER': ['READ_ALL', 'WRITE_LOANS'],
      'VIEWER': ['READ_ALL'],
    };

    const finalPermissions = permissions.length > 0 ? permissions : defaultPermissions[role as keyof typeof defaultPermissions] || ['READ_ALL'];

    // Create inactive user record
    await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Default name from email (user can update later)
        organizationId: adminUser.organizationId,
        role: role as any,
        permissions: finalPermissions,
        isActive: false, // User is inactive until they accept invitation
      },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${inviteToken}&email=${encodeURIComponent(email)}`;
    
    if (resend) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
        to: email,
        subject: `You're invited to join ${adminUser.organization?.name} on Real Insights`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're invited to Real Insights!</h2>
            <p>Hello,</p>
            <p>${adminUser.name || adminUser.email} has invited you to join <strong>${adminUser.organization?.name}</strong> on Real Insights.</p>
            <p><strong>Role:</strong> ${role}</p>
            <p>Click the link below to accept your invitation and set up your account:</p>
            <a href="${inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Accept Invitation</a>
            <p>This invitation will expire in 24 hours.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <hr style="margin: 24px 0;">
            <p style="color: #666; font-size: 14px;">Real Insights - Commercial Real Estate Debt Management</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ 
      message: `Invitation sent to ${email}`,
      role,
      permissions: finalPermissions,
    }, { status: 201 });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
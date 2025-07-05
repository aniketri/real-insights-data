import { NextResponse } from 'next/server';
import prisma from '../../../../../packages/db';

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get accounts
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        type: true,
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        id: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      status: 'success',
      data: {
        users: users,
        accounts: accounts,
        userCount: users.length,
        accountCount: accounts.length,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Debug users endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
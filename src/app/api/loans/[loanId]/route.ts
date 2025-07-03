import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@repo/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { loanId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    const loan = await prisma.loan.findFirst({
      where: {
        id: params.loanId,
        organizationId: user.organizationId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            propertyType: true,
            address: true,
            city: true,
            state: true,
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
          }
        },
        fund: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
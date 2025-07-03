import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../../packages/db';
import { checkDatabaseAvailable } from '@/lib/api-utils';

export async function GET() {
  // Check database availability during build
  const dbCheck = checkDatabaseAvailable();
  if (dbCheck) return dbCheck;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    // Skip execution during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        organization: {
          include: {
            loans: {
              include: {
                lender: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.organization) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    const { loans } = user.organization;

    const csvHeader = [
      'Property Name',
      'Original Loan Balance',
      'Current Balance',
      'Interest Rate',
      'Rate Type',
      'Maturity Date',
      'Lender',
      'Property Type',
    ].join(',');

    const csvBody = loans
      .map((loan: any) =>
        [
          `"${loan.propertyName.replace(/"/g, '""')}"`,
          loan.originalLoanBalance,
          loan.currentBalance,
          loan.interestRate,
          loan.rateType,
          loan.maturityDate.toISOString().split('T')[0],
          `"${loan.lender.name.replace(/"/g, '""')}"`,
          loan.propertyType,
        ].join(',')
      )
      .join('\\n');
    
    const csvContent = `${csvHeader}\\n${csvBody}`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="loans_export.csv"`,
      },
    });

  } catch (error) {
    console.error('Error fetching data for export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
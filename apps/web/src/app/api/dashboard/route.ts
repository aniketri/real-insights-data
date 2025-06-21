import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@repo/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const propertyType = searchParams.get('propertyType');
  const lender = searchParams.get('lender');
  const fund = searchParams.get('fund');

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const userWithOrg = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        organization: {
          include: {
            loans: {
              where: {
                ...(propertyType && { property: { propertyType: propertyType as any } }),
                ...(lender && { lender: { name: lender } }),
                ...(fund && { fund: { name: fund } }),
              },
              include: {
                lender: true,
                fund: true,
                property: true,
              },
            },
          },
        },
      },
    });

    if (!userWithOrg || !userWithOrg.organization) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    const { loans } = userWithOrg.organization;

    const totalDebt = loans.reduce((acc: number, loan: any) => acc + loan.currentBalance, 0);
    const totalOriginalDebt = loans.reduce((acc: number, loan: any) => acc + loan.originalLoanBalance, 0);

    const averageInterestRate = totalDebt > 0
      ? loans.reduce((acc: number, loan: any) => acc + loan.currentBalance * loan.interestRate, 0) / totalDebt
      : 0;

    const weightedAverageMaturity = totalDebt > 0
        ? loans.reduce((acc: number, loan: any) => {
            const yearsToMaturity = (new Date(loan.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365);
            return acc + loan.currentBalance * yearsToMaturity;
          }, 0) / totalDebt
        : 0;
        
    const debtByPropertyType = loans.reduce((acc: Record<string, number>, loan: any) => {
        const type = loan.property.propertyType;
        acc[type] = (acc[type] || 0) + loan.currentBalance;
        return acc;
    }, {} as Record<string, number>);

    const debtByLender = loans.reduce((acc: Record<string, number>, loan: any) => {
        const lenderName = loan.lender.name;
        acc[lenderName] = (acc[lenderName] || 0) + loan.currentBalance;
        return acc;
    }, {} as Record<string, number>);

    const maturitySchedule = loans.reduce((acc: Record<string, number>, loan: any) => {
      const year = new Date(loan.maturityDate).getFullYear();
      acc[year] = (acc[year] || 0) + loan.currentBalance;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalDebt,
      averageInterestRate,
      weightedAverageMaturity,
      debtByPropertyType,
      debtByLender,
      maturitySchedule,
      loans,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
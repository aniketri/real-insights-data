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

    // Verify loan belongs to user's organization
    const loan = await prisma.loan.findFirst({
      where: {
        id: params.loanId,
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        originalLoanBalance: true,
        interestRate: true,
        amortizationPeriod: true,
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Get existing amortization schedule from database
    const scheduleEntries = await prisma.amortizationSchedule.findMany({
      where: { loanId: params.loanId },
      orderBy: { paymentNumber: 'asc' }
    });

    // If no schedule exists, generate one
    if (scheduleEntries.length === 0) {
      const schedule = generateAmortizationSchedule(
        loan.originalLoanBalance,
        loan.interestRate,
        loan.amortizationPeriod
      );
      return NextResponse.json(schedule);
    }

    return NextResponse.json(scheduleEntries);
  } catch (error) {
    console.error('Error fetching amortization schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}> {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

  let remainingBalance = principal;
  const schedule = [];

  for (let month = 1; month <= totalPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
    });

    if (remainingBalance <= 0) break;
  }

  return schedule;
} 
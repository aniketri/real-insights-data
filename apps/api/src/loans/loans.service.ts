import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AmortizationScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async getAmortizationSchedule(
    loanId: string,
  ): Promise<AmortizationScheduleEntry[]> {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const { originalLoanBalance, interestRate, amortizationPeriod } = loan;
    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = amortizationPeriod * 12;

    const monthlyPayment =
      (originalLoanBalance *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const schedule: AmortizationScheduleEntry[] = [];
    let remainingBalance = originalLoanBalance;

    for (let i = 1; i <= numberOfPayments; i++) {
      const interest = remainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;

      schedule.push({
        month: i,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        remainingBalance:
          remainingBalance < 0 ? 0 : parseFloat(remainingBalance.toFixed(2)),
      });
    }

    return schedule;
  }
} 
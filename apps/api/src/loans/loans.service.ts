import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AmortizationScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface LoanSummary {
  totalLoans: number;
  totalCurrentBalance: number;
  totalOriginalBalance: number;
  averageInterestRate: number;
  averageLTV: number;
  statusDistribution: Record<string, number>;
}

@Injectable()
export class LoansService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(private prisma: PrismaService) {}

  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old cache entries
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  async getAmortizationSchedule(loanId: string): Promise<AmortizationScheduleEntry[]> {
    const cacheKey = `amortization:${loanId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        originalLoanBalance: true,
        interestRate: true,
        amortizationPeriod: true,
        amortizationType: true,
        paymentFrequency: true,
      }
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const { originalLoanBalance, interestRate, amortizationPeriod } = loan;
    
    // Calculate payments per year based on frequency
    const paymentsPerYear = loan.paymentFrequency === 'MONTHLY' ? 12 : 
                           loan.paymentFrequency === 'QUARTERLY' ? 4 : 
                           loan.paymentFrequency === 'ANNUALLY' ? 1 : 12;
    
    const monthlyInterestRate = interestRate / 100 / paymentsPerYear;
    const numberOfPayments = amortizationPeriod;

    // Handle interest-only or other amortization types
    let monthlyPayment: number;
    if (loan.amortizationType === 'INTEREST_ONLY') {
      monthlyPayment = originalLoanBalance * monthlyInterestRate;
    } else {
      // Fully amortizing loan calculation
      monthlyPayment = numberOfPayments > 0 && monthlyInterestRate > 0
        ? (originalLoanBalance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : originalLoanBalance / numberOfPayments;
    }

    const schedule: AmortizationScheduleEntry[] = [];
    let remainingBalance = originalLoanBalance;

    for (let i = 1; i <= numberOfPayments && remainingBalance > 0.01; i++) {
      const interest = remainingBalance * monthlyInterestRate;
      let principal = monthlyPayment - interest;
      
      // Ensure we don't overpay on the last payment
      if (principal > remainingBalance) {
        principal = remainingBalance;
        monthlyPayment = principal + interest;
      }
      
      remainingBalance -= principal;

      schedule.push({
        month: i,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
      });
    }

    this.setCachedData(cacheKey, schedule);
    return schedule;
  }

  async getLoanSummary(organizationId: string, filters?: {
    propertyType?: string;
    lenderId?: string;
    fundId?: string;
    status?: string;
  }): Promise<LoanSummary> {
    const cacheKey = `summary:${organizationId}:${JSON.stringify(filters || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Build where clause
    const where: any = { organizationId };
    
    if (filters?.propertyType) {
      where.property = { propertyType: filters.propertyType };
    }
    if (filters?.lenderId) {
      where.lenderId = filters.lenderId;
    }
    if (filters?.fundId) {
      where.fundId = filters.fundId;
    }
    if (filters?.status) {
      where.loanStatus = filters.status;
    }

    // Get loan data with minimal fields for aggregation
    const loans = await this.prisma.loan.findMany({
      where,
      select: {
        currentBalance: true,
        originalLoanBalance: true,
        interestRate: true,
        ltv: true,
        loanStatus: true,
      },
      take: 10000, // Reasonable limit
    });

    // Perform aggregations in JavaScript (more efficient than database aggregation for this case)
    const totalCurrentBalance = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const totalOriginalBalance = loans.reduce((sum, loan) => sum + loan.originalLoanBalance, 0);
    
    const weightedInterestSum = loans.reduce((sum, loan) => sum + (loan.currentBalance * loan.interestRate), 0);
    const averageInterestRate = totalCurrentBalance > 0 ? weightedInterestSum / totalCurrentBalance : 0;
    
    const validLTVLoans = loans.filter(loan => loan.ltv !== null && loan.ltv > 0);
    const averageLTV = validLTVLoans.length > 0 
      ? validLTVLoans.reduce((sum, loan) => sum + loan.ltv!, 0) / validLTVLoans.length 
      : 0;

    const statusDistribution = loans.reduce((acc, loan) => {
      acc[loan.loanStatus] = (acc[loan.loanStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summary: LoanSummary = {
      totalLoans: loans.length,
      totalCurrentBalance: Math.round(totalCurrentBalance * 100) / 100,
      totalOriginalBalance: Math.round(totalOriginalBalance * 100) / 100,
      averageInterestRate: Math.round(averageInterestRate * 100) / 100,
      averageLTV: Math.round(averageLTV * 100) / 100,
      statusDistribution,
    };

    this.setCachedData(cacheKey, summary);
    return summary;
  }

  async getLoansWithPagination(
    organizationId: string, 
    page: number = 1, 
    limit: number = 50,
    filters?: {
      propertyType?: string;
      lenderId?: string;
      fundId?: string;
      status?: string;
      search?: string;
    }
  ) {
    const offset = (page - 1) * limit;
    const cacheKey = `loans:${organizationId}:${page}:${limit}:${JSON.stringify(filters || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Build where clause
    const where: any = { organizationId };
    
    if (filters?.propertyType) {
      where.property = { propertyType: filters.propertyType };
    }
    if (filters?.lenderId) {
      where.lenderId = filters.lenderId;
    }
    if (filters?.fundId) {
      where.fundId = filters.fundId;
    }
    if (filters?.status) {
      where.loanStatus = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { loanNumber: { contains: filters.search, mode: 'insensitive' } },
        { property: { name: { contains: filters.search, mode: 'insensitive' } } },
        { lender: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    // Execute queries in parallel
    const [loans, totalCount] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        select: {
          id: true,
          loanNumber: true,
          currentBalance: true,
          originalLoanBalance: true,
          interestRate: true,
          maturityDate: true,
          originationDate: true,
          loanStatus: true,
          ltv: true,
          dscr: true,
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
              lenderType: true,
            }
          },
          fund: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { currentBalance: 'desc' },
          { maturityDate: 'asc' }
        ]
      }),
      this.prisma.loan.count({ where })
    ]);

    const result = {
      loans,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1,
      }
    };

    this.setCachedData(cacheKey, result);
    return result;
  }

  // Clear cache when loans are modified
  async clearCache(organizationId?: string) {
    if (organizationId) {
      // Clear specific organization cache
      for (const [key] of this.cache) {
        if (key.includes(organizationId)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@repo/db';

// In-memory cache for dashboard data
const dashboardCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

function getCachedData(key: string) {
  const cached = dashboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  dashboardCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old cache entries to prevent memory leaks
  if (dashboardCache.size > 100) {
    const oldestKey = dashboardCache.keys().next().value;
    if (oldestKey) { dashboardCache.delete(oldestKey); }
  }
}

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
    // Step 1: Get user and organization ID efficiently (no nested includes)
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        organizationId: true,
        name: true 
      },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    // Step 2: Create cache key based on filters
    const cacheKey = `dashboard:${user.organizationId}:${propertyType || 'all'}:${lender || 'all'}:${fund || 'all'}`;
    
    // Step 3: Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheTimestamp: new Date().toISOString()
      });
    }

    // Step 4: Build optimized query filters
    const loanFilters: any = {
      organizationId: user.organizationId,
    };

    // Add filters based on query parameters
    if (propertyType) {
      loanFilters.property = { propertyType: propertyType as any };
    }
    if (lender) {
      loanFilters.lender = { name: lender };
    }
    if (fund) {
      loanFilters.fund = { name: fund };
    }

    // Step 5: Execute optimized queries in parallel
    const [loans, portfolioCount, propertyCount] = await Promise.all([
      // Get loans with only required fields to minimize data transfer
      db.loan.findMany({
        where: loanFilters,
        select: {
          id: true,
          currentBalance: true,
          originalLoanBalance: true,
          interestRate: true,
          maturityDate: true,
          loanStatus: true,
          loanNumber: true,
          originationDate: true,
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
        },
        // Reasonable limit to prevent memory issues
        take: 5000,
        orderBy: {
          currentBalance: 'desc'
        }
      }),

      // Get counts efficiently
      db.portfolio.count({ where: { organizationId: user.organizationId } }),
      db.property.count({ where: { organizationId: user.organizationId } })
    ]);

    // Step 6: Perform calculations efficiently in JavaScript
    const totalDebt = loans.reduce((acc, loan) => acc + loan.currentBalance, 0);
    const totalOriginalDebt = loans.reduce((acc, loan) => acc + loan.originalLoanBalance, 0);

    // Calculate weighted average interest rate
    const averageInterestRate = totalDebt > 0
      ? loans.reduce((acc, loan) => acc + loan.currentBalance * loan.interestRate, 0) / totalDebt
      : 0;

    // Calculate weighted average maturity
    const currentTime = Date.now();
    const weightedAverageMaturity = totalDebt > 0
      ? loans.reduce((acc, loan) => {
          const yearsToMaturity = (new Date(loan.maturityDate).getTime() - currentTime) / (1000 * 60 * 60 * 24 * 365);
          return acc + loan.currentBalance * Math.max(0, yearsToMaturity);
        }, 0) / totalDebt
      : 0;

    // Aggregate data by property type
    const debtByPropertyType = loans.reduce((acc, loan) => {
      const type = loan.property.propertyType;
      acc[type] = (acc[type] || 0) + loan.currentBalance;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate data by lender
    const debtByLender = loans.reduce((acc, loan) => {
      const lenderName = loan.lender.name;
      acc[lenderName] = (acc[lenderName] || 0) + loan.currentBalance;
      return acc;
    }, {} as Record<string, number>);

    // Create maturity schedule
    const maturitySchedule = loans.reduce((acc, loan) => {
      const year = new Date(loan.maturityDate).getFullYear();
      acc[year] = (acc[year] || 0) + loan.currentBalance;
      return acc;
    }, {} as Record<string, number>);

    // Calculate additional metrics
    const avgLoanSize = loans.length > 0 ? totalDebt / loans.length : 0;
    const largestLoan = loans.length > 0 ? Math.max(...loans.map(l => l.currentBalance)) : 0;
    
    // Loan status distribution
    const loanStatusDistribution = loans.reduce((acc, loan) => {
      acc[loan.loanStatus] = (acc[loan.loanStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Step 7: Prepare response data
    const responseData = {
      // Core metrics
      totalDebt,
      totalOriginalDebt,
      averageInterestRate: Math.round(averageInterestRate * 100) / 100,
      weightedAverageMaturity: Math.round(weightedAverageMaturity * 100) / 100,
      
      // Aggregated data
      debtByPropertyType,
      debtByLender,
      maturitySchedule,
      loanStatusDistribution,
      
      // Additional metrics
      avgLoanSize: Math.round(avgLoanSize),
      largestLoan,
      totalLoans: loans.length,
      
      // Sample loans for display (limit to prevent large payloads)
      loans: loans.slice(0, 50),
      
      // Data availability
      hasData: portfolioCount > 0 || propertyCount > 0 || loans.length > 0,
      portfolioCount,
      propertyCount,
      
      // Performance metadata
      fromCache: false,
      queryTimestamp: new Date().toISOString(),
    };

    // Step 8: Cache the result
    setCachedData(cacheKey, responseData);

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

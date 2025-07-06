'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Button, 
  Card, 
  Container, 
  Section, 
  Alert,
  LoadingSpinner,
  StatCard,
  Badge 
} from '../../../components/ui/design-system';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercent, formatDate } from '../../../lib/utils';
import Link from 'next/link';

interface DashboardStats {
  totalPortfolioValue: number;
  totalLoans: number;
  averageInterestRate: number;
  totalMonthlyPayment: number;
  upcomingMaturityCount: number;
  portfolioGrowth: number;
  delinquencyRate: number;
  occupancyRate: number;
}

interface RecentLoan {
  id: string;
  propertyName: string;
  loanAmount: number;
  interestRate: number;
  maturityDate: string;
  status: 'current' | 'delinquent' | 'matured';
  monthlyPayment: number;
}

interface UpcomingMaturity {
  id: string;
  propertyName: string;
  maturityDate: string;
  loanAmount: number;
  daysUntilMaturity: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [upcomingMaturities, setUpcomingMaturities] = useState<UpcomingMaturity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      // Set mock data for demo purposes
      setStats({
        totalPortfolioValue: 125000000,
        totalLoans: 47,
        averageInterestRate: 4.25,
        totalMonthlyPayment: 485000,
        upcomingMaturityCount: 8,
        portfolioGrowth: 12.5,
        delinquencyRate: 2.1,
        occupancyRate: 94.2
      });

      setRecentLoans([
        {
          id: '1',
          propertyName: 'Downtown Office Complex',
          loanAmount: 12500000,
          interestRate: 4.5,
          maturityDate: '2025-12-15',
          status: 'current',
          monthlyPayment: 65000
        },
        {
          id: '2',
          propertyName: 'Riverside Retail Center',
          loanAmount: 8750000,
          interestRate: 3.8,
          maturityDate: '2024-08-30',
          status: 'current',
          monthlyPayment: 42000
        },
        {
          id: '3',
          propertyName: 'Metro Industrial Park',
          loanAmount: 15200000,
          interestRate: 4.2,
          maturityDate: '2026-03-20',
          status: 'delinquent',
          monthlyPayment: 78000
        }
      ]);

      setUpcomingMaturities([
        {
          id: '1',
          propertyName: 'Riverside Retail Center',
          maturityDate: '2024-08-30',
          loanAmount: 8750000,
          daysUntilMaturity: 45
        },
        {
          id: '2',
          propertyName: 'Suburban Plaza',
          maturityDate: '2024-09-15',
          loanAmount: 6200000,
          daysUntilMaturity: 61
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="error" className="max-w-md">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {session?.user?.name}. Here's your portfolio overview.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link href="/loans">
                <Button variant="outline" size="sm">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  View All Loans
                </Button>
              </Link>
              <Link href="/loans/new">
                <Button variant="gradient" size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Loan
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Portfolio Value"
                value={formatCurrency(stats?.totalPortfolioValue || 0)}
                icon={<CurrencyDollarIcon className="w-6 h-6" />}
                trend={stats?.portfolioGrowth ? {
                  value: stats.portfolioGrowth,
                  isPositive: stats.portfolioGrowth > 0,
                  label: 'vs last quarter'
                } : undefined}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
              />
              
              <StatCard
                title="Total Loans"
                value={stats?.totalLoans?.toString() || '0'}
                icon={<BuildingOfficeIcon className="w-6 h-6" />}
                description="Active properties"
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
              />
              
              <StatCard
                title="Average Interest Rate"
                value={formatPercent((stats?.averageInterestRate || 0) / 100)}
                icon={<ChartBarIcon className="w-6 h-6" />}
                trend={stats?.averageInterestRate ? {
                  value: 0.3,
                  isPositive: false,
                  label: 'vs last quarter'
                } : undefined}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
              />
              
              <StatCard
                title="Monthly Payment"
                value={formatCurrency(stats?.totalMonthlyPayment || 0)}
                icon={<CalendarDaysIcon className="w-6 h-6" />}
                description="Total monthly"
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
              />
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercent((stats?.occupancyRate || 0) / 100)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUpIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.occupancyRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delinquency Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercent((stats?.delinquencyRate || 0) / 100)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.delinquencyRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Maturities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.upcomingMaturityCount || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">Next 90 days</p>
              </Card>
            </div>
          </motion.div>

          {/* Recent Activity & Upcoming Maturities */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Loans */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
                  <Link href="/loans">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentLoans.map((loan) => (
                    <motion.div
                      key={loan.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{loan.propertyName}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(loan.loanAmount)} • {formatPercent(loan.interestRate / 100)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={loan.status === 'current' ? 'success' : 
                                  loan.status === 'delinquent' ? 'error' : 'warning'}
                        >
                          {loan.status}
                        </Badge>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Maturities */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Maturities</h3>
                  <Link href="/reports">
                    <Button variant="ghost" size="sm">
                      View Report
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingMaturities.map((maturity) => (
                    <motion.div
                      key={maturity.id}
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{maturity.propertyName}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(maturity.loanAmount)} • {formatDate(maturity.maturityDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-800">
                          {maturity.daysUntilMaturity} days
                        </p>
                        <p className="text-xs text-yellow-600">until maturity</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/loans/new">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlusIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Add New Loan</p>
                    <p className="text-sm text-gray-600">Create a new loan entry</p>
                  </motion.div>
                </Link>

                <Link href="/reports">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChartBarIcon className="w-8 h-8 text-green-600 mb-2" />
                    <p className="font-medium text-gray-900">Generate Report</p>
                    <p className="text-sm text-gray-600">Portfolio analytics</p>
                  </motion.div>
                </Link>

                <Link href="/ai-query">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="font-medium text-gray-900">AI Query</p>
                    <p className="text-sm text-gray-600">Ask questions about your portfolio</p>
                  </motion.div>
                </Link>

                <Link href="/export">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-600">Download portfolio data</p>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DashboardData {
  totalDebt: number;
  averageInterestRate: number;
  weightedAverageMaturity: number;
  debtByPropertyType: Record<string, number>;
  debtByLender: Record<string, number>;
  maturitySchedule: Record<string, number>;
  loans: any[];
  hasData: boolean;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [lenderFilter, setLenderFilter] = useState<string>('');
  const [fundFilter, setFundFilter] = useState<string>('');

  useEffect(() => {
    // Check if coming from successful onboarding
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      // Remove the welcome parameter from URL after showing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();
        if (propertyTypeFilter) params.append('propertyType', propertyTypeFilter);
        if (lenderFilter) params.append('lender', lenderFilter);
        if (fundFilter) params.append('fund', fundFilter);

        const res = await fetch(`/api/dashboard?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await res.json();
        setData(jsonData);
        
        // Check if user needs onboarding (no portfolios, properties, or loans)
        if (!jsonData.hasData && session?.user && !showWelcome) {
          router.push('/onboarding');
          return;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [propertyTypeFilter, lenderFilter, fundFilter, session, router, showWelcome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error loading dashboard</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Set Up Your Portfolio
          </button>
        </div>
      </div>
    );
  }

  // Welcome message for new users who just completed onboarding
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Real Insights!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Your portfolio has been set up successfully. You can now start adding loans, 
            tracking performance, and generating reports.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              View Dashboard
            </button>
            <div className="text-sm text-gray-500">
              <p>Next steps: Add your first loan or explore the AI query feature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  const formatAsM = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  }

  const formatYears = (value: number) => {
    return `${value.toFixed(1)} years`;
  }

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">Debt Portfolio Overview</p>
          <p className="text-[#637888] text-sm font-normal leading-normal">Analyze your debt portfolio's performance and trends.</p>
        </div>
        <div className="flex items-center">
            <button
                onClick={() => window.open('/api/export/loans', '_blank')}
                className="flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Export to CSV
            </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 p-4 items-center">
        <div className="flex items-center gap-2">
            <label htmlFor="propertyTypeFilter" className="text-sm font-medium text-gray-700">Property Type:</label>
            <select
                id="propertyTypeFilter"
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">All</option>
                {data && Array.from(new Set(data.loans.map(loan => loan.propertyType))).map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="lenderFilter" className="text-sm font-medium text-gray-700">Lender:</label>
            <select
                id="lenderFilter"
                value={lenderFilter}
                onChange={(e) => setLenderFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">All</option>
                {data && Array.from(new Set(data.loans.map(loan => loan.lender.name))).map(lender => (
                    <option key={lender} value={lender}>{lender}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="fundFilter" className="text-sm font-medium text-gray-700">Fund:</label>
            <select
                id="fundFilter"
                value={fundFilter}
                onChange={(e) => setFundFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">All</option>
                {data && Array.from(new Set(data.loans.map(loan => loan.fund?.name).filter(Boolean))).map(fund => (
                    <option key={fund} value={fund}>{fund}</option>
                ))}
            </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Total Debt</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatAsM(data.totalDebt)}</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Average Interest Rate</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatPercent(data.averageInterestRate)}</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Weighted Average Maturity</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatYears(data.weightedAverageMaturity)}</p>
        </div>
      </div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Debt Composition</h2>
      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
          <p className="text-[#111518] text-base font-medium leading-normal">Debt by Property Type</p>
          <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
            {Object.entries(data.debtByPropertyType).map(([type, value]) => (
                <>
                    <div className="border-[#637888] bg-[#f0f3f4] border-t-2 w-full" style={{ height: `${(value / data.totalDebt) * 100}%` }}></div>
                    <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{type}</p>
                </>
            ))}
          </div>
        </div>
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
          <p className="text-[#111518] text-base font-medium leading-normal">Debt by Lender</p>
          <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
            {Object.entries(data.debtByLender).map(([lender, value]) => (
                <>
                    <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{lender}</p>
                    <div className="h-full flex-1"><div className="border-[#637888] bg-[#f0f3f4] border-r-2 h-full" style={{ width: `${(value / data.totalDebt) * 100}%` }}></div></div>
                </>
            ))}
          </div>
        </div>
      </div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Maturity Schedule</h2>
      <div className="px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
          <p className="text-[#111518] text-base font-medium leading-normal">Debt Maturing by Year</p>
          <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
            {Object.entries(data.maturitySchedule)
              .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
              .map(([year, value]) => (
                <>
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xs text-gray-500">{formatAsM(value)}</span>
                    <div className="border-blue-500 bg-blue-100 border-t-2 w-full mt-1" style={{ height: `${(value / data.totalDebt) * 100}%` }}></div>
                  </div>
                  <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{year}</p>
                </>
            ))}
          </div>
        </div>
      </div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Loans</h2>
      <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#dce1e5] bg-white">
            <table className="flex-1 whitespace-nowrap">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left text-[#111518] w-[200px] text-sm font-medium leading-normal">Loan</th>
                  <th className="px-4 py-3 text-left text-[#111518] w-[100px] text-sm font-medium leading-normal">Property</th>
                  <th className="px-4 py-3 text-left text-[#111518] w-[100px] text-sm font-medium leading-normal">Lender</th>
                  <th className="px-4 py-3 text-right text-[#111518] w-[100px] text-sm font-medium leading-normal">Balance</th>
                  <th className="px-4 py-3 text-right text-[#111518] w-[100px] text-sm font-medium leading-normal">Rate</th>
                  <th className="px-4 py-3 text-left text-[#111518] w-[100px] text-sm font-medium leading-normal">Maturity</th>
                </tr>
              </thead>
              <tbody>
                {data.loans.map((loan: any) => (
                  <tr key={loan.id} className="border-t border-t-[#dce1e5]">
                    <td className="px-4 py-2 text-[#111518] text-sm font-normal leading-normal">{loan.loanNumber || `Loan ${loan.id.slice(-6)}`}</td>
                    <td className="px-4 py-2 text-[#637888] text-sm font-normal leading-normal">{loan.property.name}</td>
                    <td className="px-4 py-2 text-[#637888] text-sm font-normal leading-normal">{loan.lender.name}</td>
                    <td className="px-4 py-2 text-right text-[#637888] text-sm font-normal leading-normal">{formatAsM(loan.currentBalance)}</td>
                    <td className="px-4 py-2 text-right text-[#637888] text-sm font-normal leading-normal">{formatPercent(loan.interestRate)}</td>
                    <td className="px-4 py-2 text-[#637888] text-sm font-normal leading-normal">
                      {new Date(loan.maturityDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
} 
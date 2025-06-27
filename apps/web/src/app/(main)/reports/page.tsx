'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ReportsData {
  metrics: {
    totalPortfolioValue: number;
    totalDebt: number;
    averageDSCR: number;
    averageLTV: number;
    totalNOI: number;
    averageOccupancyRate: number;
  };
  trends: {
    portfolioValueOverTime: { month: string; value: number }[];
    dscrTrend: { month: string; value: number }[];
    portfolioGrowth: number;
    dscrChange: number;
  };
  summary: {
    totalLoans: number;
    totalProperties: number;
    hasData: boolean;
  };
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Form state
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('PORTFOLIO_SUMMARY');
  const [dateRange, setDateRange] = useState('LAST_12_MONTHS');
  
  // Metrics selection
  const [selectedMetrics, setSelectedMetrics] = useState({
    totalPortfolioValue: true,
    dscrRatio: true,
    ltvRatio: true,
    netOperatingIncome: false,
    occupancyRate: false,
  });

  // Visualizations selection
  const [selectedVisualizations, setSelectedVisualizations] = useState({
    portfolioValueOverTime: true,
    dscrTrend: true,
    ltvDistribution: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleMetricChange = (metric: string) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric as keyof typeof prev]
    }));
  };

  const handleVisualizationChange = (visualization: string) => {
    setSelectedVisualizations(prev => ({
      ...prev,
      [visualization]: !prev[visualization as keyof typeof prev]
    }));
  };

  const generateReport = async () => {
    try {
      const reportData = {
        name: reportName || 'Custom Report',
        reportType,
        parameters: {
          dateRange,
        },
        metrics: selectedMetrics,
        visualizations: selectedVisualizations,
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        setReportGenerated(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const exportReport = () => {
    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Portfolio Value,$${data?.metrics.totalPortfolioValue?.toLocaleString() || 0}\n`
      + `Average DSCR,${data?.metrics.averageDSCR?.toFixed(2) || 0}x\n`
      + `Average LTV,${((data?.metrics.averageLTV || 0) * 100).toFixed(1)}%\n`
      + `Total NOI,$${data?.metrics.totalNOI?.toLocaleString() || 0}\n`
      + `Average Occupancy Rate,${((data?.metrics.averageOccupancyRate || 0) * 100).toFixed(1)}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName || 'portfolio_report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAsM = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data?.summary.hasData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-500 mb-2">No data available</div>
          <div className="text-sm text-gray-400">Add some loans and properties to generate reports</div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">Custom Reports</p>
          <p className="text-[#637888] text-sm font-normal leading-normal">Create and export custom reports tailored to your specific needs.</p>
        </div>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111518] text-base font-medium leading-normal pb-2">Report Name</p>
          <input
            placeholder="Enter report name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] h-14 placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </label>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111518] text-base font-medium leading-normal pb-2">Report Type</p>
          <select
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] h-14 bg-[image:--select-button-svg] placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="PORTFOLIO_SUMMARY">Portfolio Summary</option>
            <option value="PERFORMANCE_METRICS">Performance Metrics</option>
            <option value="RISK_ANALYSIS">Risk Analysis</option>
            <option value="MATURITY_SCHEDULE">Maturity Schedule</option>
            <option value="COVENANT_COMPLIANCE">Covenant Compliance</option>
          </select>
        </label>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111518] text-base font-medium leading-normal pb-2">Date Range</p>
          <select
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] h-14 bg-[image:--select-button-svg] placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="LAST_12_MONTHS">Last 12 Months</option>
            <option value="LAST_6_MONTHS">Last 6 Months</option>
            <option value="YEAR_TO_DATE">Year to Date</option>
            <option value="LAST_YEAR">Last Year</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </label>
      </div>

      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Metrics</h2>
      <div className="px-4">
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedMetrics.totalPortfolioValue}
            onChange={() => handleMetricChange('totalPortfolioValue')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Total Portfolio Value</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedMetrics.dscrRatio}
            onChange={() => handleMetricChange('dscrRatio')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Debt Service Coverage Ratio</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedMetrics.ltvRatio}
            onChange={() => handleMetricChange('ltvRatio')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Loan-to-Value Ratio</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedMetrics.netOperatingIncome}
            onChange={() => handleMetricChange('netOperatingIncome')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Net Operating Income</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedMetrics.occupancyRate}
            onChange={() => handleMetricChange('occupancyRate')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Occupancy Rate</p>
        </label>
      </div>

      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Visualizations</h2>
      <div className="px-4">
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedVisualizations.portfolioValueOverTime}
            onChange={() => handleVisualizationChange('portfolioValueOverTime')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Portfolio Value Over Time</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedVisualizations.dscrTrend}
            onChange={() => handleVisualizationChange('dscrTrend')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">DSCR Trend</p>
        </label>
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            checked={selectedVisualizations.ltvDistribution}
            onChange={() => handleVisualizationChange('ltvDistribution')}
          />
          <p className="text-[#111518] text-base font-normal leading-normal">LTV Distribution</p>
        </label>
      </div>

      <div className="flex px-4 py-3 justify-end">
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#198de5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          onClick={generateReport}
        >
          <span className="truncate">Generate Report</span>
        </button>
      </div>

      {(reportGenerated || data) && (
        <>
          <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Generated Report</h2>
          <div className="flex flex-wrap gap-4 px-4 py-6">
            {selectedVisualizations.portfolioValueOverTime && (
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
                <p className="text-[#111518] text-base font-medium leading-normal">Portfolio Value Over Time</p>
                <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight truncate">
                  {formatAsM(data?.metrics.totalPortfolioValue || 0)}
                </p>
                <div className="flex gap-1">
                  <p className="text-[#637888] text-base font-normal leading-normal">Last 12 Months</p>
                  <p className={`text-base font-medium leading-normal ${data?.trends.portfolioGrowth >= 0 ? 'text-[#078838]' : 'text-[#e73908]'}`}>
                    {data?.trends.portfolioGrowth >= 0 ? '+' : ''}{formatPercent(data?.trends.portfolioGrowth || 0)}
                  </p>
                </div>
                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                  <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path
                      d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                      fill="url(#paint0_linear_1131_5935)"
                    ></path>
                    <path
                      d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                      stroke="#637888"
                      strokeWidth="3"
                      strokeLinecap="round"
                    ></path>
                    <defs>
                      <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f0f3f4"></stop>
                        <stop offset="1" stopColor="#f0f3f4" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex justify-around">
                    {data?.trends.portfolioValueOverTime.map((month, index) => (
                      <p key={index} className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">
                        {month.month}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedVisualizations.dscrTrend && (
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
                <p className="text-[#111518] text-base font-medium leading-normal">DSCR Trend</p>
                <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight truncate">
                  {data?.metrics.averageDSCR?.toFixed(2) || '0.00'}x
                </p>
                <div className="flex gap-1">
                  <p className="text-[#637888] text-base font-normal leading-normal">Last 12 Months</p>
                  <p className={`text-base font-medium leading-normal ${data?.trends.dscrChange >= 0 ? 'text-[#078838]' : 'text-[#e73908]'}`}>
                    {data?.trends.dscrChange >= 0 ? '+' : ''}{formatPercent(data?.trends.dscrChange || 0)}
                  </p>
                </div>
                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                  {data?.trends.dscrTrend.map((month, index) => (
                    <React.Fragment key={index}>
                      <div className="border-[#637888] bg-[#f0f3f4] border-t-2 w-full" style={{ height: `${Math.min(90, Math.max(10, month.value * 60))}%` }}></div>
                      <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{month.month}</p>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex px-4 py-3 justify-end">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={exportReport}
            >
              <span className="truncate">Export Report</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
} 
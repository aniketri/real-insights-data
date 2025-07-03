'use client';

interface DebtPortfolioOverviewProps {
  totalDebt: number;
  averageInterestRate: number;
  weightedAverageMaturity: number;
}

export default function DebtPortfolioOverview({
  totalDebt,
  averageInterestRate,
  weightedAverageMaturity,
}: DebtPortfolioOverviewProps) {
  const formatAsM = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatYears = (value: number) => {
    return `${value.toFixed(1)} years`;
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">Debt Portfolio Overview</p>
          <p className="text-[#637888] text-sm font-normal leading-normal">Analyze your debt portfolio's performance and trends.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Total Debt</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatAsM(totalDebt)}</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Average Interest Rate</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatPercent(averageInterestRate)}</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#f0f3f4]">
          <p className="text-[#111518] text-base font-medium leading-normal">Weighted Average Maturity</p>
          <p className="text-[#111518] tracking-light text-2xl font-bold leading-tight">{formatYears(weightedAverageMaturity)}</p>
        </div>
      </div>
    </div>
  );
} 
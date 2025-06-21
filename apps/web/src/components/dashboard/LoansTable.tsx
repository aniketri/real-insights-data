'use client';

interface LoansTableProps {
  loans: any[];
}

export default function LoansTable({ loans }: LoansTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Loans</h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dce1e5] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-[#111518] w-[200px] text-sm font-medium leading-normal">
                  Loan Name
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-[200px] text-sm font-medium leading-normal">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-[150px] text-sm font-medium leading-normal">
                  Loan Type
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-[150px] text-sm font-medium leading-normal">
                  Loan Amount
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-[150px] text-sm font-medium leading-normal">
                  Interest Rate
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-[150px] text-sm font-medium leading-normal">
                  Maturity Date
                </th>
                <th className="px-4 py-3 text-left text-[#111518] w-60 text-sm font-medium leading-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t border-t-[#dce1e5]">
                  <td className="h-[72px] px-4 py-2 w-[200px] text-[#111518] text-sm font-normal leading-normal">{loan.propertyName}</td>
                  <td className="h-[72px] px-4 py-2 w-[200px] text-[#637888] text-sm font-normal leading-normal">
                    {loan.propertyName}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[150px] text-[#637888] text-sm font-normal leading-normal">{loan.rateType}</td>
                  <td className="h-[72px] px-4 py-2 w-[150px] text-[#637888] text-sm font-normal leading-normal">
                    {formatCurrency(loan.currentBalance)}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[150px] text-[#637888] text-sm font-normal leading-normal">{formatPercent(loan.interestRate)}</td>
                  <td className="h-[72px] px-4 py-2 w-[150px] text-[#637888] text-sm font-normal leading-normal">
                    {new Date(loan.maturityDate).toLocaleDateString()}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                    <button
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-medium leading-normal w-full"
                    >
                      <span className="truncate">{loan.currentBalance > 0 ? 'Active' : 'Closed'}</span>
                    </button>
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
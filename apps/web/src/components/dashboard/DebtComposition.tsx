'use client';

interface DebtCompositionProps {
  debtByPropertyType: Record<string, number>;
  debtByLender: Record<string, number>;
  totalDebt: number;
}

export default function DebtComposition({
  debtByPropertyType,
  debtByLender,
  totalDebt,
}: DebtCompositionProps) {
  return (
    <div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Debt Composition</h2>
      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
          <p className="text-[#111518] text-base font-medium leading-normal">Debt by Property Type</p>
          <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
            {Object.entries(debtByPropertyType).map(([type, value]) => (
              <>
                <div className="border-[#637888] bg-[#f0f3f4] border-t-2 w-full" style={{ height: `${(value / totalDebt) * 100}%` }}></div>
                <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{type}</p>
              </>
            ))}
          </div>
        </div>
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#dce1e5] p-6">
          <p className="text-[#111518] text-base font-medium leading-normal">Debt by Lender</p>
          <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
            {Object.entries(debtByLender).map(([lender, value]) => (
              <>
                <p className="text-[#637888] text-[13px] font-bold leading-normal tracking-[0.015em]">{lender}</p>
                <div className="h-full flex-1"><div className="border-[#637888] bg-[#f0f3f4] border-r-2 h-full" style={{ width: `${(value / totalDebt) * 100}%` }}></div></div>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
export default function ReportsPage() {
  return (
    <>
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
            defaultValue=""
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111518] text-base font-medium leading-normal pb-2">Report Type</p>
          <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] h-14 bg-[image:--select-button-svg] placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal">
            <option value="one"></option>
            <option value="two">two</option>
            <option value="three">three</option>
          </select>
        </label>
      </div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Metrics</h2>
      <div className="px-4">
        <label className="flex gap-x-3 py-3 flex-row">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[#dce1e5] border-2 bg-transparent text-[#198de5] checked:bg-[#198de5] checked:border-[#198de5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dce1e5] focus:outline-none"
            defaultChecked
          />
          <p className="text-[#111518] text-base font-normal leading-normal">Total Portfolio Value</p>
        </label>
      </div>
      <div className="flex px-4 py-3 justify-end">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#198de5] text-white text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Generate Report</span>
        </button>
      </div>
    </>
  );
} 
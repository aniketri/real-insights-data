export default function AiQueryPage() {
  return (
    <>
      <div className="gap-1 px-6 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-80">
          <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">AI Query</h2>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Enter your query here..."
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] min-h-36 placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal"
              ></textarea>
            </label>
          </div>
          <div className="flex px-4 py-3 justify-end">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#198de5] text-white text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Run Query</span>
            </button>
          </div>
        </div>
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Query Results</h2>
          <div className="px-4 py-3 @container">
            <div className="flex overflow-hidden rounded-lg border border-[#dce1e5] bg-white">
              <table className="flex-1">
                <thead>
                  <tr className="bg-white">
                    <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Property Name</th>
                    <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Address</th>
                    <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Loan Amount</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
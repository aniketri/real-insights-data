'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Define the type for a single loan
interface Loan {
  id: string;
  asset: {
    name: string;
    propertyType: string;
  };
  currentBalance: number;
  interestRate: number;
  rateType: string;
  maturityDate: string;
}

export default function LoansPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`,
    };
  }, [session]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // We can reuse the dashboard endpoint as it returns all loans for the org
        const response = await fetch(`${apiBaseUrl}/dashboard`, { headers: getHeaders() });
        if (!response.ok) {
          throw new Error('Failed to fetch loans');
        }
        const data = await response.json();
        setLoans(data.loans || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [session, getHeaders, apiBaseUrl]);
  
  const getStatus = (maturityDate: string) => {
    return new Date(maturityDate) > new Date() ? 'Active' : 'Closed';
  }

  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight min-w-72">Loans</p>
        <Link href="/loans/new">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-medium leading-normal">
            <span className="truncate">New Loan</span>
          </button>
        </Link>
      </div>
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div
              className="text-[#637888] flex border-none bg-[#f0f3f4] items-center justify-center pl-4 rounded-l-lg border-r-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border-none bg-[#f0f3f4] focus:border-none h-full placeholder:text-[#637888] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>
      <div className="flex gap-3 p-3 flex-wrap pr-4">
        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f3f4] pl-4 pr-4">
          <p className="text-[#111518] text-sm font-medium leading-normal">All Loans</p>
        </div>
        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f3f4] pl-4 pr-4">
          <p className="text-[#111518] text-sm font-medium leading-normal">Active</p>
        </div>
        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f3f4] pl-4 pr-4">
          <p className="text-[#111518] text-sm font-medium leading-normal">Closed</p>
        </div>
      </div>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dce1e5] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Loan Name</th>
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Property</th>
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Loan Type</th>
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Loan Amount</th>
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Interest Rate</th>
                <th className="px-4 py-3 text-left text-[#111518] w-[400px] text-sm font-medium leading-normal">Maturity Date</th>
                <th className="px-4 py-3 text-left text-[#111518] w-60 text-sm font-medium leading-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center p-4 text-red-500">{error}</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-4">No loans found.</td></tr>
              ) : (
                loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/loans/${loan.id}`}>
                        {loan.asset.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{loan.asset.propertyType}</td>
                    <td className="px-4 py-3 text-sm">{loan.rateType}</td>
                    <td className="px-4 py-3 text-sm">${loan.currentBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{loan.interestRate.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-sm">{new Date(loan.maturityDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatus(loan.maturityDate) === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {getStatus(loan.maturityDate)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Define types for our data structures
interface LoanDetails {
  id: string;
  asset: { name: string };
  originalLoanBalance: number;
  interestRate: number;
  amortizationPeriod: number;
  maturityDate: string;
  rateType: string;
}

interface Note {
  id: string;
  content: string;
  author: { name: string | null };
  createdAt: string;
}

interface AmortizationScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

type Tab = 'overview' | 'amortization' | 'notes' | 'documents';

export default function LoanDetailPage({ params }: { params: { loanId: string } }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationScheduleEntry[]>([]);
  const [newNote, setNewNote] = useState('');
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
    const fetchLoanData = async () => {
      if (!session) return;
      try {
        setLoading(true);
        // Fetch real loan data from API
        const response = await fetch(`${apiBaseUrl}/loans/${params.loanId}`, { 
          headers: getHeaders() 
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan data');
        }
        
        const loanData = await response.json();
        setLoan(loanData);
      } catch (e) {
        console.error('Error fetching loan data:', e);
        setError('Failed to fetch loan data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLoanData();
  }, [params.loanId, session, getHeaders]);

  const fetchNotes = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`${apiBaseUrl}/loans/${params.loanId}/notes`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch notes.');
    }
  }, [params.loanId, session, getHeaders, apiBaseUrl]);

  const fetchAmortizationSchedule = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`${apiBaseUrl}/loans/${params.loanId}/amortization-schedule`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch amortization schedule');
      const data = await response.json();
      setAmortizationSchedule(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch amortization schedule.');
    }
  }, [params.loanId, session, getHeaders, apiBaseUrl]);

  useEffect(() => {
    if (activeTab === 'notes') {
      fetchNotes();
    }
    if (activeTab === 'amortization') {
      fetchAmortizationSchedule();
    }
  }, [activeTab, fetchNotes, fetchAmortizationSchedule]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !session) return;
    try {
      const response = await fetch(`${apiBaseUrl}/loans/${params.loanId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content: newNote }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      setNewNote('');
      fetchNotes(); // Refresh notes list
    } catch (e) {
      console.error(e);
      setError('Failed to add note.');
    }
  };

  const TabButton = ({ tab, children }: { tab: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
        activeTab === tab
          ? 'border-b-[#111518] text-[#111518]'
          : 'border-b-transparent text-[#637888]'
      }`}
    >
      <p className="text-sm font-bold leading-normal tracking-[0.015em]">{children}</p>
    </button>
  );

  const OverviewTab = () => (
    <div>
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Loan Details</h2>
        <div className="p-4 grid grid-cols-2">
            <DetailItem label="Loan Amount" value={`$${loan?.originalLoanBalance.toLocaleString()}`} />
            <DetailItem label="Interest Rate" value={`${loan?.interestRate}%`} />
            <DetailItem label="Loan Term" value={`${loan?.amortizationPeriod} years`} />
            <DetailItem label="Maturity Date" value={new Date(loan?.maturityDate || '').toLocaleDateString()} />
            <DetailItem label="Loan Type" value={loan?.rateType} />
        </div>
    </div>
  );

  const DetailItem = ({label, value}: {label: string, value: string | number | undefined}) => (
     <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce1e5] py-4 pr-2">
          <p className="text-[#637888] text-sm font-normal leading-normal">{label}</p>
          <p className="text-[#111518] text-sm font-normal leading-normal">{value}</p>
      </div>
  )

  const AmortizationTab = () => (
    <div className="p-4">
      <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Amortization Schedule</h2>
       <div className="max-h-96 overflow-y-auto border border-[#dce1e5] rounded-lg">
          <table className="min-w-full divide-y divide-[#dce1e5]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#dce1e5]">
              {amortizationSchedule.map((entry) => (
                <tr key={entry.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.payment.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.principal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.interest.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.remainingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );

  const NotesTab = () => (
     <div className="p-4">
        <h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Notes</h2>
        <div className="space-y-4">
            {notes.map(note => (
                 <div key={note.id} className="p-4 border border-[#dce1e5] rounded-lg">
                    <p className="text-[#111518] text-base">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        By {note.author?.name || 'Unknown'} on {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                 </div>
            ))}
        </div>
        <div className="mt-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111518] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#dce1e5] min-h-24 placeholder:text-[#637888] p-[15px] text-base font-normal leading-normal"
            />
            <button
                onClick={handleAddNote}
                className="mt-2 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#198de5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
                Add Note
            </button>
        </div>
     </div>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex flex-wrap gap-2 p-4">
        <a className="text-[#637888] text-base font-medium leading-normal" href="/loans">
          Loans
        </a>
        <span className="text-[#637888] text-base font-medium leading-normal">/</span>
        <span className="text-[#111518] text-base font-medium leading-normal">{loan?.asset?.name || `Loan ${params.loanId}`}</span>
      </div>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">{loan?.asset?.name || `Loan ${params.loanId}`}</p>
          <p className="text-[#637888] text-sm font-normal leading-normal">Loan ID: {params.loanId}</p>
        </div>
      </div>
      <div className="pb-3">
        <div className="flex border-b border-[#dce1e5] px-4 gap-8">
            <TabButton tab="overview">Overview</TabButton>
            <TabButton tab="amortization">Amortization</TabButton>
            <TabButton tab="notes">Notes</TabButton>
            <TabButton tab="documents">Documents</TabButton>
        </div>
      </div>
      
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'amortization' && <AmortizationTab />}
      {activeTab === 'notes' && <NotesTab />}
      {activeTab === 'documents' && <div className="p-4"><h2 className="text-[#111518] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Documents</h2><p>Document management coming soon.</p></div>}
    </>
  );
} 
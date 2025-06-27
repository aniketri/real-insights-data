'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar({ session }: { session: Session }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3 relative">
      <div className="flex items-center gap-4 text-[#111518]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">Real Insights</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="/dashboard">Dashboard</Link>
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="/loans">Portfolio</Link>
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="#">Analytics</Link>
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="/reports">Reports</Link>
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="#">Market Data</Link>
          <Link className="text-[#111518] text-sm font-medium leading-normal" href="#">Help</Link>
        </div>
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#f0f3f4] text-[#111518] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <div className="text-[#111518]" data-icon="Bell" data-size="20px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </div>
        </button>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User avatar'}
                width={40}
                height={40}
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              />
            ) : (
              <div className="bg-gray-300 rounded-full size-10"></div>
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link href="/profile/complete" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Complete Profile
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 
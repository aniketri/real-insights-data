'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link.');
      return;
    }

    // Validate invitation token
    validateInvite();
  }, [token, email]);

  const validateInvite = async () => {
    try {
      const response = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteData(data);
      } else {
        setError(data.message || 'Invalid or expired invitation.');
      }
    } catch (err) {
      setError('Failed to validate invitation.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account set up successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to set up account.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (error && !inviteData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F8F8]">
        <header className="fixed top-0 left-0 right-0 z-10 bg-[#F8F8F8]/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between border-b border-zinc-200 h-20">
              <Link href="/landing-page" className="flex items-center gap-4">
                <div className="size-5">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <span className="text-2xl font-semibold">Real Insights</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center mt-20">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-3xl font-bold text-zinc-900">Invalid Invitation</h2>
            <p className="text-red-600">{error}</p>
            <Link 
              href="/landing-page" 
              className="inline-block px-6 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
            >
              Go to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8]">
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#F8F8F8]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between border-b border-zinc-200 h-20">
            <Link href="/landing-page" className="flex items-center gap-4">
              <div className="size-5">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <span className="text-2xl font-semibold">Real Insights</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center mt-20">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900">Complete Your Setup</h2>
            {inviteData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  You've been invited to join <strong>{inviteData.organizationName}</strong>
                </p>
                <p className="text-sm text-blue-600">
                  Role: <strong>{inviteData.role}</strong>
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-zinc-700 sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-zinc-700 sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled
                value={email || ''}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-100 text-zinc-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                placeholder="Password (min. 8 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up account...' : 'Complete Setup'}
              </button>
            </div>
          </form>

          {error && (
            <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-center text-green-600 bg-green-100 p-3 rounded-md">
              {success}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
} 
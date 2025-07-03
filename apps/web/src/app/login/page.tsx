'use client';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const { data: session } = useSession();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
    });
  }

  const handleMicrosoftLogin = async () => {
    try {
      await signIn('azure-ad', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  };

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
            <nav className="flex items-center gap-6">
              <Link href="/signup" className="text-sm font-medium hover:text-zinc-600 transition-colors">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center mt-20">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-zinc-900">Welcome Back</h2>

          <div className="space-y-4">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full inline-flex items-center justify-center py-2 px-4 border border-zinc-300 rounded-md shadow-sm bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <svg className="mr-2 -ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              Continue with Google
            </button>
            <button
              onClick={handleMicrosoftLogin}
              className="w-full inline-flex items-center justify-center py-2 px-4 border border-zinc-300 rounded-md shadow-sm bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <svg className="mr-2 -ml-1 w-5 h-5" viewBox="0 0 2499.6 2500" xmlns="http://www.w3.org/2000/svg"><path d="m1187.9 1187.9h-1187.9v-1187.9h1187.9z" fill="#f1511b"/><path d="m2499.6 1187.9h-1188v-1187.9h1187.9v1187.9z" fill="#80cc28"/><path d="m1187.9 2500h-1187.9v-1187.9h1187.9z" fill="#00adef"/><path d="m2499.6 2500h-1188v-1187.9h1187.9v1187.9z" fill="#fbbc09"/></svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <div className="flex-1 h-px bg-zinc-300"></div>
            <p className="text-sm text-zinc-500">OR</p>
            <div className="flex-1 h-px bg-zinc-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
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
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                placeholder="Password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Sign in
              </button>
            </div>
          </form>

          {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">
            {error === 'CredentialsSignin' ? 'Invalid email or password.' : error === 'Callback' ? 'There was an issue with the authentication provider. Please check your OAuth configuration and redirect URIs in your Google Cloud Platform project. Ensure that http://localhost:3000/api/auth/callback/google is listed as an authorized redirect URI.' : `Error: ${error}`}
          </p>}

          {session && (
            <div className="text-center">
              <p className="text-sm text-zinc-600 mb-2">Already logged in as {session.user?.email}</p>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Sign out to create a different account
              </button>
            </div>
          )}
          
          <p className="text-sm text-center text-zinc-600">
            No account?{' '}
            <Link href="/signup" className="font-medium text-zinc-900 hover:text-zinc-700">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 
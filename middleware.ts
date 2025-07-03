import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/dashboard', '/loans', '/reports', '/settings', '/ai-query', '/onboarding', '/profile'];
  const authOnlyRoutes = ['/login', '/signup', '/landing-page', '/accept-invite', '/forgot-password', '/reset-password'];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => pathname.startsWith(route));

  // Handle root path
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/landing-page', req.url));
  }

  // If trying to access a protected route without a token, redirect to landing page
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/landing-page', req.url));
  }

  // If authenticated user tries to access auth-only pages, redirect to dashboard
  if (token && isAuthOnlyRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/loans/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/ai-query/:path*',
    '/onboarding/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
    '/accept-invite',
    '/landing-page',
    '/forgot-password',
    '/reset-password',
    '/',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/dashboard', '/loans', '/reports', '/settings', '/ai-query'];
  const publicOnlyRoutes = ['/landing-page', '/login', '/signup', '/accept-invite'];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

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

  // Allow authenticated users to access login/signup pages for logout functionality
  // Only redirect from landing page if authenticated, allow login/signup access
  if (token && pathname === '/landing-page') {
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
    '/login',
    '/signup',
    '/accept-invite',
    '/landing-page',
    '/',
  ],
}; 
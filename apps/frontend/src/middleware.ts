import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];
// Routes only for non-authenticated users
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookie or localStorage is not accessible in middleware
  // We use a simple cookie-based check here
  // The actual auth state is managed client-side via Zustand + localStorage
  // This middleware provides a basic server-side redirect

  // For this MVP, we rely on client-side auth checks in the dashboard layout
  // The middleware just handles basic routing logic

  // If user is on login page and has a token cookie, redirect to dashboard
  // Note: Since we're using localStorage for tokens (Zustand persist),
  // the real auth check happens client-side in the dashboard layout

  // Allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

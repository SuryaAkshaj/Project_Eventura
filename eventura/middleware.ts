import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ATTENDEE = ['/dashboard', '/events', '/certificates', '/my-tickets', '/profile'];
const PROTECTED_ORGANISER = ['/org'];
const PROTECTED_ADMIN = ['/admin'];
const PROTECTED_CREATOR = ['/creator'];

// Only /login redirects away when already authenticated.
// /signup stays accessible so users can create a second account or switch roles.
const REDIRECT_IF_AUTHENTICATED = ['/login'];

// Always accessible regardless of auth state
const ALWAYS_PUBLIC = [
  '/signup',
  '/forgot-password',
  '/certificates/verify',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('eventura-auth')?.value;
  const modeCookie = request.cookies.get('eventura-mode')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedAttendee = PROTECTED_ATTENDEE.some((p) => pathname.startsWith(p));
  const isProtectedOrganiser = PROTECTED_ORGANISER.some((p) => pathname.startsWith(p));
  const isProtectedAdmin = PROTECTED_ADMIN.some((p) => pathname.startsWith(p));
  const isProtectedCreator = PROTECTED_CREATOR.some((p) => pathname.startsWith(p));
  const isProtected = isProtectedAttendee || isProtectedOrganiser || isProtectedAdmin || isProtectedCreator;

  const isAlwaysPublic = ALWAYS_PUBLIC.some((p) => pathname.startsWith(p));
  const isRedirectIfAuth = REDIRECT_IF_AUTHENTICATED.some((p) => pathname.startsWith(p));

  // Always accessible — skip all checks
  if (isAlwaysPublic) return NextResponse.next();

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Mode-based routing: prevent Open Mode users from accessing /org/* and vice versa
  if (token) {
    if (pathname.startsWith('/creator') && modeCookie !== 'OPEN') {
      return NextResponse.redirect(new URL('/org/dashboard', request.url));
    }
    if (pathname.startsWith('/org') && modeCookie === 'OPEN') {
      return NextResponse.redirect(new URL('/creator/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from login page only
  if (isRedirectIfAuth && token) {
    if (modeCookie === 'OPEN') {
      return NextResponse.redirect(new URL('/creator/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|signup/verify-email|signup/pending-approval).*)',
  ],
};

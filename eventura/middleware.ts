import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ATTENDEE = ['/dashboard', '/events', '/certificates', '/my-tickets'];
const PROTECTED_ORGANISER = ['/org'];
const PROTECTED_ADMIN = ['/admin'];
const PUBLIC_ONLY = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('eventura-auth')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedAttendee = PROTECTED_ATTENDEE.some((p) => pathname.startsWith(p));
  const isProtectedOrganiser = PROTECTED_ORGANISER.some((p) => pathname.startsWith(p));
  const isProtectedAdmin = PROTECTED_ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = isProtectedAttendee || isProtectedOrganiser || isProtectedAdmin;
  const isPublicOnly = PUBLIC_ONLY.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public-only pages
  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signup/verify-email|signup/pending-approval).*)'],
};

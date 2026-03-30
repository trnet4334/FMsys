import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Keep in sync with config.matcher below — Next.js requires a static matcher,
// so any new protected prefix must be added to both lists.
const PROTECTED_PREFIXES = ['/dashboard', '/cashflow', '/allocation', '/reports', '/settings'];
const MFA_PATHS = new Set(['/mfa', '/mfa/setup']);

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function fetchSessionState(request: NextRequest): Promise<string | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4020';

  // Forward the full cookie header so fm_sid (and legacy fm_session_id) reach the API
  const cookieHeader = request.headers.get('cookie') ?? '';

  try {
    const res = await fetch(`${apiBase}/api/v1/auth/session`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.session?.session_state ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionState = await fetchSessionState(request);
  const isAuthenticated = sessionState === 'authenticated';
  const isPreMfa = sessionState === 'pre_mfa';
  const isMfaSetup = sessionState === 'mfa_setup';

  // Block protected routes
  if (isProtectedPath(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Guard /mfa — must be in pre_mfa state
  if (pathname === '/mfa' && !isPreMfa && !isAuthenticated && !isMfaSetup) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname === '/mfa' && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Route mfa_setup sessions to the setup page if they hit /mfa
  if (pathname === '/mfa' && isMfaSetup) {
    const url = request.nextUrl.clone();
    url.pathname = '/mfa/setup';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Guard /mfa/setup — must be in mfa_setup state
  if (pathname === '/mfa/setup' && !isMfaSetup && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/mfa',
    '/mfa/setup',
    '/dashboard/:path*',
    '/cashflow/:path*',
    '/allocation/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};

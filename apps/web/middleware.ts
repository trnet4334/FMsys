import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4020';

const PUBLIC_PATHS = new Set(['/login', '/register', '/verify-email', '/setup-password', '/forgot-password', '/reset-password']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and static assets
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Forward the fm_sid cookie to the API session check
  const cookieHeader = req.headers.get('cookie') ?? '';

  let sessionState: string | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/session`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      sessionState = data.session?.session_state ?? null;
    }
  } catch {
    // API unreachable — redirect to login
  }

  if (!sessionState) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (sessionState === 'pre_mfa') {
    if (pathname !== '/mfa') {
      return NextResponse.redirect(new URL('/mfa', req.url));
    }
    return NextResponse.next();
  }

  if (sessionState === 'mfa_setup') {
    if (pathname !== '/mfa/setup') {
      return NextResponse.redirect(new URL('/mfa/setup', req.url));
    }
    return NextResponse.next();
  }

  // authenticated — allow through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// ============================================================
// Next.js Edge Middleware
// - Security headers on all responses
// - Request ID injection
// ============================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-request-id': requestId,
      }),
    },
  });

  // ---- Route Guarding ----
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/bnpl', '/checkout', '/dashboard', '/admin'];
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const token = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (isProtected && !token && !refreshToken) {
    // Redirect to signin with return URL
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ---- Security Headers ----
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.paystack.co"
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  return response;
}

export const config = {
  matcher: [
    // Match all API routes and pages, skip static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = [
  '/orders',
  '/profile',
  '/cart',
  '/admin',
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  // Always check if IP is blocked for all routes (except /blocked itself)
  if (path !== '/blocked') {
    try {
      const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3333';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${apiUrl}/api/auth/check-ip?ip=${encodeURIComponent(ip)}`, { 
        cache: 'no-store',
        headers 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.blocked) {
          const blockedUrl = request.nextUrl.clone();
          blockedUrl.pathname = '/blocked';
          return NextResponse.rewrite(blockedUrl);
        }
      }
    } catch (e) {
      console.error('IP check failed in middleware', e);
    }
  }

  if (isProtected) {
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

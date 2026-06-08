import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = [
  '/home',
  '/collection',
  '/orders',
  '/profile',
  '/cart',
  '/admin',
  '/products',
  '/search',
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

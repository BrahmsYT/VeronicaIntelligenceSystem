import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('azcon_token')?.value;
  const role = request.cookies.get('azcon_role')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL(role === 'staff' ? '/staff' : '/dashboard', request.url));
  }

  if (pathname.startsWith('/staff')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    if (role !== 'staff' && role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/staff/:path*']
};

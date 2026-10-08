import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  // Only guard /admin routes, excluding the public /admin/login endpoint
  if (normalizedPath.startsWith('/admin') && normalizedPath !== '/admin/login') {
    const adminToken = request.cookies.get('medlab_access_token')?.value;

    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      if (normalizedPath !== '/admin') {
        loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};


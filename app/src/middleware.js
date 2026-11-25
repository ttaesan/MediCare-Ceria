import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rahasia_super_aman_rumah_sakit_2026'
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dokter') ||
    pathname.startsWith('/pasien');

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const role = payload.role;

      // Role-Based Access Control langsung dari Server Middleware
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      }
      if (pathname.startsWith('/dokter') && role !== 'dokter') {
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      }
      if (pathname.startsWith('/pasien') && role !== 'pasien') {
        return NextResponse.redirect(new URL(`/dashboard`, request.url));
      }
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/dokter/:path*', '/pasien/:path*'],
};

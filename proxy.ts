import { auth } from '@/lib/auth/authOptions';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    // If already logged in, redirect to appropriate dashboard
    if (session && pathname === '/login') {
      const role = session.user?.role;
      const redirectTo = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = session.user?.role;

  // Admin routes - require admin role
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/employee/dashboard', req.url));
  }

  // Employee routes - all authenticated users can access (admins can view employee panel too)
  if (pathname.startsWith('/employee') && !role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};

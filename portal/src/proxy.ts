import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/clinic-onboarding', '/get-app']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => p === '/' ? pathname === '/' : pathname.startsWith(p))

  // Access token API domaininde httpOnly cookie olarak durur.
  // Portal tarafında route guard için hassas olmayan oturum işareti kullanılır.
  const isAuthCookie = request.cookies.get('epati-logged-in')

  if (!isPublic && !isAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && pathname !== '/' && isAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}

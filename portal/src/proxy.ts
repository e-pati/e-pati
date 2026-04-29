import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // localStorage'a middleware'den erişemeyiz — cookie kontrolü yaparız
  // Token cookie'ye de yazılmıyor şu an, bu yüzden basit bir kontrol:
  // epati-auth zustand persist key'i localStorage'da — server'da kontrol edemeyiz
  // Çözüm: login sonrası bir httpOnly olmayan cookie set ederiz
  const isAuthCookie = request.cookies.get('epati-logged-in')

  if (!isPublic && !isAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && isAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}

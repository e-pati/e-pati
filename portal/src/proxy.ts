import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/clinic-onboarding',
  '/get-app',
  '/vatandas-giris',
  '/bakanlik',
  '/hayvancilik',
  '/belediye',
  '/demo-akisi',
]
const AUTH_PATHS = ['/login', '/clinic-onboarding']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => p === '/' ? pathname === '/' : pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path))

  // Bu işaret yalnızca erken navigasyon optimizasyonudur, yetkilendirme değildir.
  // Korumalı layout her açılışta API'deki httpOnly cookie'yi /auth/me ile doğrular.
  const isAuthCookie = request.cookies.get('epati-logged-in')?.value === '1'

  if (!isPublic && !isAuthCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Vatandaş demo ekranı ve uygulama sayfası, klinik oturumu açık olsa bile
  // sunum sırasında erişilebilir kalır.
  if (isAuthPage && isAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}

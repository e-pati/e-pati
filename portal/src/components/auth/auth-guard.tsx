'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { AUTH_SESSION_EXPIRED_EVENT, clearSessionMarker } from '@/lib/auth-session'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: string[]
  unauthorizedRedirect?: string
}

export function AuthGuard({
  children,
  allowedRoles,
  unauthorizedRedirect = '/dashboard',
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const verificationStarted = useRef(false)
  const { user, status, setChecking, setUser, clearUser } = useAuthStore()

  useEffect(() => {
    const redirectToLogin = () => {
      clearSessionMarker()
      clearUser()
      const next = pathname === '/dashboard' ? '' : `?next=${encodeURIComponent(pathname)}`
      router.replace(`/login${next}`)
    }

    const handleSessionExpired = () => redirectToLogin()
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)

    if (!verificationStarted.current) {
      verificationStarted.current = true
      setChecking()

      void authService.me()
        .then(currentUser => setUser(currentUser))
        .catch(() => redirectToLogin())
    }

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [clearUser, pathname, router, setChecking, setUser])

  useEffect(() => {
    if (
      status === 'authenticated'
      && user
      && allowedRoles
      && !allowedRoles.includes(user.role)
    ) {
      router.replace(unauthorizedRedirect)
    }
  }, [allowedRoles, router, status, unauthorizedRedirect, user])

  const roleAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false)

  if (status !== 'authenticated' || !user || !roleAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm text-muted-foreground shadow-sm">
          <ShieldCheck className="h-5 w-5 animate-pulse text-primary" />
          Oturum güvenli biçimde doğrulanıyor...
        </div>
      </div>
    )
  }

  return children
}

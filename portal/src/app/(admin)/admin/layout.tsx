'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Building2, LayoutDashboard, PawPrint, ShieldCheck, WalletCards } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin/dashboard', label: 'Admin Pano', icon: LayoutDashboard },
  { href: '/admin/clinics', label: 'Klinikler', icon: Building2 },
  { href: '/admin/revenue', label: 'Gelir', icon: WalletCards },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore(s => s.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (user && !isSuperAdmin) router.replace('/dashboard')
  }, [isSuperAdmin, router, user])

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 text-sm text-muted-foreground">
          Oturum bilgisi yükleniyor...
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 text-sm text-muted-foreground">
          Admin yetkisi gerekli. Panele yönlendiriliyorsunuz...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground leading-tight">VetCep Admin</div>
              <div className="text-[10px] text-muted-foreground leading-none">Sistem Yönetimi</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {adminNav.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground',
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Klinik Portalı
          </Link>
        </div>
      </header>

      <div className="px-6 py-4 md:hidden flex gap-2 overflow-x-auto">
        {adminNav.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap',
                active ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground border border-gray-100',
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      <main>{children}</main>

      <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-muted-foreground shadow-sm border border-gray-100">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        SUPER_ADMIN
      </div>
    </div>
  )
}

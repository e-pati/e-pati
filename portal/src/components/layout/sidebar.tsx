'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Stethoscope, Syringe, FlaskConical,
  Bell, Settings, LogOut, PawPrint, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { href: '/dashboard', label: 'Pano', icon: LayoutDashboard },
  { href: '/patients', label: 'Hastalar', icon: Users, badge: '247' },
  { href: '/examinations', label: 'Muayeneler', icon: Stethoscope },
  { href: '/vaccinations', label: 'Aşılar', icon: Syringe },
  { href: '/lab-results', label: 'Lab Sonuçları', icon: FlaskConical, badge: '3' },
  { href: '/notifications', label: 'Bildirimler', icon: Bell },
]

const bottomItems = [
  { href: '/settings', label: 'Ayarlar', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuthStore()

  const handleLogout = async () => {
    await authService.logout()
    clearUser()
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="bg-primary rounded-xl p-2 group-hover:scale-105 transition-transform">
            <PawPrint className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg text-foreground">e-Pati</span>
            <div className="text-[10px] text-muted-foreground leading-none">Klinik Portalı</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <item.icon className={cn(
                  'w-4.5 h-4.5 flex-shrink-0',
                  active ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80',
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 bg-primary/10 text-primary border-0">
                    {item.badge}
                  </Badge>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-sidebar-border space-y-0.5">
          {bottomItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0 text-sidebar-foreground/50" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Kullanıcı */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer group transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.fullName?.slice(0, 2).toUpperCase() ?? 'KL'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName ?? 'Kullanıcı'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.role === 'VETERINARIAN' ? 'Veteriner Hekim' : user?.role === 'CLINIC_ADMIN' ? 'Klinik Yöneticisi' : 'Kullanıcı'}
            </div>
          </div>
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors flex-shrink-0" />
        </button>
      </div>
    </aside>
  )
}

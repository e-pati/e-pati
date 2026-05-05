'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Stethoscope, Syringe, FlaskConical,
  Bell, Settings, LogOut, PawPrint, Pill, CreditCard, ShieldCheck, CalendarDays, ChartNoAxesCombined, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { useNotifications } from '@/hooks/use-notifications'

const navItems = [
  { href: '/dashboard', label: 'Pano', icon: LayoutDashboard },
  { href: '/patients', label: 'Hastalar', icon: Users },
  { href: '/appointments', label: 'Randevular', icon: CalendarDays },
  { href: '/examinations', label: 'Muayeneler', icon: Stethoscope },
  { href: '/vaccinations', label: 'Aşılar', icon: Syringe },
  { href: '/prescriptions', label: 'Reçeteler', icon: Pill },
  { href: '/lab-results', label: 'Lab Sonuçları', icon: FlaskConical },
  { href: '/analytics', label: 'Analitik', icon: ChartNoAxesCombined },
  { href: '/campaigns/lost-patients', label: 'Kampanyalar', icon: Megaphone },
  { href: '/notifications', label: 'Bildirimler', icon: Bell },
  { href: '/billing', label: 'Abonelik', icon: CreditCard },
]

const bottomItems = [
  { href: '/settings', label: 'Ayarlar', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuthStore()
  const notificationsQuery = useNotifications()
  const unreadCount = notificationsQuery.data?.filter(n => !n.isRead && !n.readAt).length ?? 0
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    await authService.logout()
    clearUser()
    router.push('/login')
  }

  const roleLabel = user?.role === 'VETERINARIAN'
    ? 'Veteriner Hekim'
    : user?.role === 'CLINIC_ADMIN'
      ? 'Klinik Yöneticisi'
      : 'Kullanıcı'

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:opacity-90 transition-opacity">
            <PawPrint className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground leading-tight">VetCep</div>
            <div className="text-[10px] text-muted-foreground leading-none">Klinik Portalı</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Menü</p>
          <div className="space-y-0.5">
            {navItems.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground',
                  )}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/notifications' && unreadCount > 0 && (
                    <Badge className="text-[9px] h-4 px-1.5 bg-destructive text-destructive-foreground border-0 min-w-4">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Sistem</p>
          <div className="space-y-0.5">
            {isSuperAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              >
                <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0" />
                Admin
              </Link>
            )}
            {bottomItems.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground',
                  )}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 cursor-pointer group transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {user?.fullName?.slice(0, 2).toUpperCase() ?? 'KL'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{user?.fullName ?? 'Kullanıcı'}</div>
            <div className="text-xs text-muted-foreground truncate">{roleLabel}</div>
          </div>
          <LogOut className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-destructive transition-colors flex-shrink-0" />
        </button>
      </div>
    </aside>
  )
}

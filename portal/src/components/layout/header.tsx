'use client'

import { useState } from 'react'
import { Search, Bell, Plus, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { QRScannerModal } from '@/components/shared/qr-scanner-modal'
import { useAuthStore } from '@/stores/auth.store'
import { useNotifications } from '@/hooks/use-notifications'
import { canAccessNotifications } from '@/services/notifications.service'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [qrOpen, setQrOpen] = useState(false)
  const user = useAuthStore(state => state.user)
  const notificationsQuery = useNotifications({
    enabled: canAccessNotifications(user?.role),
    subjectId: user?.id,
  })
  const unreadCount = notificationsQuery.data?.filter(item => !item.isRead && !item.readAt).length ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/patients?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-60">
          <Search className="absolute left-3.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hasta ara..."
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:border-primary/30 focus-visible:bg-white"
          />
        </form>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-slate-50 hover:text-foreground"
            onClick={() => setQrOpen(true)}
            title="QR Kod Tara"
          >
            <QrCode className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-slate-50 hover:text-foreground"
            onClick={() => router.push('/notifications')}
            aria-label={unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Bildirimleri görüntüle'}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 p-0 px-1 text-[9px] flex items-center justify-center bg-primary border-white border-2">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {action && (
            <Button
              size="sm"
              className="ml-1 h-9 gap-1.5 rounded-lg text-xs font-medium"
              onClick={action.onClick ?? (() => action.href && router.push(action.href))}
            >
              <Plus className="w-3.5 h-3.5" />
              {action.label}
            </Button>
          )}
        </div>
      </header>

      <QRScannerModal key={qrOpen ? 'open' : 'closed'} open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  )
}

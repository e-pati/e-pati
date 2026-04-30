'use client'

import { useState } from 'react'
import { Search, Bell, Plus, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { QRScannerModal } from '@/components/shared/qr-scanner-modal'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [qrOpen, setQrOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/patients?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 flex items-center px-6 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-64">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hasta ara..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:border focus-visible:border-border"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setQrOpen(true)}
            title="QR Kod Tara"
          >
            <QrCode className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 text-[9px] flex items-center justify-center bg-primary border-background border-2">
              3
            </Badge>
          </Button>

          {action && (
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={action.onClick ?? (() => action.href && router.push(action.href))}
            >
              <Plus className="w-4 h-4" />
              {action.label}
            </Button>
          )}
        </div>
      </header>

      <QRScannerModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  )
}

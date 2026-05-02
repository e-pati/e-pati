'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import {
  User, Lock, Bell, Shield, FileText, LogOut,
  ChevronRight, Building2, Info, Sun, Moon, Monitor,
} from 'lucide-react'
import { toast } from 'sonner'

interface SettingRow {
  icon: React.ElementType
  label: string
  description?: string
  badge?: string
  onClick?: () => void
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, clearUser } = useAuthStore()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await authService.logout()
    clearUser()
    toast.success('Çıkış yapıldı')
    router.push('/login')
  }

  const roleLabel = (role?: string) => {
    if (role === 'VETERINARIAN') return 'Veteriner Hekim'
    if (role === 'CLINIC_ADMIN') return 'Klinik Yöneticisi'
    if (role === 'SUPER_ADMIN') return 'Sistem Yöneticisi'
    return 'Kullanıcı'
  }

  const sections: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Hesap',
      rows: [
        {
          icon: User,
          label: 'Kişisel Bilgiler',
          description: user?.fullName ?? 'Ad soyad',
          onClick: () => toast.info('Yakında eklenecek'),
        },
        {
          icon: Lock,
          label: 'Şifre Değiştir',
          description: 'Güvenliğinizi güncel tutun',
          onClick: () => toast.info('Yakında eklenecek'),
        },
        {
          icon: Building2,
          label: 'Klinik Bilgileri',
          description: 'Klinik adı, adres, iletişim',
          onClick: () => toast.info('Yakında eklenecek'),
        },
      ],
    },
    {
      title: 'Bildirimler',
      rows: [
        {
          icon: Bell,
          label: 'Bildirim Tercihleri',
          description: 'Push, e-posta ve SMS ayarları',
          onClick: () => toast.info('Yakında eklenecek'),
        },
      ],
    },
    {
      title: 'Gizlilik ve Güvenlik',
      rows: [
        {
          icon: Shield,
          label: 'KVKK Ayarları',
          description: 'Veri işleme ve onay yönetimi',
          onClick: () => toast.info('Yakında eklenecek'),
        },
        {
          icon: FileText,
          label: 'Gizlilik Politikası',
          onClick: () => toast.info('Yakında eklenecek'),
        },
      ],
    },
    {
      title: 'Uygulama',
      rows: [
        {
          icon: Info,
          label: 'Versiyon',
          description: 'e-Pati Klinik Portalı v1.0.0',
          badge: 'Güncel',
        },
      ],
    },
  ]

  return (
    <div>
      <Header title="Ayarlar" />

      <div className="p-6 max-w-2xl space-y-6">

        {/* Görünüm */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Görünüm</h3>
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-muted-foreground" /> : theme === 'light' ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Monitor className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Tema</div>
                  <div className="text-xs text-muted-foreground">{theme === 'dark' ? 'Koyu' : theme === 'light' ? 'Açık' : 'Sistem'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {([
                  { value: 'light', icon: Sun, label: 'Açık' },
                  { value: 'system', icon: Monitor, label: 'Sistem' },
                  { value: 'dark', icon: Moon, label: 'Koyu' },
                ] as const).map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      theme === t.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <t.icon className="w-3 h-3" />
                    {t.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kullanıcı kartı */}
        <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-6" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">
                {user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'KL'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-white">{user?.fullName ?? 'Kullanıcı'}</div>
              <div className="text-sm text-primary-foreground/70">{user?.email ?? ''}</div>
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium text-white">
                {roleLabel(user?.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Ayar bölümleri */}
        {sections.map(section => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h3>
            <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
              {section.rows.map((row, i) => (
                <button
                  key={row.label}
                  onClick={row.onClick}
                  disabled={!row.onClick}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors
                    ${row.onClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
                    ${i < section.rows.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  <div className="p-2 rounded-xl bg-gray-100 flex-shrink-0">
                    <row.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{row.label}</div>
                    {row.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.description}</div>
                    )}
                  </div>
                  {row.badge ? (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {row.badge}
                    </Badge>
                  ) : row.onClick ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : null}
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Çıkış */}
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}

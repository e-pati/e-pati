'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications'
import { canAccessOwnerNotifications, type ApiNotification } from '@/services/notifications.service'
import { useAuthStore } from '@/stores/auth.store'

import { formatDate } from '@/lib/utils'
import { Bell, Check, Stethoscope, Syringe, FlaskConical, Clock } from 'lucide-react'
const typeConfig: Record<ApiNotification['type'], { icon: typeof Bell; color: string; bg: string }> = {
  examination: { icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
  vaccination: { icon: Syringe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  prescription: { icon: FlaskConical, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  lab: { icon: FlaskConical, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  reminder: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
}

export default function NotificationsPage() {
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => new Set())
  const user = useAuthStore(state => state.user)
  const ownerNotificationsAvailable = canAccessOwnerNotifications(user?.role)
  const notificationsQuery = useNotifications({
    enabled: ownerNotificationsAvailable,
    subjectId: user?.id,
  })
  const markRead = useMarkNotificationRead()
  const notifications = (notificationsQuery.data ?? []).map(notification => (
    localReadIds.has(notification.id) ? { ...notification, isRead: true } : notification
  ))

  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length

  const markAll = async () => {
    await Promise.all(notifications.filter(n => !isNotificationRead(n)).map(n => markRead.mutateAsync(n.id)))
  }

  const markOne = async (id: string) => {
    setLocalReadIds(prev => new Set(prev).add(id))
    await markRead.mutateAsync(id)
  }

  if (!ownerNotificationsAvailable) {
    return (
      <div>
        <Header
          title="Bildirimler"
          subtitle="Klinik bildirim kanalı entegrasyon bekliyor"
        />

        <div className="max-w-3xl p-6">
          <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Bell className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-foreground">Klinik bildirim servisi hazırlanıyor</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Mevcut bildirim servisi hayvan sahiplerine özeldir. Veteriner ve klinik bildirimleri,
              klinik yetkisiyle sınırlandırılmış ayrı backend sözleşmesi tamamlandığında burada gösterilecek.
            </p>
            <div className="mx-auto mt-5 max-w-lg rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left text-xs text-muted-foreground">
              Portal, sahip bildirim endpoint&apos;ini klinik hesabıyla çağırmaz; böylece yetkisiz istek ve
              yanıltıcı boş durum üretilmez.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Bildirimler"
        subtitle={unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tümü okundu'}
      />

      <div className="p-6 space-y-4 max-w-3xl">
        {notificationsQuery.isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Bildirimler alınamadı. Lütfen API bağlantısını kontrol edip tekrar deneyin.
          </div>
        )}

        {unreadCount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {unreadCount} okunmamış bildirim
            </div>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 text-xs" onClick={markAll} disabled={markRead.isPending}>
              <Check className="w-3.5 h-3.5" />
              Tümünü okundu işaretle
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-base font-medium">Bildirim yok</p>
            <p className="text-sm text-muted-foreground mt-1">Yeni işlemler geldiğinde burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const cfg = typeConfig[notif.type] ?? typeConfig.reminder
              const read = isNotificationRead(notif)
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md p-4 flex items-start gap-4 ${!read ? 'border-primary/20' : 'border-gray-100/50'}`}
                  onClick={() => { void markOne(notif.id) }}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`}>
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{formatDate(notificationDate(notif))}</span>
                          {!read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                </div>
              )
            })}
          </div>
        )}

        {notifications.some(isNotificationRead) && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            Bildirimler 90 gün sonra otomatik silinir
          </p>
        )}
      </div>
    </div>
  )
}

function isNotificationRead(notification: ApiNotification): boolean {
  return notification.isRead ?? Boolean(notification.readAt)
}

function notificationDate(notification: ApiNotification): string {
  return notification.sentAt ?? notification.createdAt ?? new Date().toISOString()
}

'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications'
import type { ApiNotification } from '@/services/notifications.service'

const mockNotifications: ApiNotification[] = [
  { id: 'n1', petId: '1', ownerId: 'o1', type: 'examination', title: 'Muayene Kaydedildi', message: "Pamuk'un muayene notları eklendi", sentAt: '2026-04-20T14:30:00', isRead: false },
  { id: 'n2', petId: '2', ownerId: 'o2', type: 'vaccination', title: 'Aşı Hatırlatması', message: "Karabaş'ın kuduz aşısı 10 gün içinde yapılmalı", sentAt: '2026-04-28T09:00:00', isRead: false },
  { id: 'n3', petId: '1', ownerId: 'o1', type: 'prescription', title: 'Yeni Reçete', message: "Pamuk için reçete oluşturuldu", sentAt: '2026-04-20T14:31:00', isRead: true },
]
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
  const [fallbackNotifications, setFallbackNotifications] = useState(mockNotifications)
  const notificationsQuery = useNotifications()
  const markRead = useMarkNotificationRead()
  const notifications = notificationsQuery.data ?? (notificationsQuery.isError ? fallbackNotifications : [])

  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length

  const markAll = async () => {
    if (notificationsQuery.isError) {
      setFallbackNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      return
    }
    await Promise.all(notifications.filter(n => !isNotificationRead(n)).map(n => markRead.mutateAsync(n.id)))
  }

  const markOne = async (id: string) => {
    if (notificationsQuery.isError) {
      setFallbackNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      return
    }
    await markRead.mutateAsync(id)
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
            API bildirimleri alınamadı; örnek bildirimler gösteriliyor.
          </div>
        )}

        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={markAll} disabled={markRead.isPending}>
              <Check className="w-3.5 h-3.5" />
              Tümünü okundu işaretle
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
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
                <Card
                  key={notif.id}
                  className={`border-border/50 cursor-pointer transition-all hover:shadow-sm ${!read ? 'border-primary/20 bg-primary/[0.02]' : ''}`}
                  onClick={() => { void markOne(notif.id) }}
                >
                  <CardContent className="p-4 flex items-start gap-4">
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
                  </CardContent>
                </Card>
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

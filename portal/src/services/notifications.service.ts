import { api } from '@/lib/api'

export type ApiNotificationType = 'examination' | 'vaccination' | 'prescription' | 'lab' | 'reminder'

export interface ApiNotification {
  id: string
  petId?: string
  ownerId?: string
  type: ApiNotificationType
  title: string
  message: string
  sentAt?: string
  createdAt?: string
  isRead?: boolean
  readAt?: string | null
}

interface NotificationApiRecord {
  id: string
  ownerId?: string
  title: string
  body?: string
  message?: string
  payload?: Record<string, unknown> | null
  status?: string
  sentAt?: string | null
  createdAt?: string
  readAt?: string | null
  isRead?: boolean
}

export interface NotificationPreferencesPayload {
  vaccinationReminders?: boolean
  examinationUpdates?: boolean
  prescriptionUpdates?: boolean
  labResultUpdates?: boolean
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

const notificationTypes: ApiNotificationType[] = [
  'examination',
  'vaccination',
  'prescription',
  'lab',
  'reminder',
]

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

function normalizeNotification(notification: NotificationApiRecord): ApiNotification {
  const payload = notification.payload ?? {}
  const payloadType = payload.type
  const type = typeof payloadType === 'string' && notificationTypes.includes(payloadType as ApiNotificationType)
    ? payloadType as ApiNotificationType
    : 'reminder'

  return {
    id: notification.id,
    ownerId: notification.ownerId,
    petId: typeof payload.petId === 'string' ? payload.petId : undefined,
    type,
    title: notification.title,
    message: notification.message ?? notification.body ?? '',
    sentAt: notification.sentAt ?? undefined,
    createdAt: notification.createdAt,
    isRead: notification.isRead ?? (notification.status === 'READ' || Boolean(notification.readAt)),
    readAt: notification.readAt,
  }
}

export function canAccessOwnerNotifications(role?: string): boolean {
  return role === 'OWNER'
}

export const notificationsService = {
  async getAll(): Promise<ApiNotification[]> {
    const { data } = await api.get<ListResponse<NotificationApiRecord>>('/notifications')
    return unwrapList(data).map(normalizeNotification)
  },

  async markRead(id: string): Promise<ApiNotification> {
    const { data } = await api.patch<NotificationApiRecord>(`/notifications/${id}/read`)
    return normalizeNotification(data)
  },

  async updatePreferences(payload: NotificationPreferencesPayload): Promise<void> {
    await api.post('/notifications/preferences', payload)
  },
}

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

export interface NotificationPreferencesPayload {
  vaccinationReminders?: boolean
  examinationUpdates?: boolean
  prescriptionUpdates?: boolean
  labResultUpdates?: boolean
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const notificationsService = {
  async getAll(): Promise<ApiNotification[]> {
    const { data } = await api.get<ListResponse<ApiNotification>>('/notifications')
    return unwrapList(data)
  },

  async markRead(id: string): Promise<ApiNotification> {
    const { data } = await api.patch<ApiNotification>(`/notifications/${id}/read`)
    return data
  },

  async updatePreferences(payload: NotificationPreferencesPayload): Promise<void> {
    await api.post('/notifications/preferences', payload)
  },
}

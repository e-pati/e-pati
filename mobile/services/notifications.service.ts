import { api } from '@/lib/api'

export interface ApiNotification {
  id: string
  petId?: string
  type: 'examination' | 'vaccination' | 'prescription' | 'lab' | 'reminder'
  title: string
  message: string
  sentAt?: string
  createdAt?: string
  isRead?: boolean
  readAt?: string | null
}

export interface NotificationPreferences {
  pushToken?: string
  enabled: boolean
  vaccinationAlerts: boolean
  medicationReminders: boolean
  appointmentReminders?: boolean
  campaignMessages?: boolean
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

  async registerPushToken(token: string): Promise<void> {
    await api.post('/notifications/preferences', { pushToken: token })
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await api.get<NotificationPreferences>('/notifications/preferences')
    return data
  },

  async updatePreferences(payload: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data } = await api.post<NotificationPreferences>('/notifications/preferences', payload)
    return data
  },
}

import { api } from '@/lib/api'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface ApiAppointment {
  id: string
  petId: string
  clinicId?: string
  startsAt: string
  endsAt?: string
  status: AppointmentStatus
  reason?: string
  notes?: string
  pet?: { id: string; name: string; species: string }
  clinic?: { id: string; name: string }
}

export interface CreateAppointmentRequest {
  petId: string
  clinicId?: string
  preferredDate: string
  preferredTime: string
  reason: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const appointmentsService = {
  async getAll(): Promise<ApiAppointment[]> {
    const { data } = await api.get<ListResponse<ApiAppointment>>('/appointments')
    return unwrapList(data)
  },

  async request(payload: CreateAppointmentRequest): Promise<ApiAppointment> {
    const { data } = await api.post<ApiAppointment>('/appointments/request', payload)
    return data
  },
}

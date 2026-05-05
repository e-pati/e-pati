import { api } from '@/lib/api'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Appointment {
  id: string
  petId: string
  clinicId?: string
  veterinarianId?: string
  scheduledAt?: string
  startsAt?: string
  endsAt?: string
  durationMinutes: number
  reason: string
  notes?: string
  status: AppointmentStatus
  notifyOwner?: boolean
  pet?: {
    id: string
    name: string
    species?: string
    owner?: {
      fullName?: string
      phone?: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateAppointmentPayload {
  petId: string
  scheduledAt: string
  durationMinutes: number
  reason: string
  notes?: string
  veterinarianId?: string
  notifyOwner?: boolean
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const appointmentsService = {
  async getAll(params?: { from?: string; to?: string }): Promise<Appointment[]> {
    const { data } = await api.get<ListResponse<Appointment>>('/appointments', { params })
    return unwrapList(data)
  },

  async getOne(id: string): Promise<Appointment> {
    const { data } = await api.get<Appointment>(`/appointments/${id}`)
    return data
  },

  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.post<Appointment>('/appointments', payload)
    return data
  },

  async confirm(id: string): Promise<Appointment> {
    const { data } = await api.post<Appointment>(`/appointments/${id}/confirm`)
    return data
  },

  async cancel(id: string): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' })
    return data
  },

  async complete(id: string): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(`/appointments/${id}`, { status: 'completed' })
    return data
  },
}

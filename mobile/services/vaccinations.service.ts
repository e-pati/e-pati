import { api } from '@/lib/api'

export interface ApiVaccination {
  id: string
  petId: string
  name: string
  lotNumber?: string
  appliedAt: string
  dueAt?: string
  notes?: string
  createdAt?: string
  clinic?: { id: string; name: string }
}

export interface VaccinationListParams {
  petId?: string
  page?: number
  limit?: number
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const vaccinationsService = {
  async getAll(params: VaccinationListParams = {}): Promise<ApiVaccination[]> {
    const { data } = await api.get<ListResponse<ApiVaccination>>('/vaccinations', { params })
    return unwrapList(data)
  },

  async getUpcoming(): Promise<ApiVaccination[]> {
    const { data } = await api.get<ListResponse<ApiVaccination>>('/vaccinations/upcoming')
    return unwrapList(data)
  },

  async create(payload: { petId: string; name: string; appliedAt: string; dueAt?: string; lotNumber?: string; notes?: string }): Promise<ApiVaccination> {
    const { data } = await api.post<ApiVaccination>('/vaccinations', payload)
    return data
  },
}

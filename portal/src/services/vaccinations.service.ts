import { api } from '@/lib/api'
import { localizeDemoClinicalText } from '@/lib/demo-clinical-localization'

export interface ApiVaccination {
  id: string
  petId: string
  vetId?: string
  name: string
  lotNumber?: string
  appliedAt: string
  dueAt?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateVaccinationPayload {
  petId: string
  name: string
  lotNumber?: string
  appliedAt: string
  dueAt?: string
  notes?: string
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

function normalizeVaccination(vaccination: ApiVaccination): ApiVaccination {
  return {
    ...vaccination,
    name: localizeDemoClinicalText(vaccination.name) ?? vaccination.name,
    notes: localizeDemoClinicalText(vaccination.notes),
  }
}

export const vaccinationsService = {
  async getAll(params: VaccinationListParams = {}): Promise<ApiVaccination[]> {
    const { data } = await api.get<ListResponse<ApiVaccination>>('/vaccinations', { params })
    return unwrapList(data).map(normalizeVaccination)
  },

  async getUpcoming(): Promise<ApiVaccination[]> {
    const { data } = await api.get<ListResponse<ApiVaccination>>('/vaccinations/upcoming')
    return unwrapList(data).map(normalizeVaccination)
  },

  async getOne(id: string): Promise<ApiVaccination> {
    const { data } = await api.get<ApiVaccination>(`/vaccinations/${id}`)
    return data
  },

  async create(payload: CreateVaccinationPayload): Promise<ApiVaccination> {
    const { data } = await api.post<ApiVaccination>('/vaccinations', payload)
    return data
  },

  async update(id: string, payload: Partial<CreateVaccinationPayload>): Promise<ApiVaccination> {
    const { data } = await api.patch<ApiVaccination>(`/vaccinations/${id}`, payload)
    return data
  },
}

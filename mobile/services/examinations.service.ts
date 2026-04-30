import { api } from '@/lib/api'

export interface ApiExamination {
  id: string
  petId: string
  vetId?: string
  complaint: string
  findings: string
  assessment: string
  plan: string
  followUpDate?: string
  createdAt: string
  updatedAt?: string
  date?: string
  vet?: {
    firstName?: string
    lastName?: string
    fullName?: string
    title?: string
  }
}

export interface ExaminationListParams {
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

export const examinationsService = {
  async getAll(params: ExaminationListParams = {}): Promise<ApiExamination[]> {
    const { data } = await api.get<ListResponse<ApiExamination>>('/examinations', { params })
    return unwrapList(data)
  },

  async create(payload: { petId: string; complaint: string; findings: string; assessment: string; plan: string }): Promise<ApiExamination> {
    const { data } = await api.post<ApiExamination>('/examinations', payload)
    return data
  },
}

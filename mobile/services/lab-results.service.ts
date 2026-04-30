import { api } from '@/lib/api'

export interface ApiLabResult {
  id: string
  petId: string
  testType: string
  fileUrl?: string
  comment?: string
  createdAt?: string
  date?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const labResultsService = {
  async getAll(params: { petId?: string } = {}): Promise<ApiLabResult[]> {
    const { data } = await api.get<ListResponse<ApiLabResult>>('/lab-results', { params })
    return unwrapList(data)
  },

  async create(payload: { petId: string; testType: string; fileUrl?: string; comment?: string }): Promise<ApiLabResult> {
    const { data } = await api.post<ApiLabResult>('/lab-results', payload)
    return data
  },
}

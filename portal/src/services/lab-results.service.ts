import { api } from '@/lib/api'

export interface ApiLabResult {
  id: string
  petId: string
  vetId?: string
  testType: string
  fileUrl?: string
  comment?: string
  createdAt?: string
  updatedAt?: string
  date?: string
}

export interface CreateLabResultPayload {
  petId: string
  testType: string
  fileUrl?: string
  comment?: string
}

export interface LabResultListParams {
  petId?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const labResultsService = {
  async getAll(params: LabResultListParams = {}): Promise<ApiLabResult[]> {
    const { data } = await api.get<ListResponse<ApiLabResult>>('/lab-results', { params })
    return unwrapList(data)
  },

  async getOne(id: string): Promise<ApiLabResult> {
    const { data } = await api.get<ApiLabResult>(`/lab-results/${id}`)
    return data
  },

  async create(payload: CreateLabResultPayload): Promise<ApiLabResult> {
    const { data } = await api.post<ApiLabResult>('/lab-results', payload)
    return data
  },

  getFileUrl(id: string): string {
    return `${api.defaults.baseURL}/lab-results/${id}/file`
  },
}

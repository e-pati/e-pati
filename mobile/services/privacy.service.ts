import { api } from '@/lib/api'

export interface PrivacyRequest {
  id: string
  type: string
  message?: string
  status?: string
  createdAt?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const privacyService = {
  async getRequests(): Promise<PrivacyRequest[]> {
    const { data } = await api.get<ListResponse<PrivacyRequest>>('/privacy/requests')
    return unwrapList(data)
  },

  async createRequest(payload: { type: string; message?: string }): Promise<PrivacyRequest> {
    const { data } = await api.post<PrivacyRequest>('/privacy/requests', payload)
    return data
  },
}

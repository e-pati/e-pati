import { api } from '@/lib/api'

export interface ApiMedication {
  id?: string
  name: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export interface ApiPrescription {
  id: string
  petId?: string
  examinationId?: string
  medications: ApiMedication[]
  notes?: string
  createdAt?: string
  date?: string
  vet?: {
    firstName?: string
    lastName?: string
    fullName?: string
    title?: string
  }
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const prescriptionsService = {
  async getAll(params: { petId?: string } = {}): Promise<ApiPrescription[]> {
    const { data } = await api.get<ListResponse<ApiPrescription>>('/prescriptions', { params })
    return unwrapList(data)
  },
}

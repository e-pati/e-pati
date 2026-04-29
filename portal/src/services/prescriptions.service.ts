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
  vetId?: string
  medications: ApiMedication[]
  notes?: string
  createdAt?: string
  updatedAt?: string
  date?: string
}

export interface CreatePrescriptionPayload {
  petId: string
  examinationId?: string
  medications: ApiMedication[]
  notes?: string
}

export interface PrescriptionListParams {
  petId?: string
  examinationId?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const prescriptionsService = {
  async getAll(params: PrescriptionListParams = {}): Promise<ApiPrescription[]> {
    const { data } = await api.get<ListResponse<ApiPrescription>>('/prescriptions', { params })
    return unwrapList(data)
  },

  async getOne(id: string): Promise<ApiPrescription> {
    const { data } = await api.get<ApiPrescription>(`/prescriptions/${id}`)
    return data
  },

  async create(payload: CreatePrescriptionPayload): Promise<ApiPrescription> {
    const { data } = await api.post<ApiPrescription>('/prescriptions', payload)
    return data
  },

  getPdfUrl(id: string): string {
    return `${api.defaults.baseURL}/prescriptions/${id}/pdf`
  },
}

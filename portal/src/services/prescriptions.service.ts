import { api } from '@/lib/api'
import { localizeDemoClinicalText } from '@/lib/demo-clinical-localization'

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
  page?: number
  limit?: number
}

export interface PrescriptionPdfResponse {
  prescriptionId: string
  url: string | null
  status: 'ready' | 'pending_pdf_generation'
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

function normalizePrescription(prescription: ApiPrescription): ApiPrescription {
  return {
    ...prescription,
    notes: localizeDemoClinicalText(prescription.notes),
    medications: prescription.medications.map(medication => ({
      ...medication,
      name: localizeDemoClinicalText(medication.name) ?? medication.name,
      frequency: localizeDemoClinicalText(medication.frequency) ?? medication.frequency,
      duration: localizeDemoClinicalText(medication.duration) ?? medication.duration,
      instructions: localizeDemoClinicalText(medication.instructions),
    })),
  }
}

export const prescriptionsService = {
  async getAll(params: PrescriptionListParams = {}): Promise<ApiPrescription[]> {
    const { data } = await api.get<ListResponse<ApiPrescription>>('/prescriptions', {
      params: { limit: 100, ...params },
    })
    return unwrapList(data).map(normalizePrescription)
  },

  async getOne(id: string): Promise<ApiPrescription> {
    const { data } = await api.get<ApiPrescription>(`/prescriptions/${id}`)
    return data
  },

  async create(payload: CreatePrescriptionPayload): Promise<ApiPrescription> {
    const { data } = await api.post<ApiPrescription>('/prescriptions', payload)
    return data
  },

  async getPdfStatus(id: string): Promise<PrescriptionPdfResponse> {
    const { data } = await api.get<PrescriptionPdfResponse>(`/prescriptions/${id}/pdf`)
    return data
  },
}

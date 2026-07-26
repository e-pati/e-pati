import { api } from '@/lib/api'
import { localizeDemoClinicalText } from '@/lib/demo-clinical-localization'

export interface ApiExamination {
  id: string
  petId: string
  vetId?: string
  veterinarianId?: string
  complaint: string
  findings: string
  assessment: string
  plan: string
  followUpDate?: string
  createdAt: string
  updatedAt?: string
  date?: string
  vet?: {
    id: string
    firstName?: string
    lastName?: string
    fullName?: string
    title?: string
  }
}

export interface CreateExaminationPayload {
  petId: string
  complaint: string
  findings: string
  assessment: string
  plan: string
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

function normalizeExamination(examination: ApiExamination): ApiExamination {
  return {
    ...examination,
    complaint: localizeDemoClinicalText(examination.complaint) ?? examination.complaint,
    findings: localizeDemoClinicalText(examination.findings) ?? examination.findings,
    assessment: localizeDemoClinicalText(examination.assessment) ?? examination.assessment,
    plan: localizeDemoClinicalText(examination.plan) ?? examination.plan,
  }
}

export const examinationsService = {
  async getAll(params: ExaminationListParams = {}): Promise<ApiExamination[]> {
    const { data } = await api.get<ListResponse<ApiExamination>>('/examinations', { params })
    return unwrapList(data).map(normalizeExamination)
  },

  async getOne(id: string): Promise<ApiExamination> {
    const { data } = await api.get<ApiExamination>(`/examinations/${id}`)
    return data
  },

  async create(payload: CreateExaminationPayload): Promise<ApiExamination> {
    const { data } = await api.post<ApiExamination>('/examinations', payload)
    return data
  },

  async update(id: string, payload: Partial<CreateExaminationPayload>): Promise<ApiExamination> {
    const { data } = await api.patch<ApiExamination>(`/examinations/${id}`, payload)
    return data
  },
}

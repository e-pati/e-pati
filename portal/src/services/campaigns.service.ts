import { api } from '@/lib/api'

export type CampaignChannel = 'whatsapp' | 'sms'

export interface LostPatientCampaignCandidate {
  id: string
  petId: string
  petName: string
  ownerName?: string
  ownerPhone?: string
  lastVisitAt?: string
  daysSinceLastVisit?: number
  riskScore?: number
  suggestedChannel?: CampaignChannel
}

export interface CampaignPreviewPayload {
  candidateIds: string[]
  channel: CampaignChannel
  message: string
}

export interface CampaignPreview {
  recipientCount?: number
  estimatedRecipients?: number
  estimatedCost?: number
  message?: string
  previewText?: string
}

export interface CampaignSendResponse {
  campaignId: string
  queuedCount?: number
  sentCount?: number
}

export interface CampaignResults {
  candidateCount: number
  sentCount: number
  deliveredCount?: number
  openedCount?: number
  returnedPatientCount: number
  appointmentRequestCount?: number
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const campaignsService = {
  async getLostPatientCandidates(): Promise<LostPatientCampaignCandidate[]> {
    const { data } = await api.get<ListResponse<LostPatientCampaignCandidate>>('/campaigns/lost-patients/candidates')
    return unwrapList(data)
  },

  async previewLostPatients(payload: CampaignPreviewPayload): Promise<CampaignPreview> {
    assertSelectedCandidates(payload.candidateIds)
    const { data } = await api.post<CampaignPreview>('/campaigns/lost-patients/preview', payload)
    return data
  },

  async sendLostPatients(payload: CampaignPreviewPayload): Promise<CampaignSendResponse> {
    assertSelectedCandidates(payload.candidateIds)
    const { data } = await api.post<CampaignSendResponse>('/campaigns/lost-patients/send', payload)
    return data
  },

  async getResults(campaignId: string): Promise<CampaignResults> {
    const { data } = await api.get<CampaignResults>(`/campaigns/${campaignId}/results`)
    return data
  },
}

function assertSelectedCandidates(candidateIds: string[]) {
  if (candidateIds.length === 0) {
    throw new Error('Kampanya göndermek için en az bir hasta seçilmelidir.')
  }
}

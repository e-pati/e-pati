import { api } from '@/lib/api'

export type WhatsAppTemplateType = 'exam_summary' | 'vaccine_reminder' | 'appointment_reminder' | 'custom'

export interface SendWhatsAppPayload {
  petId: string
  ownerPhone: string
  type: WhatsAppTemplateType
  message: string
}

export interface SendWhatsAppResponse {
  id: string
  status: 'queued' | 'sent' | 'failed'
}

export interface WhatsAppTemplateStatus {
  key: WhatsAppTemplateType
  name?: string
  status: 'approved' | 'pending' | 'rejected' | 'missing'
}

export interface WhatsAppStatus {
  connected: boolean
  phoneNumber?: string
  businessName?: string
  templates?: WhatsAppTemplateStatus[]
}

export interface ConnectWhatsAppPayload {
  phoneNumber: string
}

export interface SendWhatsAppTestPayload {
  phoneNumber: string
  template: WhatsAppTemplateType
}

export const whatsappService = {
  async getStatus(): Promise<WhatsAppStatus> {
    const { data } = await api.get<WhatsAppStatus>('/whatsapp/status')
    return data
  },

  async connect(payload: ConnectWhatsAppPayload): Promise<WhatsAppStatus> {
    const { data } = await api.post<WhatsAppStatus>('/whatsapp/connect', payload)
    return data
  },

  async send(payload: SendWhatsAppPayload): Promise<SendWhatsAppResponse> {
    const { data } = await api.post<SendWhatsAppResponse>('/whatsapp/messages', payload)
    return data
  },

  async sendTest(payload: SendWhatsAppTestPayload): Promise<SendWhatsAppResponse> {
    const { data } = await api.post<SendWhatsAppResponse>('/whatsapp/test', payload)
    return data
  },
}

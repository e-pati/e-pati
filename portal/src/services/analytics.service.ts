import { api } from '@/lib/api'

export interface ClinicAnalyticsSummary {
  lostPatientRisk: number
  activePatients: number
  busiestHour?: string
  revisitRate?: number
}

export interface LostPatientCandidate {
  id: string
  petName: string
  ownerName?: string
  lastVisitAt?: string
  riskScore?: number
}

export interface TopMedication {
  name: string
  count: number
}

export interface BusyHour {
  hour: string
  count: number
}

export interface VisitTrendPoint {
  label: string
  visits: number
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const analyticsService = {
  async getClinicSummary(): Promise<ClinicAnalyticsSummary> {
    const { data } = await api.get<ClinicAnalyticsSummary>('/analytics/clinic/summary')
    return data
  },

  async getLostPatients(): Promise<LostPatientCandidate[]> {
    const { data } = await api.get<ListResponse<LostPatientCandidate>>('/analytics/lost-patients')
    return unwrapList(data)
  },

  async getTopMedications(): Promise<TopMedication[]> {
    const { data } = await api.get<ListResponse<TopMedication>>('/analytics/top-medications')
    return unwrapList(data)
  },

  async getBusyHours(): Promise<BusyHour[]> {
    const { data } = await api.get<ListResponse<BusyHour>>('/analytics/busy-hours')
    return unwrapList(data)
  },

  async getVisitTrend(): Promise<VisitTrendPoint[]> {
    const { data } = await api.get<ListResponse<VisitTrendPoint>>('/analytics/visit-trend')
    return unwrapList(data)
  },
}

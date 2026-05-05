import { api } from '@/lib/api'

export interface AdminDashboardMetrics {
  totalClinics: number
  activeSubscriptions: number
  mrr: number
  churnThisMonth: number
  trialing?: number
  newThisMonth?: number
}

export interface AdminRevenuePoint {
  month: string
  mrr: number
}

export interface AdminRevenueSummary {
  mrr: number
  arr?: number
  successfulPayments: number
  invoiceCount: number
}

export interface AdminDashboardResponse {
  metrics: AdminDashboardMetrics
  revenueTrend?: AdminRevenuePoint[]
}

export interface AdminClinic {
  id: string
  name: string
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  city?: string
  district?: string
  address?: string
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'canceled'
  subscriptionPlan?: string
  trialEndsAt?: string
  currentPeriodEndsAt?: string
  mrr?: number
  totalPatients?: number
  totalAppointments?: number
  lastLoginAt?: string
  createdAt?: string
}

type ListResponse<T> = T[] | { data: T[] } | { items: T[] }

function unwrapList<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.items
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await api.get<AdminDashboardResponse>('/admin/dashboard')
    return data
  },

  async getClinics(): Promise<AdminClinic[]> {
    const { data } = await api.get<ListResponse<AdminClinic>>('/admin/clinics')
    return unwrapList(data)
  },

  async getClinic(id: string): Promise<AdminClinic> {
    const { data } = await api.get<AdminClinic>(`/admin/clinics/${id}`)
    return data
  },

  async getRevenueSummary(): Promise<AdminRevenueSummary> {
    const { data } = await api.get<AdminRevenueSummary>('/admin/revenue/summary')
    return data
  },

  async getRevenueMonthly(): Promise<AdminRevenuePoint[]> {
    const { data } = await api.get<ListResponse<AdminRevenuePoint>>('/admin/revenue/monthly')
    return unwrapList(data)
  },
}

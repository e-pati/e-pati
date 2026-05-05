import { api } from '@/lib/api'

export interface OwnerPremiumPlan {
  id: string
  name: string
  priceMonthly: number
  currency: string
  trialDays?: number
  features: string[]
}

export interface OwnerPremiumStatus {
  isActive: boolean
  plan?: OwnerPremiumPlan
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export interface OwnerPremiumCheckout {
  checkoutUrl?: string
  hostedUrl?: string
  formToken?: string
  token?: string
  expiresAt?: string
}

export const ownerPremiumService = {
  async getStatus(): Promise<OwnerPremiumStatus> {
    const { data } = await api.get<OwnerPremiumStatus>('/owner-subscriptions/current')
    return data
  },

  async createCheckout(planId = 'owner-premium-monthly'): Promise<OwnerPremiumCheckout> {
    const { data } = await api.post<OwnerPremiumCheckout>('/owner-subscriptions/checkout', { planId })
    return data
  },

  async cancelAtPeriodEnd(): Promise<OwnerPremiumStatus> {
    const { data } = await api.post<OwnerPremiumStatus>('/owner-subscriptions/cancel')
    return data
  },

  async resume(): Promise<OwnerPremiumStatus> {
    const { data } = await api.post<OwnerPremiumStatus>('/owner-subscriptions/resume')
    return data
  },
}

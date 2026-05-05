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
}

export interface OwnerPremiumCheckout {
  checkoutUrl?: string
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
}

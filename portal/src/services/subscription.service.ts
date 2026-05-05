import { api } from '@/lib/api'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'none'
export type SubscriptionPlan = 'monthly' | 'yearly'

export interface ApiSubscription {
  id?: string
  clinicId?: string
  status: SubscriptionStatus
  plan?: SubscriptionPlan
  trialEndsAt?: string
  currentPeriodEndsAt?: string
  cancelAtPeriodEnd?: boolean
}

export interface CheckoutSessionPayload {
  plan: SubscriptionPlan
  successUrl?: string
  cancelUrl?: string
}

export interface CheckoutSession {
  checkoutUrl?: string
  formToken?: string
}

export const subscriptionService = {
  async getCurrent(): Promise<ApiSubscription> {
    const { data } = await api.get<ApiSubscription>('/subscription/current')
    return data
  },

  async createCheckoutSession(payload: CheckoutSessionPayload): Promise<CheckoutSession> {
    const { data } = await api.post<CheckoutSession>('/billing/checkout', payload)
    return data
  },

  async cancelAtPeriodEnd(): Promise<ApiSubscription> {
    const { data } = await api.post<ApiSubscription>('/subscription/cancel')
    return data
  },

  async resume(): Promise<ApiSubscription> {
    const { data } = await api.post<ApiSubscription>('/subscription/resume')
    return data
  },
}

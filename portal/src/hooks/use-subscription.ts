'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  subscriptionService,
  type CheckoutSessionPayload,
  type SubscriptionStatus,
} from '@/services/subscription.service'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionService.getCurrent,
    retry: 1,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (payload: CheckoutSessionPayload) => subscriptionService.createCheckoutSession(payload),
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subscriptionService.cancelAtPeriodEnd,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  })
}

export function useResumeSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: subscriptionService.resume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  })
}

export function isSubscriptionUsable(status?: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

export function getTrialDaysLeft(trialEndsAt?: string): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

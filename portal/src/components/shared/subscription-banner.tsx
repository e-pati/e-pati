'use client'

import Link from 'next/link'
import { AlertTriangle, CalendarClock, CreditCard } from 'lucide-react'
import { useSubscription, getTrialDaysLeft } from '@/hooks/use-subscription'

export function SubscriptionBanner() {
  const subscriptionQuery = useSubscription()
  const subscription = subscriptionQuery.data

  if (subscriptionQuery.isLoading) return null

  if (subscriptionQuery.isError) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-sm text-amber-800 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">Abonelik durumu alınamadı. Backend endpointi bekleniyor.</span>
        <Link href="/billing" className="text-xs font-semibold hover:underline">Abonelik</Link>
      </div>
    )
  }

  if (!subscription || subscription.status === 'active') return null

  const daysLeft = getTrialDaysLeft(subscription.trialEndsAt)
  const isTrialing = subscription.status === 'trialing'
  const isBlocked = subscription.status === 'past_due' || subscription.status === 'canceled' || subscription.status === 'none'

  return (
    <div className={`border-b px-6 py-2.5 text-sm flex items-center gap-2 ${
      isBlocked
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-primary/20 bg-primary/5 text-primary'
    }`}>
      {isBlocked ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CalendarClock className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">
        {isTrialing
          ? `Deneme süreniz${daysLeft === null ? '' : ` ${daysLeft} gün sonra`} sona erecek.`
          : 'Aboneliğiniz aktif değil. Klinik erişimini sürdürmek için aboneliği başlatın.'
        }
      </span>
      <Link href="/billing" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">
        <CreditCard className="w-3.5 h-3.5" />
        Aboneliği Yönet
      </Link>
    </div>
  )
}

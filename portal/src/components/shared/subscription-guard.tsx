'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, CreditCard, LockKeyhole } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { isSubscriptionUsable, useSubscription } from '@/hooks/use-subscription'

const allowedWhenBlocked = ['/billing', '/settings', '/notifications']

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const subscriptionQuery = useSubscription()
  const subscription = subscriptionQuery.data

  const isAllowedPath = allowedWhenBlocked.some(path => pathname.startsWith(path))
  const shouldBlock = subscription
    && !isSubscriptionUsable(subscription.status)
    && !isAllowedPath

  if (subscriptionQuery.isLoading || subscriptionQuery.isError || !shouldBlock) {
    return children
  }

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <LockKeyhole className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Abonelik gerekli</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Klinik portalını kullanmaya devam etmek için aboneliği aktifleştirmeniz gerekiyor.
          Ödeme ve ayarlar ekranları açık kalır.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          Durum: {subscription.status}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/billing" className={buttonVariants({ className: 'gap-2' })}>
            <CreditCard className="h-4 w-4" />
            Aboneliği Aktifleştir
          </Link>
          <Link href="/settings" className={buttonVariants({ variant: 'outline' })}>
            Ayarlara Git
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CalendarClock, Check, CreditCard, FileCheck2, RotateCcw, ShieldCheck, Sparkles, XCircle,
} from 'lucide-react'
import {
  getTrialDaysLeft,
  useCancelSubscription,
  useResumeSubscription,
  useSubscription,
} from '@/hooks/use-subscription'
import type { SubscriptionStatus } from '@/services/subscription.service'

const monthlyPrice = 1500
const yearlyPrice = 16500

const planFeatures = [
  'Sınırsız hasta ve sahip kaydı',
  'Muayene, aşı, reçete ve lab arşivi',
  'R2 dosya yükleme ve güvenli indirme',
  'Mobil uygulama bildirimleri',
  'Klinik portalı ekip kullanımı',
]

const statusLabel: Record<SubscriptionStatus, string> = {
  trialing: 'Deneme',
  active: 'Aktif',
  past_due: 'Gecikmiş',
  canceled: 'İptal',
  none: 'Yok',
}

export default function BillingPage() {
  const subscriptionQuery = useSubscription()
  const cancelSubscription = useCancelSubscription()
  const resumeSubscription = useResumeSubscription()
  const subscription = subscriptionQuery.data
  const daysLeft = getTrialDaysLeft(subscription?.trialEndsAt)
  const canManageSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'

  const handleCancel = async () => {
    try {
      await cancelSubscription.mutateAsync()
      toast.success('Abonelik dönem sonunda iptal edilecek')
    } catch {
      toast.error('Abonelik iptal endpointi henüz hazır değil')
    }
  }

  const handleResume = async () => {
    try {
      await resumeSubscription.mutateAsync()
      toast.success('Abonelik yenilemesi sürdürülecek')
    } catch {
      toast.error('Abonelik sürdürme endpointi henüz hazır değil')
    }
  }

  return (
    <div>
      <Header title="Abonelik" subtitle="Deneme süreci ve VetCep Klinik planı" />

      <div className="p-6 space-y-6 max-w-6xl">
        <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-5">
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute right-0 top-0 w-44 h-44 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
            <div className="relative z-10 max-w-2xl">
              <Badge className="bg-white/15 text-white border-white/20 mb-4">
                14 gün ücretsiz deneme
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight">Kart bilgisi istemeden başlayın.</h2>
              <p className="mt-2 text-sm text-primary-foreground/75 leading-relaxed">
                Klinik hesabı aktif olduğunda deneme süreci başlar. Deneme sonunda abonelik
                aktifleştirilmezse portal erişimi ödeme ekranına yönlendirilir.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Kurulum yok', 'Anında kullanım', 'Türkiye odaklı fiyatlama'].map(item => (
                  <span key={item} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Deneme durumu</p>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionQuery.isLoading ? 'Abonelik durumu yükleniyor' : 'GET /subscription/current'}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="text-3xl font-bold text-foreground">
                  {subscriptionQuery.isError
                    ? '14 gün'
                    : daysLeft !== null
                      ? `${daysLeft} gün`
                      : statusLabel[subscription?.status ?? 'none']}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscriptionQuery.isError
                    ? 'Abonelik endpointi bekleniyor; hedef deneme süresi gösteriliyor.'
                    : subscription?.trialEndsAt
                      ? 'Deneme süresinde kalan gün.'
                      : 'Mevcut abonelik durumu.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Aylık</Badge>
                  <h3 className="mt-4 text-lg font-bold text-foreground">VetCep Klinik</h3>
                  <p className="text-sm text-muted-foreground mt-1">Küçük ve orta ölçekli klinikler için.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">₺{monthlyPrice.toLocaleString('tr-TR')}</div>
                  <p className="text-xs text-muted-foreground">/ ay</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {planFeatures.map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href="/billing/checkout?plan=monthly"
                className="mt-6 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CreditCard className="w-4 h-4" />
                Checkout akışını görüntüle
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border-primary/20 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-primary text-primary-foreground">En iyi değer</Badge>
                  <h3 className="mt-4 text-lg font-bold text-foreground">Yıllık Klinik</h3>
                  <p className="text-sm text-muted-foreground mt-1">2 ay bedava olacak şekilde fiyatlandı.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">₺{yearlyPrice.toLocaleString('tr-TR')}</div>
                  <p className="text-xs text-muted-foreground">/ yıl</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Sparkles, label: '2 ay avantaj' },
                  { icon: ShieldCheck, label: 'KVKK odaklı' },
                  { icon: FileCheck2, label: 'Fatura akışı' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-primary/5 p-3 text-center">
                    <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium text-primary">{item.label}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/billing/checkout?plan=yearly"
                className="mt-6 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CreditCard className="w-4 h-4" />
                Checkout akışını görüntüle
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Abonelik yönetimi</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aktif abonelikte dönem sonu iptal veya iptali geri alma kontratları hazır.
              </p>
              {subscription?.currentPeriodEndsAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mevcut dönem bitişi: {new Date(subscription.currentPeriodEndsAt).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {subscription?.cancelAtPeriodEnd ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleResume}
                  disabled={resumeSubscription.isPending}
                >
                  <RotateCcw className="w-4 h-4" />
                  Yenilemeyi Sürdür
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleCancel}
                  disabled={!canManageSubscription || cancelSubscription.isPending}
                >
                  <XCircle className="w-4 h-4" />
                  Dönem Sonunda İptal Et
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <h3 className="text-sm font-semibold text-foreground">Backend kontratı</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Bu ekran hazır. Canlı ödeme için Erol tarafında abonelik durumu, deneme tarihi ve iyzico checkout
            başlatma endpointleri bekleniyor.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {['GET /subscription/current', 'POST /billing/checkout', 'POST /subscription/cancel', 'POST /subscription/resume', 'POST /billing/webhook'].map(endpoint => (
              <code key={endpoint} className="rounded-lg bg-gray-50 px-2.5 py-1 font-mono">
                {endpoint}
              </code>
            ))}
          </div>
          <Link
            href="/settings"
            className="mt-5 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            Klinik ayarlarına dön
          </Link>
        </section>
      </div>
    </div>
  )
}

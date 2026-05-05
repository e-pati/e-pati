'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, CreditCard, LockKeyhole, ReceiptText, RotateCcw } from 'lucide-react'
import { useCreateCheckoutSession } from '@/hooks/use-subscription'
import type { SubscriptionPlan } from '@/services/subscription.service'

const checkoutSteps = [
  { label: 'Plan secimi', status: 'Hazir' },
  { label: 'iyzico checkout session', status: 'Backend bekleniyor' },
  { label: 'Odeme sonucu', status: 'Webhook bekleniyor' },
]

export default function BillingCheckoutPage() {
  return (
    <Suspense>
      <BillingCheckoutContent />
    </Suspense>
  )
}

function BillingCheckoutContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const createCheckout = useCreateCheckoutSession()
  const isYearly = plan === 'yearly'
  const price = isYearly ? '₺16.500' : '₺1.500'
  const period = isYearly ? 'Yıllık' : 'Aylık'

  const startCheckout = async (selectedPlan: SubscriptionPlan) => {
    try {
      const origin = window.location.origin
      const session = await createCheckout.mutateAsync({
        plan: selectedPlan,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/billing/cancel`,
      })
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl
        return
      }
      toast.success('Checkout session oluşturuldu', {
        description: session.formToken ? 'iyzico formToken alındı; embed alanına bağlanmaya hazır.' : undefined,
      })
    } catch {
      toast.error('Checkout endpointi henüz hazır değil', {
        description: 'POST /billing/checkout geldiğinde bu buton canlı ödeme akışını başlatacak.',
      })
    }
  }

  return (
    <div>
      <Header title="Ödeme Akışı" subtitle="iyzico checkout entegrasyonu hazırlığı" />

      <div className="p-6 space-y-6 max-w-5xl">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <Badge className="bg-primary/10 text-primary border-0 mb-4">Checkout hazırlığı</Badge>
          <h1 className="text-2xl font-bold text-foreground">VetCep Klinik aboneliği</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Bu sayfa ödeme deneyiminin son adımı için hazırlandı. Canlı kart formu iyzico session
            endpointi geldiğinde burada açılacak.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {checkoutSteps.map((step, index) => (
              <div key={step.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-sm font-bold text-primary mb-3">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{step.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Sipariş özeti</h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium text-foreground">VetCep Klinik · {period}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deneme</span>
                  <span className="font-medium text-foreground">14 gün ücretsiz</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isYearly ? 'Yıllık ücret' : 'Aylık ücret'}</span>
                  <span className="font-medium text-foreground">{price}</span>
                </div>
              </div>
              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Bugün ödenecek</span>
                  <span className="text-2xl font-bold text-primary">₺0</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Kart bilgisi deneme sonunda istenecek.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Güvenli ödeme alanı</h2>
                  <p className="text-xs text-muted-foreground">iyzico embedded checkout burada render edilecek.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <LockKeyhole className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Checkout session bekleniyor</p>
                <p className="text-xs text-muted-foreground mt-1">
                  `POST /billing/checkout` yanıtındaki form token veya hosted URL bu alana bağlanacak.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: CheckCircle2, label: '3D Secure hazır' },
                  { icon: ReceiptText, label: 'Fatura akışı' },
                  { icon: RotateCcw, label: 'İptal takibi' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-primary/5 p-3 text-center">
                    <item.icon className="w-4 h-4 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium text-primary">{item.label}</p>
                  </div>
                ))}
              </div>

              <Button
                className="mt-6 w-full"
                onClick={() => startCheckout(plan)}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? 'Checkout hazırlanıyor...' : 'Ödemeyi Başlat'}
              </Button>
            </CardContent>
          </Card>
        </section>

        <Link
          href="/billing"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
        >
          Abonelik sayfasına dön
        </Link>
      </div>
    </div>
  )
}

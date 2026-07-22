import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, CreditCard, RotateCcw } from 'lucide-react'

export default function BillingCancelPage() {
  return (
    <div>
      <Header title="Ödeme Tamamlanmadı" subtitle="Checkout akışı iptal edildi" />

      <div className="p-6 max-w-3xl">
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-700" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Checkout iptal edildi</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Ödeme sağlayıcısından iptal dönüşü alındığında kullanıcı bu sayfaya gelir. Deneme süreci veya mevcut
              abonelik durumu değişmeden korunur.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Tekrar deneyebilirsiniz</p>
                  <p className="text-xs text-muted-foreground">POST /billing/checkout tekrar çağrılarak yeni checkout session oluşturulur.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/billing/checkout" className={buttonVariants({ className: 'gap-2' })}>
                <CreditCard className="h-4 w-4" />
                Tekrar Dene
              </Link>
              <Link href="/billing" className={buttonVariants({ variant: 'outline' })}>
                Aboneliğe Dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

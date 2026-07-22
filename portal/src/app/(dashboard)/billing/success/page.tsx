import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, LayoutDashboard, ReceiptText } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <div>
      <Header title="Ödeme Başarılı" subtitle="VetCep Klinik aboneliği" />

      <div className="p-6 max-w-3xl">
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Abonelik aktifleştirildi</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Ödeme sağlayıcısından başarılı dönüş alındığında klinik aboneliği aktif hale getirilecek.
              Webhook sonrası fatura ve abonelik durumu bu ekrandan doğrulanabilir.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Beklenen backend akışı</p>
                  <p className="text-xs text-muted-foreground">iyzico success redirect + webhook + GET /subscription/current yenileme</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className={buttonVariants({ className: 'gap-2' })}>
                <LayoutDashboard className="h-4 w-4" />
                Panele Dön
              </Link>
              <Link href="/billing" className={buttonVariants({ variant: 'outline' })}>
                Aboneliği Gör
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

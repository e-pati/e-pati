'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Banknote, CreditCard, ReceiptText, TrendingUp } from 'lucide-react'
import { adminService } from '@/services/admin.service'

const revenueContract = [
  'GET /admin/revenue/summary',
  'GET /admin/revenue/monthly',
  'GET /admin/invoices',
  'GET /admin/payments',
]

function formatCurrency(value?: number) {
  if (value === undefined) return '₺—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminRevenuePage() {
  const summaryQuery = useQuery({
    queryKey: ['admin-revenue-summary'],
    queryFn: adminService.getRevenueSummary,
    retry: 1,
  })
  const monthlyQuery = useQuery({
    queryKey: ['admin-revenue-monthly'],
    queryFn: adminService.getRevenueMonthly,
    retry: 1,
  })

  const summary = summaryQuery.data
  const monthly = monthlyQuery.data ?? []
  const maxMrr = Math.max(...monthly.map(point => point.mrr), 1)
  const revenueCards = useMemo(() => [
    { label: 'MRR', value: formatCurrency(summary?.mrr), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Yıllık Tahmini', value: formatCurrency(summary?.arr ?? (summary?.mrr !== undefined ? summary.mrr * 12 : undefined)), icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Başarılı Ödeme', value: summary?.successfulPayments ?? '—', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Fatura', value: summary?.invoiceCount ?? '—', icon: ReceiptText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ], [summary])

  return (
    <div className="p-6 space-y-6">
      <div>
        <Badge className="bg-primary/10 text-primary border-0 mb-3">Gelir Operasyonu</Badge>
        <h1 className="text-2xl font-bold text-foreground">Gelir</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Abonelik geliri, ödeme geçmişi ve fatura takibi gerçek admin endpointlerine hazır.
        </p>
      </div>

      {(summaryQuery.isError || monthlyQuery.isError) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Admin gelir servisi henüz hazır değil. Endpoint bekleniyor.
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {revenueCards.map(card => (
          <Card key={card.label} className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{summaryQuery.isLoading ? '...' : card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-5">
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Aylık gelir grafiği</h2>
                <p className="text-xs text-muted-foreground mt-1">MRR serisi endpointten geldiğinde otomatik dolar.</p>
              </div>
              <Badge variant="outline">{monthly.length > 0 ? 'Canlı veri' : 'Beklemede'}</Badge>
            </div>
            {monthly.length === 0 ? (
              <div className="h-72 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-muted-foreground">
                Gelir serisi bekleniyor
              </div>
            ) : (
              <div className="h-72 rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-end gap-3">
                {monthly.map(point => (
                  <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-primary/75"
                      style={{ height: `${Math.max(10, (point.mrr / maxMrr) * 210)}px` }}
                      title={`${point.month}: ${formatCurrency(point.mrr)}`}
                    />
                    <span className="text-[10px] text-muted-foreground">{point.month}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-foreground">Endpoint kontratı</h2>
            <p className="text-sm text-muted-foreground mt-2">
              iyzico entegrasyonu ve admin gelir endpointleri tamamlanınca bu sayfa ödeme geçmişini canlı gösterecek.
            </p>
            <div className="mt-5 space-y-2">
              {revenueContract.map(endpoint => (
                <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                  {endpoint}
                </code>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

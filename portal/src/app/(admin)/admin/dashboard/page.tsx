'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, CircleDollarSign, LineChart, TrendingDown, UsersRound } from 'lucide-react'
import { adminService } from '@/services/admin.service'

const endpointContracts = [
  'GET /admin/dashboard',
  'GET /admin/clinics',
  'GET /admin/revenue',
]

function formatCurrency(value?: number) {
  if (value === undefined) return '₺—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    retry: 1,
  })

  const metrics = dashboardQuery.data?.metrics
  const revenueTrend = dashboardQuery.data?.revenueTrend ?? []
  const maxRevenue = Math.max(...revenueTrend.map(point => point.mrr), 1)
  const adminStats = useMemo(() => [
    { label: 'Toplam Klinik', value: metrics?.totalClinics ?? '—', icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Aktif Abonelik', value: metrics?.activeSubscriptions ?? '—', icon: UsersRound, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Aylık Gelir', value: formatCurrency(metrics?.mrr), icon: CircleDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Churn', value: metrics?.churnThisMonth ?? '—', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ], [metrics])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="bg-primary/10 text-primary border-0 mb-3">Burak Yönetim Paneli</Badge>
          <h1 className="text-2xl font-bold text-foreground">Admin Pano</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Klinik, abonelik ve gelir metrikleri için canlı veri bağlantısı hazır.
          </p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3 text-xs text-muted-foreground shadow-sm border border-gray-100">
          {dashboardQuery.isLoading ? 'Admin metrikleri yükleniyor' : 'GET /admin/dashboard'}
        </div>
      </div>

      {dashboardQuery.isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Admin dashboard servisi henüz hazır değil. Endpoint bekleniyor.
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {adminStats.map(stat => (
          <Card key={stat.label} className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{dashboardQuery.isLoading ? '...' : stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground">MRR Trend</h2>
                <p className="text-xs text-muted-foreground mt-1">Aylık gelir serisi endpointten geldiğinde otomatik dolar.</p>
              </div>
              <LineChart className="w-5 h-5 text-muted-foreground" />
            </div>
            {revenueTrend.length === 0 ? (
              <div className="h-64 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-sm text-muted-foreground">
                Gelir verisi bekleniyor
              </div>
            ) : (
              <div className="h-64 rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-end gap-3">
                {revenueTrend.map(point => (
                  <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-primary/70"
                      style={{ height: `${Math.max(8, (point.mrr / maxRevenue) * 190)}px` }}
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
            <h2 className="text-sm font-semibold text-foreground">Backend Kontratı</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Admin metrikleri TanStack Query ile okunur; endpoint hazır değilken kontrollü boş state gösterilir.
            </p>
            <div className="mt-5 space-y-2">
              {endpointContracts.map(endpoint => (
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

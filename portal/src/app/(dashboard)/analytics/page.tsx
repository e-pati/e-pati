'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, AlertTriangle, Clock3, Pill, TrendingUp, UsersRound } from 'lucide-react'
import { analyticsService } from '@/services/analytics.service'

const analyticsContracts = [
  'GET /analytics/clinic/summary',
  'GET /analytics/lost-patients',
  'GET /analytics/top-medications',
  'GET /analytics/busy-hours',
  'GET /analytics/visit-trend',
]

export default function AnalyticsPage() {
  const summaryQuery = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsService.getClinicSummary,
    retry: 1,
  })
  const lostPatientsQuery = useQuery({
    queryKey: ['analytics-lost-patients'],
    queryFn: analyticsService.getLostPatients,
    retry: 1,
  })
  const topMedicationsQuery = useQuery({
    queryKey: ['analytics-top-medications'],
    queryFn: analyticsService.getTopMedications,
    retry: 1,
  })
  const busyHoursQuery = useQuery({
    queryKey: ['analytics-busy-hours'],
    queryFn: analyticsService.getBusyHours,
    retry: 1,
  })
  const visitTrendQuery = useQuery({
    queryKey: ['analytics-visit-trend'],
    queryFn: analyticsService.getVisitTrend,
    retry: 1,
  })

  const summary = summaryQuery.data
  const lostPatients = lostPatientsQuery.data ?? []
  const topMedications = topMedicationsQuery.data ?? []
  const busyHours = busyHoursQuery.data ?? []
  const visitTrend = visitTrendQuery.data ?? []
  const maxVisits = Math.max(...visitTrend.map(point => point.visits), 1)
  const maxBusyCount = Math.max(...busyHours.map(hour => hour.count), 1)
  const analyticsCards = useMemo(() => [
    { label: 'Kayıp Hasta Riski', value: summary?.lostPatientRisk ?? '—', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Aktif Hasta', value: summary?.activePatients ?? '—', icon: UsersRound, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Yoğun Saat', value: summary?.busiestHour ?? '—', icon: Clock3, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Tekrar Ziyaret', value: summary?.revisitRate !== undefined ? `%${summary.revisitRate}` : '—', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ], [summary])
  const hasAnalyticsError = summaryQuery.isError || lostPatientsQuery.isError ||
    topMedicationsQuery.isError || busyHoursQuery.isError || visitTrendQuery.isError

  return (
    <div>
      <Header title="Klinik Analitiği" subtitle="Hasta, ilaç ve operasyon içgörüleri" />

      <div className="p-6 space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <Badge className="bg-primary/10 text-primary border-0 mb-4">P2 rekabet avantajı</Badge>
          <h1 className="text-2xl font-bold text-foreground">Klinik kararlarını veriye bağlayın.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Backend analitik endpointleri geldiğinde kayıp hasta riski, en çok kullanılan ilaçlar,
            yoğun saatler ve tekrar ziyaret trendleri bu ekranda canlı izlenecek.
          </p>
        </section>

        {hasAnalyticsError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Analitik servisleri henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsCards.map(card => (
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

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Ziyaret Trendi</h2>
                <p className="text-xs text-muted-foreground mt-1">Muayene ve takip yoğunluğu endpoint verisiyle grafiklenir.</p>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
              {visitTrend.length === 0 ? (
              <div className="h-72 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-muted-foreground">
                Analitik verisi bekleniyor
              </div>
              ) : (
                <div className="h-72 rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-end gap-3">
                  {visitTrend.map(point => (
                    <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-xl bg-primary/70"
                        style={{ height: `${Math.max(10, (point.visits / maxVisits) * 210)}px` }}
                        title={`${point.label}: ${point.visits}`}
                      />
                      <span className="text-[10px] text-muted-foreground">{point.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Kayıp hasta kampanyası</h2>
              <p className="text-sm text-muted-foreground mt-2">
                90+ gündür gelmeyen hastalar listelenip WhatsApp/SMS kampanyasına aktarılacak.
              </p>
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {lostPatients.length > 0 ? `${lostPatients.length} riskli hasta bulundu` : 'Risk listesi bekleniyor'}
                </p>
              </div>
              <Link
                href="/campaigns/lost-patients"
                className="mt-5 inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Kampanya ekranını aç
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">En çok kullanılan ilaçlar</h2>
              <div className="space-y-3">
                {(topMedications.length > 0 ? topMedications : [
                  { name: 'Antibiyotik', count: 0 },
                  { name: 'Antiparaziter', count: 0 },
                  { name: 'Ağrı kesici', count: 0 },
                  { name: 'Vitamin', count: 0 },
                ]).map((drug, index) => (
                  <div key={drug.name} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{drug.name}</div>
                      <div className="text-xs text-muted-foreground">{drug.count > 0 ? `${drug.count} kullanım` : 'Veri bekleniyor'}</div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Yoğun saatler</h2>
              <div className="space-y-3">
                {(busyHours.length > 0 ? busyHours : [
                  { hour: '09:00', count: 1 },
                  { hour: '11:00', count: 1 },
                  { hour: '14:00', count: 1 },
                  { hour: '16:00', count: 1 },
                ]).map(item => (
                  <div key={item.hour} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-medium text-muted-foreground">{item.hour}</span>
                    <div className="h-3 flex-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-primary/40"
                        style={{ width: `${Math.max(20, (item.count / maxBusyCount) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground">{busyHours.length > 0 ? item.count : '—'}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-5">Grafik gerçek saat dağılımıyla güncellenecek.</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
              <div className="mt-4 space-y-2">
                {analyticsContracts.map(endpoint => (
                  <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                    {endpoint}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

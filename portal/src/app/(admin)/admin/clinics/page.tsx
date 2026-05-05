'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building2, Mail, MapPin, Search, ShieldCheck } from 'lucide-react'
import { adminService, type AdminClinic } from '@/services/admin.service'

const expectedColumns = [
  'Klinik adı',
  'Yetkili',
  'Şehir',
  'Abonelik',
  'Deneme bitişi',
  'MRR',
]

const filters = [
  { label: 'Tümü', value: 'all' },
  { label: 'Deneme', value: 'trialing' },
  { label: 'Aktif', value: 'active' },
  { label: 'Gecikmiş', value: 'past_due' },
] as const

const statusLabel: Record<string, string> = {
  trialing: 'Deneme',
  active: 'Aktif',
  past_due: 'Gecikmiş',
  canceled: 'İptal',
}

const statusClassName: Record<string, string> = {
  trialing: 'bg-amber-100 text-amber-700',
  active: 'bg-primary/10 text-primary',
  past_due: 'bg-rose-100 text-rose-700',
  canceled: 'bg-gray-100 text-gray-600',
}

function formatCurrency(value?: number) {
  if (value === undefined) return '₺—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function clinicMatchesSearch(clinic: AdminClinic, query: string) {
  const haystack = [
    clinic.name,
    clinic.ownerName,
    clinic.ownerEmail,
    clinic.city,
    clinic.subscriptionStatus,
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(query.toLowerCase())
}

export default function AdminClinicsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]['value']>('all')

  const clinicsQuery = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: adminService.getClinics,
    retry: 1,
  })

  const clinics = useMemo(() => (
    (clinicsQuery.data ?? []).filter(clinic => {
      const statusOk = statusFilter === 'all' || clinic.subscriptionStatus === statusFilter
      const searchOk = !search.trim() || clinicMatchesSearch(clinic, search.trim())
      return statusOk && searchOk
    })
  ), [clinicsQuery.data, search, statusFilter])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge className="bg-primary/10 text-primary border-0 mb-3">Klinik Operasyonu</Badge>
          <h1 className="text-2xl font-bold text-foreground">Klinikler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm klinikler, deneme süreci ve abonelik durumları gerçek admin endpointine hazır.
          </p>
        </div>
        <Button disabled className="gap-2">
          <Building2 className="w-4 h-4" />
          Klinik ekleme endpointi bekleniyor
        </Button>
      </div>

      {clinicsQuery.isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Admin klinik servisi henüz hazır değil. Endpoint bekleniyor.
        </div>
      )}

      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="h-10 w-full rounded-xl border border-gray-100 bg-white pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
                placeholder="Klinik adı, şehir veya e-posta ara"
              />
            </div>
            <div className="flex gap-2">
              {filters.map(filter => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    statusFilter === filter.value
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-gray-100 bg-gray-50 text-muted-foreground hover:bg-white hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-6 gap-4 border-b border-gray-100 px-5 py-3 text-xs font-semibold text-muted-foreground">
            {expectedColumns.map(column => (
              <div key={column}>{column}</div>
            ))}
          </div>
          {clinicsQuery.isLoading ? (
            <div className="px-5 py-16 text-center text-sm text-muted-foreground">Klinikler yükleniyor...</div>
          ) : clinics.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Admin klinik verisi bekleniyor</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                `GET /admin/clinics` endpointi geldiğinde bu tablo gerçek klinik listesi, abonelik durumu
                ve deneme tarihleriyle doldurulacak.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clinics.map(clinic => (
                <Link
                  key={clinic.id}
                  href={`/admin/clinics/${clinic.id}`}
                  className="grid grid-cols-6 gap-4 px-5 py-4 text-sm transition-colors hover:bg-gray-50"
                >
                  <div className="font-semibold text-foreground truncate flex items-center gap-2">
                    <span className="truncate">{clinic.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="text-muted-foreground truncate">
                    {clinic.ownerName ?? '—'}
                    {clinic.ownerEmail && <div className="text-[11px] truncate">{clinic.ownerEmail}</div>}
                  </div>
                  <div className="text-muted-foreground truncate">{clinic.city ?? '—'}</div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName[clinic.subscriptionStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[clinic.subscriptionStatus ?? ''] ?? '—'}
                    </span>
                  </div>
                  <div className="text-muted-foreground">{formatDate(clinic.trialEndsAt)}</div>
                  <div className="font-semibold text-foreground">{formatCurrency(clinic.mrr)}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Mail, title: 'İletişim', text: 'Klinik yetkilisi ve fatura e-postası' },
          { icon: MapPin, title: 'Konum', text: 'Şehir bazlı klinik dağılımı' },
          { icon: Building2, title: 'Abonelik', text: 'Trial, active, past_due ve canceled durumları' },
        ].map(item => (
          <Card key={item.title} className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <item.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

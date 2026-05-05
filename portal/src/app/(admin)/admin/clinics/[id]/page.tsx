'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, ShieldCheck, UsersRound, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { adminService, type AdminClinic } from '@/services/admin.service'

const detailContracts = [
  'GET /admin/clinics/:id',
  'GET /admin/clinics/:id/subscription',
  'GET /admin/clinics/:id/activity',
]

const statusLabel: Record<string, string> = {
  trialing: 'Deneme',
  active: 'Aktif',
  past_due: 'Gecikmiş',
  canceled: 'İptal',
}

const statusTone: Record<string, string> = {
  trialing: 'bg-amber-100 text-amber-700 border-0',
  active: 'bg-primary/10 text-primary border-0',
  past_due: 'bg-rose-100 text-rose-700 border-0',
  canceled: 'bg-gray-100 text-gray-600 border-0',
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
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getLocation(clinic: AdminClinic) {
  return [clinic.district, clinic.city].filter(Boolean).join(' / ') || clinic.address || 'Konum bilgisi bekleniyor'
}

export default function AdminClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const clinicQuery = useQuery({
    queryKey: ['admin-clinics', id],
    queryFn: () => adminService.getClinic(id),
    retry: 1,
  })

  const clinic = clinicQuery.data

  return (
    <div className="p-6 space-y-6">
      <Button render={<Link href="/admin/clinics" />} variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Kliniklere Dön
      </Button>

      {clinicQuery.isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Admin klinik detay servisi henüz hazır değil. Endpoint bekleniyor.
        </div>
      )}

      {clinicQuery.isLoading ? (
        <div className="rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-sm">
          Klinik detayı yükleniyor...
        </div>
      ) : !clinic ? (
        <div className="rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-sm">
          Klinik detayı bekleniyor.
        </div>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <div className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge className={statusTone[clinic.subscriptionStatus ?? ''] ?? 'bg-gray-100 text-gray-700 border-0'}>
                      {statusLabel[clinic.subscriptionStatus ?? ''] ?? 'Abonelik bekleniyor'}
                    </Badge>
                    <h1 className="mt-4 text-2xl font-bold text-foreground">{clinic.name}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{getLocation(clinic)}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <Building2 className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock icon={UsersRound} label="Yetkili" value={clinic.ownerName ?? 'Yetkili bilgisi bekleniyor'} />
                  <InfoBlock icon={Mail} label="E-posta" value={clinic.ownerEmail ?? 'E-posta bekleniyor'} />
                  <InfoBlock icon={Phone} label="Telefon" value={clinic.ownerPhone ?? 'Telefon bekleniyor'} />
                  <InfoBlock icon={MapPin} label="Adres" value={clinic.address ?? getLocation(clinic)} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={WalletCards} label="MRR" value={formatCurrency(clinic.mrr)} />
              <MetricCard icon={UsersRound} label="Hasta" value={clinic.totalPatients?.toString() ?? '—'} />
              <MetricCard icon={CalendarDays} label="Randevu" value={clinic.totalAppointments?.toString() ?? '—'} />
            </div>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Abonelik özeti</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock icon={WalletCards} label="Plan" value={clinic.subscriptionPlan ?? 'Plan bilgisi bekleniyor'} />
                  <InfoBlock icon={CalendarDays} label="Deneme bitişi" value={formatDate(clinic.trialEndsAt)} />
                  <InfoBlock icon={CalendarDays} label="Dönem bitişi" value={formatDate(clinic.currentPeriodEndsAt)} />
                  <InfoBlock icon={ShieldCheck} label="Son giriş" value={formatDate(clinic.lastLoginAt)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Operasyon aksiyonları</h2>
                <div className="mt-4 space-y-2">
                  <Button disabled className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Yetkiliye e-posta endpointi bekleniyor
                  </Button>
                  <Button disabled variant="outline" className="w-full gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Abonelik aksiyonu bekleniyor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
                <div className="mt-4 space-y-2">
                  {detailContracts.map(endpoint => (
                    <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                      {endpoint}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}

function InfoBlock({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground break-words">{value}</div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <Card className="bg-white border-0 shadow-sm rounded-2xl">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-primary" />
        <div className="mt-4 text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

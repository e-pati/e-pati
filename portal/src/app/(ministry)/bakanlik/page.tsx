'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Activity,
  Building2,
  ChevronDown,
  Database,
  MapPinned,
  ShieldCheck,
  Siren,
  TrendingUp,
} from 'lucide-react'

import { DiseaseAlertFeed } from '@/components/ministry/disease-alert-feed'
import { ProvinceDetailPanel } from '@/components/ministry/province-detail-panel'
import { TurkeyProvinceMap } from '@/components/ministry/turkey-province-map'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ministryAlerts,
  ministryNationalSummary,
  ministryProvinces,
  nationalVaccinationCoverage,
} from '@/lib/ministry-demo-data'

const compactNumberFormatter = new Intl.NumberFormat('tr-TR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('tr-TR')

const MinistryAnalyticsPanels = dynamic(
  () => import('@/components/ministry/ministry-analytics-panels')
    .then((module) => module.MinistryAnalyticsPanels),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="h-[400px] animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-[400px] animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    ),
  },
)

export default function MinistryDashboardPage() {
  const [selectedPlateCode, setSelectedPlateCode] = useState(6)

  const selectedProvince = useMemo(
    () => ministryProvinces.find((province) => province.plateCode === selectedPlateCode)
      ?? ministryProvinces[0],
    [selectedPlateCode],
  )

  const handleAlertProvinceSelect = (provinceName: string) => {
    const province = ministryProvinces.find((item) => item.name === provinceName)
    if (!province) return

    setSelectedPlateCode(province.plateCode)
    window.requestAnimationFrame(() => {
      document.getElementById('province-overview')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const nationalStats = [
    {
      label: 'Toplam kayıtlı hayvan',
      value: compactNumberFormatter.format(ministryNationalSummary.totalAnimals),
      detail: '81 il · tüm hayvan grupları',
      icon: Activity,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Ulusal aşılama kapsamı',
      value: `%${nationalVaccinationCoverage}`,
      detail: 'Hedef %95 · program geneli',
      icon: ShieldCheck,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Kayıtlı işletme',
      value: numberFormatter.format(ministryNationalSummary.registeredBusinesses),
      detail: `${numberFormatter.format(ministryNationalSummary.activeVeterinarians)} aktif veteriner`,
      icon: Building2,
      iconClass: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Aktif erken uyarı',
      value: ministryAlerts.length.toString(),
      detail: '1 kritik · 3 izleniyor',
      icon: Siren,
      iconClass: 'bg-rose-50 text-rose-700',
    },
  ]

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl bg-[#123b55] text-white shadow-lg shadow-slate-900/10">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute -right-16 -top-20 size-72 rounded-full border border-white/10" />
          <div className="absolute -right-4 -top-10 size-48 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-white/10 text-white">
                  <MapPinned className="size-3" />
                  Türkiye Geneli
                </Badge>
                <Badge className="border-0 bg-amber-300 text-amber-950 sm:hidden">
                  <Database className="size-3" />
                  Sentetik Demo Verisi
                </Badge>
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Ulusal Hayvan Sağlığı Görünümü
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Mevcut HAYBİS, PETVET ve klinik kayıtlarının üzerinde çalışan birleşik deneyim ve
                karar-destek katmanı.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Son sentetik güncelleme: 21 Tem 2026 · 14:30
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {nationalStats.map((stat) => (
          <Card key={stat.label} className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-slate-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl ${stat.iconClass}`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <TrendingUp className="size-3.5 text-emerald-600" />
                {stat.detail}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="province-overview"
        className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1.7fr)_380px]"
      >
        <Card className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-slate-200">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-950">81 İl Risk ve Kapsama Haritası</h2>
                  <Badge variant="outline" className="border-slate-200 text-slate-500">Canlı simülasyon</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Detayları görmek için haritadan bir il seçin.
                </p>
              </div>

              <label className="relative min-w-48">
                <span className="sr-only">İl seçin</span>
                <select
                  value={selectedPlateCode}
                  onChange={(event) => setSelectedPlateCode(Number(event.target.value))}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-600/10"
                >
                  {ministryProvinces.map((province) => (
                    <option key={province.plateCode} value={province.plateCode}>
                      {province.plateCode.toString().padStart(2, '0')} · {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </label>
            </div>

            <TurkeyProvinceMap
              provinces={ministryProvinces}
              selectedPlateCode={selectedPlateCode}
              onSelect={(province) => setSelectedPlateCode(province.plateCode)}
            />
          </CardContent>
        </Card>

        <ProvinceDetailPanel province={selectedProvince} />
      </section>

      <MinistryAnalyticsPanels provinces={ministryProvinces} />

      <DiseaseAlertFeed
        alerts={ministryAlerts}
        selectedProvince={selectedProvince.name}
        onSelectProvince={handleAlertProvinceSelect}
      />
    </main>
  )
}

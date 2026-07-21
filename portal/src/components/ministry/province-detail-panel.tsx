import {
  Activity,
  Building2,
  Cat,
  MapPin,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Wheat,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { MinistryProvince } from '@/lib/ministry-demo-data'
import { cn } from '@/lib/utils'

interface ProvinceDetailPanelProps {
  province: MinistryProvince
}

const numberFormatter = new Intl.NumberFormat('tr-TR')

const riskLabels = {
  low: 'Normal',
  medium: 'İzleniyor',
  high: 'Kritik',
} as const

const riskClasses = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-rose-200 bg-rose-50 text-rose-700',
} as const

export function ProvinceDetailPanel({ province }: ProvinceDetailPanelProps) {
  const populations = [
    { label: 'Büyükbaş', value: province.cattle, icon: Activity },
    { label: 'Küçükbaş', value: province.smallRuminants, icon: Wheat },
    { label: 'Evcil', value: province.pets, icon: Cat },
    { label: 'Sokak', value: province.streetAnimals, icon: PawPrint },
  ]

  return (
    <aside className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <MapPin className="size-3.5" />
            İl görünümü
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {province.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {province.region} · Plaka {province.plateCode.toString().padStart(2, '0')}
          </p>
        </div>

        <Badge variant="outline" className={cn('h-7 px-3', riskClasses[province.riskLevel])}>
          {riskLabels[province.riskLevel]}
        </Badge>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Aşılama kapsamı</span>
          <ShieldCheck className="size-4" />
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <span className="text-3xl font-black">%{province.vaccinationCoverage}</span>
          <span className="text-xs text-slate-400">Ulusal hedef %95</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className={cn(
              'h-full rounded-full',
              province.vaccinationCoverage >= 95 ? 'bg-emerald-400' : 'bg-amber-400',
            )}
            style={{ width: `${province.vaccinationCoverage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {populations.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <item.icon className="size-4 text-sky-700" />
            <p className="mt-2 text-lg font-bold text-slate-900">
              {numberFormatter.format(item.value)}
            </p>
            <p className="text-[11px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <Building2 className="size-4" /> Kayıtlı işletme
          </span>
          <strong className="text-slate-900">
            {numberFormatter.format(province.registeredBusinesses)}
          </strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <Stethoscope className="size-4" /> Aktif veteriner
          </span>
          <strong className="text-slate-900">
            {numberFormatter.format(province.activeVeterinarians)}
          </strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Aylık kayıt değişimi</span>
          <strong className={province.monthlyChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
            {province.monthlyChange >= 0 ? '+' : ''}%{province.monthlyChange}
          </strong>
        </div>
      </div>

      {province.activeAlerts > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
          Bu il için {province.activeAlerts} aktif erken uyarı sinyali bulunuyor.
        </div>
      )}
    </aside>
  )
}

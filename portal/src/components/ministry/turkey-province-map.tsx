'use client'

import type { MinistryProvince, MinistryRiskLevel } from '@/lib/ministry-demo-data'
import { cn } from '@/lib/utils'

interface TurkeyProvinceMapProps {
  provinces: MinistryProvince[]
  selectedPlateCode: number
  onSelect: (province: MinistryProvince) => void
}

const riskClasses: Record<MinistryRiskLevel, string> = {
  low: 'border-emerald-700 bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400',
  medium: 'border-amber-700 bg-amber-400 shadow-amber-500/30 hover:bg-amber-300',
  high: 'border-rose-800 bg-rose-600 shadow-rose-500/40 hover:bg-rose-500',
}

const legend = [
  { label: 'Normal', className: 'bg-emerald-500' },
  { label: 'İzleniyor', className: 'bg-amber-400' },
  { label: 'Kritik', className: 'bg-rose-600' },
]

export function TurkeyProvinceMap({
  provinces,
  selectedPlateCode,
  onSelect,
}: TurkeyProvinceMapProps) {
  return (
    <div>
      <div className="relative aspect-[2.5/1] min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f4f8fb_62%,#e9f0f5_100%)]">
        <svg
          viewBox="0 0 900 360"
          role="img"
          aria-label="Türkiye il risk görünümü"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="turkeyMapFill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#dbe7ec" />
              <stop offset="100%" stopColor="#c8d8df" />
            </linearGradient>
            <filter id="turkeyMapShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>
          <path
            d="M45 61 C79 39 119 39 153 57 L205 72 L252 72 L305 53 L354 61 L402 48 L455 65 L510 58 L558 70 L612 55 L662 61 L704 49 L752 63 L798 83 L846 107 L834 139 L851 168 L828 191 L842 220 L810 245 L770 249 L735 269 L684 254 L634 277 L586 263 L535 280 L487 260 L443 284 L397 272 L350 292 L309 268 L264 276 L220 252 L178 264 L141 241 L104 238 L79 208 L88 175 L59 147 L72 111 Z"
            fill="url(#turkeyMapFill)"
            stroke="#a9bdc7"
            strokeWidth="2"
            filter="url(#turkeyMapShadow)"
          />
          <path
            d="M49 58 C72 47 94 47 116 54 L104 73 L72 78 Z"
            fill="#d5e3e9"
            stroke="#a9bdc7"
            strokeWidth="2"
          />
        </svg>

        {provinces.map((province) => {
          const selected = province.plateCode === selectedPlateCode

          return (
            <button
              key={province.plateCode}
              type="button"
              aria-label={`${province.name} ilini seç`}
              aria-pressed={selected}
              onClick={() => onSelect(province)}
              className={cn(
                'group absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-md transition-all focus-visible:z-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/30 sm:size-3.5',
                riskClasses[province.riskLevel],
                selected && 'z-20 size-5 border-[3px] border-white ring-2 ring-slate-900/30 sm:size-5',
              )}
              style={{
                left: `${(province.mapX / 900) * 100}%`,
                top: `${(province.mapY / 360) * 100}%`,
              }}
              title={`${province.name} · Aşılama %${province.vaccinationCoverage}`}
            >
              <span
                className={cn(
                  'pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block group-focus-visible:block',
                  selected && 'block',
                )}
              >
                {province.name}
              </span>
            </button>
          )
        })}

        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={cn('size-2.5 rounded-full', item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Noktalar il merkezlerini temsil eder. Renkler aşılama kapsamı ve sentetik erken uyarı
        sinyallerine göre hesaplanır.
      </p>
    </div>
  )
}

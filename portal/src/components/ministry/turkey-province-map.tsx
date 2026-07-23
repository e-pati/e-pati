'use client'

import { useState } from 'react'

import {
  TURKEY_PROVINCE_GEOMETRY_SOURCE,
  turkeyProvinceGeometries,
} from '@/lib/turkey-province-map-data'
import type { MinistryProvince, MinistryRiskLevel } from '@/lib/ministry-demo-data'
import { cn } from '@/lib/utils'

interface TurkeyProvinceMapProps {
  provinces: MinistryProvince[]
  selectedPlateCode: number
  onSelect: (province: MinistryProvince) => void
}

const riskClasses: Record<MinistryRiskLevel, string> = {
  low: 'fill-emerald-400 stroke-emerald-800/50 hover:fill-emerald-300',
  medium: 'fill-amber-400 stroke-amber-800/55 hover:fill-amber-300',
  high: 'fill-rose-600 stroke-rose-950/60 hover:fill-rose-500',
}

const legend: Array<{
  level: MinistryRiskLevel
  label: string
  className: string
}> = [
  { level: 'low', label: 'Normal', className: 'bg-emerald-400' },
  { level: 'medium', label: 'İzleniyor', className: 'bg-amber-400' },
  { level: 'high', label: 'Kritik', className: 'bg-rose-600' },
]

const riskLabels: Record<MinistryRiskLevel, string> = {
  low: 'Normal',
  medium: 'İzleniyor',
  high: 'Kritik',
}

const riskBadgeClasses: Record<MinistryRiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-rose-100 text-rose-800',
}

export function TurkeyProvinceMap({
  provinces,
  selectedPlateCode,
  onSelect,
}: TurkeyProvinceMapProps) {
  const [previewPlateCode, setPreviewPlateCode] = useState<number | null>(null)
  const provinceByPlateCode = new Map(
    provinces.map((province) => [province.plateCode, province]),
  )
  const selectedGeometry = turkeyProvinceGeometries.find(
    (geometry) => geometry.plateCode === selectedPlateCode,
  )
  const selectedProvince = provinceByPlateCode.get(selectedPlateCode)
  const previewProvince =
    provinceByPlateCode.get(previewPlateCode ?? selectedPlateCode) ?? selectedProvince
  const provinceCountByRisk = provinces.reduce<Record<MinistryRiskLevel, number>>(
    (counts, province) => {
      counts[province.riskLevel] += 1
      return counts
    },
    { low: 0, medium: 0, high: 0 },
  )
  const selectedLabelWidth = Math.max(48, (selectedProvince?.name.length ?? 0) * 7 + 22)

  return (
    <div>
      <div className="relative aspect-[2.35/1] min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f4f8fb_62%,#e9f0f5_100%)]">
        <svg
          viewBox="0 0 900 380"
          role="img"
          aria-label="Türkiye 81 il risk ve aşılama kapsamı haritası"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <pattern id="ministryMapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="#cbd5e1"
                strokeOpacity="0.2"
                strokeWidth="0.7"
              />
            </pattern>
            <filter id="selectedProvinceShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="3"
                floodColor="#0f172a"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <rect width="900" height="380" fill="url(#ministryMapGrid)" />

          <g aria-label="Türkiye il alanları">
            {turkeyProvinceGeometries.map((geometry) => {
              const province = provinceByPlateCode.get(geometry.plateCode)
              if (!province) return null

              const selected = province.plateCode === selectedPlateCode

              return (
                <path
                  key={province.plateCode}
                  d={geometry.path}
                  role="button"
                  tabIndex={0}
                  data-testid="province-shape"
                  data-province-code={province.plateCode}
                  aria-label={`${province.name} ilini seç`}
                  aria-pressed={selected}
                  onClick={() => onSelect(province)}
                  onPointerEnter={() => setPreviewPlateCode(province.plateCode)}
                  onPointerLeave={() => setPreviewPlateCode(null)}
                  onFocus={() => setPreviewPlateCode(province.plateCode)}
                  onBlur={() => setPreviewPlateCode(null)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    onSelect(province)
                  }}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  vectorEffect="non-scaling-stroke"
                  filter={selected ? 'url(#selectedProvinceShadow)' : undefined}
                  className={cn(
                    'cursor-pointer stroke-[1.1] transition-colors duration-150 focus-visible:outline-none focus-visible:stroke-sky-950 focus-visible:stroke-[3]',
                    riskClasses[province.riskLevel],
                    selected && 'stroke-slate-950 stroke-[2.8]',
                  )}
                >
                  <title>{`${province.name} · Aşılama %${province.vaccinationCoverage} · ${riskLabels[province.riskLevel]}`}</title>
                </path>
              )
            })}
          </g>

          {selectedGeometry && selectedProvince && (
            <g
              transform={`translate(${selectedGeometry.labelX} ${selectedGeometry.labelY})`}
              className="pointer-events-none"
              aria-hidden="true"
            >
              <rect
                x={-selectedLabelWidth / 2}
                y="-31"
                width={selectedLabelWidth}
                height="24"
                rx="8"
                fill="#0f172a"
                fillOpacity="0.94"
              />
              <path d="M-5 -7 L0 -1 L5 -7 Z" fill="#0f172a" fillOpacity="0.94" />
              <text
                x="0"
                y="-15"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
              >
                {selectedProvince.name}
              </text>
            </g>
          )}
        </svg>

        {previewProvince && (
          <div
            role="status"
            data-testid="province-map-tooltip"
            className="pointer-events-none absolute right-3 top-3 z-20 min-w-36 rounded-xl border border-white/80 bg-slate-950/95 px-3 py-2.5 text-white shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {String(previewProvince.plateCode).padStart(2, '0')} · {previewProvince.name}
              </p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  riskBadgeClasses[previewProvince.riskLevel],
                )}
              >
                {riskLabels[previewProvince.riskLevel]}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              Aşılama kapsamı{' '}
              <span className="font-semibold text-white">
                %{previewProvince.vaccinationCoverage}
              </span>
            </p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          {legend.map((item) => (
            <span
              key={item.level}
              data-testid={`risk-legend-${item.level}`}
              className="flex items-center gap-1.5"
            >
              <span className={cn('size-2.5 rounded-sm', item.className)} />
              {item.label}
              <strong className="font-semibold text-slate-900">
                {provinceCountByRisk[item.level]} il
              </strong>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        İl alanları aşılama kapsamı ve sentetik erken uyarı sinyallerine göre renklendirilir.
        Sınırlar gösterim amaçlıdır; resmî idari karar veya saha bildirimi niteliği taşımaz.
      </p>
      <p className="mt-1 text-[10px] leading-4 text-slate-400">
        Geometri kaynağı: {TURKEY_PROVINCE_GEOMETRY_SOURCE}
      </p>
    </div>
  )
}

import { ArrowUpRight, Clock3, Radio, ShieldAlert, Siren, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { MinistryAlert } from '@/lib/ministry-demo-data'
import { cn } from '@/lib/utils'

interface DiseaseAlertFeedProps {
  alerts: MinistryAlert[]
  selectedProvince: string
  onSelectProvince: (province: string) => void
}

const alertStyle = {
  critical: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: 'bg-rose-100 text-rose-700',
    label: 'Kritik',
  },
  warning: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: 'bg-amber-100 text-amber-700',
    label: 'İzleniyor',
  },
} as const

export function DiseaseAlertFeed({
  alerts,
  selectedProvince,
  onSelectProvince,
}: DiseaseAlertFeedProps) {
  return (
    <Card className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-slate-200">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-950">Hastalık Erken Uyarı Akışı</h2>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-rose-600" />
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Klinik, saha ve aşılama kayıtlarından üretilmiş sentetik sinyaller
            </p>
          </div>

          <Badge variant="outline" className="h-7 border-slate-200 bg-slate-50 text-slate-600">
            <Radio className="size-3" />
            {alerts.length} aktif sinyal
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {alerts.map((alert) => {
            const style = alertStyle[alert.level]
            const selected = selectedProvince === alert.province

            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSelectProvince(alert.province)}
                className={cn(
                  'group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/15',
                  selected ? 'border-sky-300 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white',
                )}
                aria-label={`${alert.province} erken uyarısını incele`}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', style.icon)}>
                    {alert.level === 'critical' ? (
                      <Siren className="size-5" />
                    ) : (
                      <TriangleAlert className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-black text-slate-950">{alert.province}</span>
                        <span className="text-xs text-slate-400"> · {alert.district}</span>
                      </div>
                      <Badge variant="outline" className={cn('h-6', style.badge)}>
                        {style.label}
                      </Badge>
                    </div>

                    <h3 className="mt-2 text-sm font-bold leading-5 text-slate-800">{alert.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{alert.description}</p>

                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-600">
                      <span className="font-bold text-slate-700">Önerilen aksiyon:</span>{' '}
                      {alert.recommendedAction}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="size-3" /> {alert.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" /> {alert.occurredAt}
                        <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          Bu akış yalnızca demo amaçlı sentetik örüntüler gösterir; resmî hastalık bildirimi veya
          saha kararı değildir.
        </div>
      </CardContent>
    </Card>
  )
}

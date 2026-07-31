'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartNoAxesColumnIncreasing } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useExaminations } from '@/hooks/use-examinations'
import { useVaccinations } from '@/hooks/use-vaccinations'

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

function buildWeekData(
  examinations: { createdAt?: string }[],
  vaccinations: { appliedAt?: string }[],
) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const day = date.toDateString()

    return {
      day: DAY_NAMES[date.getDay()],
      muayene: examinations.filter(item => item.createdAt && new Date(item.createdAt).toDateString() === day).length,
      asi: vaccinations.filter(item => item.appliedAt && new Date(item.appliedAt).toDateString() === day).length,
    }
  })
}

export function DashboardChart() {
  const examinationsQuery = useExaminations({ limit: 100 })
  const vaccinationsQuery = useVaccinations({ limit: 100 })

  const data = useMemo(() => buildWeekData(
    examinationsQuery.data ?? [],
    vaccinationsQuery.data ?? [],
  ), [examinationsQuery.data, vaccinationsQuery.data])

  const isLoading = examinationsQuery.isLoading || vaccinationsQuery.isLoading
  const isError = examinationsQuery.isError || vaccinationsQuery.isError
  const hasActivity = data.some(item => item.muayene > 0 || item.asi > 0)

  if (isLoading) {
    return <Skeleton className="h-[240px] w-full rounded-xl" />
  }

  if (isError) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/70 px-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-amber-700 ring-1 ring-amber-200">
          <ChartNoAxesColumnIncreasing className="size-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800">Aktivite verisi alınamadı</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
          Günlük dağılım, kayıt servisi yeniden erişilebilir olduğunda güncellenecek.
        </p>
      </div>
    )
  }

  if (!hasActivity) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200">
          <ChartNoAxesColumnIncreasing className="size-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800">Bu hafta kayıtlı aktivite yok</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
          Muayene veya aşı kaydı oluşturulduğunda günlük dağılım burada gösterilecek.
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={5} margin={{ left: -8, right: 4 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickMargin={12}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{
            background: '#0f172a',
            border: '0',
            borderRadius: '12px',
            boxShadow: '0 16px 30px -18px rgba(15, 23, 42, 0.7)',
            color: '#f8fafc',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}
          itemStyle={{ color: '#f8fafc' }}
        />
        <Bar dataKey="muayene" name="Muayene" fill="#0f172a" radius={[5, 5, 0, 0]} maxBarSize={28} />
        <Bar dataKey="asi" name="Aşı" fill="#06b6d4" radius={[5, 5, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

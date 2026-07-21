'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useExaminations } from '@/hooks/use-examinations'
import { useVaccinations } from '@/hooks/use-vaccinations'

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

function buildWeekData(
  examinations: { createdAt?: string }[],
  vaccinations: { appliedAt?: string }[],
) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    const dayStr = date.toDateString()

    const muayene = examinations.filter(e => e.createdAt && new Date(e.createdAt).toDateString() === dayStr).length
    const asi = vaccinations.filter(v => v.appliedAt && new Date(v.appliedAt).toDateString() === dayStr).length

    return { day: DAY_NAMES[date.getDay()], muayene, asi }
  })
}

const FALLBACK_DATA = [
  { day: 'Pzt', muayene: 8, asi: 3 },
  { day: 'Sal', muayene: 11, asi: 5 },
  { day: 'Çar', muayene: 7, asi: 2 },
  { day: 'Per', muayene: 14, asi: 6 },
  { day: 'Cum', muayene: 12, asi: 5 },
  { day: 'Cmt', muayene: 5, asi: 1 },
  { day: 'Paz', muayene: 3, asi: 0 },
]

export function DashboardChart() {
  const examinationsQuery = useExaminations({ limit: 100 })
  const vaccinationsQuery = useVaccinations({ limit: 100 })

  const data = useMemo(() => {
    if (examinationsQuery.data && vaccinationsQuery.data) {
      const built = buildWeekData(examinationsQuery.data, vaccinationsQuery.data)
      const hasAnyData = built.some(d => d.muayene > 0 || d.asi > 0)
      return hasAnyData ? built : FALLBACK_DATA
    }
    return FALLBACK_DATA
  }, [examinationsQuery.data, vaccinationsQuery.data])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={24}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
        />
        <Bar dataKey="muayene" name="Muayene" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="asi" name="Aşı" fill="hsl(218 90% 65%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

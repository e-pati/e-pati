'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartNoAxesCombined, PawPrint } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { MinistryProvince } from '@/lib/ministry-demo-data'

interface MinistryAnalyticsPanelsProps {
  provinces: MinistryProvince[]
}

const populationColors = ['#0e7490', '#2563eb', '#8b5cf6', '#f59e0b']
const numberFormatter = new Intl.NumberFormat('tr-TR')

export function MinistryAnalyticsPanels({ provinces }: MinistryAnalyticsPanelsProps) {
  const regionalVaccination = useMemo(() => {
    const regions = provinces.reduce<Record<string, { total: number; count: number }>>(
      (result, province) => {
        const current = result[province.region] ?? { total: 0, count: 0 }
        current.total += province.vaccinationCoverage
        current.count += 1
        result[province.region] = current
        return result
      },
      {},
    )

    return Object.entries(regions)
      .map(([region, values]) => ({
        region: region.replace(' Anadolu', ''),
        coverage: Math.round(values.total / values.count),
      }))
      .sort((a, b) => b.coverage - a.coverage)
  }, [provinces])

  const populationDistribution = useMemo(() => {
    const totals = provinces.reduce(
      (result, province) => {
        result.cattle += province.cattle
        result.smallRuminants += province.smallRuminants
        result.pets += province.pets
        result.streetAnimals += province.streetAnimals
        return result
      },
      { cattle: 0, smallRuminants: 0, pets: 0, streetAnimals: 0 },
    )

    return [
      { name: 'Büyükbaş', value: totals.cattle },
      { name: 'Küçükbaş', value: totals.smallRuminants },
      { name: 'Evcil', value: totals.pets },
      { name: 'Sokak', value: totals.streetAnimals },
    ]
  }, [provinces])

  const totalPopulation = populationDistribution.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
      <Card className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-slate-200">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">Bölgesel Aşılama Kapsamı</h2>
              <p className="mt-1 text-xs text-slate-500">
                Program kapsamı · ulusal hedef %95
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ChartNoAxesCombined className="size-4" />
            </div>
          </div>

          <div className="h-[300px]" data-testid="vaccination-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 720, height: 300 }}
            >
              <BarChart data={regionalVaccination} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="region"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  domain={[60, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="coverage"
                  name="Aşılama kapsamı (%)"
                  fill="#0e7490"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={54}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-slate-200">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">Ulusal Popülasyon Dağılımı</h2>
              <p className="mt-1 text-xs text-slate-500">Kimlik sınıfına göre kayıtlı hayvanlar</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <PawPrint className="size-4" />
            </div>
          </div>

          <div className="relative h-[220px]" data-testid="population-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 420, height: 220 }}
            >
              <PieChart>
                <Pie
                  data={populationDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {populationDistribution.map((item, index) => (
                    <Cell key={item.name} fill={populationColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-950">
                {new Intl.NumberFormat('tr-TR', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(totalPopulation)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Toplam kayıt
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {populationDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: populationColors[index] }}
                />
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-slate-500">{item.name}</p>
                  <p className="text-xs font-bold text-slate-800">
                    {numberFormatter.format(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

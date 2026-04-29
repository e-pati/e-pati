'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const data = [
  { day: 'Pzt', muayene: 8, asi: 3 },
  { day: 'Sal', muayene: 11, asi: 5 },
  { day: 'Çar', muayene: 7, asi: 2 },
  { day: 'Per', muayene: 14, asi: 6 },
  { day: 'Cum', muayene: 12, asi: 5 },
  { day: 'Cmt', muayene: 5, asi: 1 },
  { day: 'Paz', muayene: 3, asi: 0 },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={24} />
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

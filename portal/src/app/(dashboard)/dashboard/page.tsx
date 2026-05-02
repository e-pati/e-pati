'use client'

import { Header } from '@/components/layout/header'
import { Skeleton } from '@/components/ui/skeleton'
import { useClinicDashboard } from '@/hooks/use-clinic'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate, speciesEmoji, isVaccinationOverdue } from '@/lib/utils'
import type { PetSpecies } from '@/types'
import {
  Stethoscope, Syringe, Users, AlertTriangle, CheckCircle2, Clock,
  Plus, FlaskConical, CalendarDays, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardChart } from '@/components/shared/dashboard-chart'

const QUICK_ACTIONS = [
  { label: 'Yeni Muayene', icon: Stethoscope, href: '/examinations/new', bg: 'bg-primary', text: 'text-white' },
  { label: 'Yeni Hasta', icon: Users, href: '/patients/new', bg: 'bg-blue-500', text: 'text-white' },
  { label: 'Aşı Takibi', icon: Syringe, href: '/vaccinations', bg: 'bg-violet-500', text: 'text-white' },
  { label: 'Lab Sonucu', icon: FlaskConical, href: '/lab-results', bg: 'bg-rose-500', text: 'text-white' },
]

export default function DashboardPage() {
  const { data, isLoading } = useClinicDashboard()
  const user = useAuthStore(s => s.user)
  const firstName = user?.fullName?.split(' ')[0] ?? 'Doktor'

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const stats = [
    {
      title: 'Bugünkü Muayene',
      value: data?.stats.examinationsToday ?? 0,
      icon: Stethoscope,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/examinations',
    },
    {
      title: 'Yaklaşan Aşı',
      value: data?.stats.upcomingVaccinationCount ?? 0,
      icon: Syringe,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/vaccinations',
    },
    {
      title: 'Toplam Hasta',
      value: data?.stats.patientCount ?? 0,
      icon: Users,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      href: '/patients',
    },
    {
      title: 'Okunmamış Bildirim',
      value: data?.stats.unreadNotificationCount ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      href: '/notifications',
    },
  ]

  return (
    <div>
      <Header
        title="Pano"
        subtitle={today}
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <div className="p-6 space-y-6">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Merhaba, {firstName}! 👋</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kliniğinizin bugünkü özetine göz atın.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <Link key={s.title} href={s.href}>
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-gray-100/50">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                {isLoading
                  ? <Skeleton className="h-8 w-14 mb-1" />
                  : <div className="text-2xl font-bold text-foreground">{s.value}</div>
                }
                <div className="text-xs text-muted-foreground mt-1">{s.title}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col — chart + recent exams */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Haftalık Muayene</h3>
                <Link href="/examinations" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Tümü <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <DashboardChart />
            </div>

            {/* Recent exams */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Son Muayeneler</h3>
                <Link href="/examinations" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Tümü <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : (data?.recentExaminations.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Henüz muayene kaydı yok</p>
              ) : (
                <div className="space-y-1">
                  {data!.recentExaminations.map(exam => (
                    <Link href={`/patients/${exam.pet.id}`} key={exam.id}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                          {speciesEmoji((exam.pet.species?.toLowerCase() ?? 'other') as PetSpecies)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{exam.pet.name}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground truncate">Dr. {exam.veterinarian.fullName}</span>
                          </div>
                          {exam.complaint && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{exam.complaint}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">{formatDate(exam.createdAt)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right col — quick actions + vaccines */}
          <div className="space-y-6">

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
              <h3 className="text-sm font-semibold text-foreground mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map(a => (
                  <Link key={a.label} href={a.href}>
                    <div className={`${a.bg} rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity text-center`}>
                      <a.icon className={`w-5 h-5 ${a.text} mx-auto mb-2`} />
                      <p className={`text-[11px] font-medium ${a.text} leading-tight`}>{a.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Vaccine alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Aşı Uyarıları</h3>
                <Link href="/vaccinations" className="text-xs text-primary hover:underline">
                  Tümü
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              ) : (data?.upcomingVaccinations.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Yaklaşan aşı yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data!.upcomingVaccinations.map(vac => {
                    const overdue = isVaccinationOverdue(vac.dueAt)
                    return (
                      <Link href={`/patients/${vac.pet.id}`} key={vac.id}>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                            {overdue
                              ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                              : <Clock className="w-3.5 h-3.5 text-amber-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {speciesEmoji((vac.pet.species?.toLowerCase() ?? 'other') as PetSpecies)} {vac.pet.name}
                            </div>
                            <div className={`text-[10px] font-medium mt-0.5 ${overdue ? 'text-destructive' : 'text-amber-600'}`}>
                              {overdue ? '⚠ Gecikmiş — ' : ''}{formatDate(vac.dueAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Yeni muayene randevu takvimi linki */}
              <Link href="/vaccinations?filter=upcoming">
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors cursor-pointer">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Aşı takvimini görüntüle</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                </div>
              </Link>
            </div>

            {/* Yeni hasta ekle CTA */}
            <Link href="/patients/new">
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 hover:border-primary/20 hover:bg-primary/10 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Hasta Ekle</div>
                    <div className="text-xs text-primary/70">Yeni hasta kaydı oluştur</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

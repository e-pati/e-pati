'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useExaminations } from '@/hooks/use-examinations'
import { useVaccinations, useUpcomingVaccinations } from '@/hooks/use-vaccinations'
import { usePets } from '@/hooks/use-pets'
import { useLabResults } from '@/hooks/use-lab-results'
import { mockExaminations, mockVaccinations, mockPets } from '@/lib/mock-data'
import { formatDate, speciesEmoji, isVaccinationDueSoon, isVaccinationOverdue } from '@/lib/utils'
import {
  Stethoscope, Syringe, CalendarClock, Users, FlaskConical,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardChart } from '@/components/shared/dashboard-chart'

export default function DashboardPage() {
  const petsQuery = usePets()
  const examinationsQuery = useExaminations({ limit: 50 })
  const upcomingVaxQuery = useUpcomingVaccinations()
  const allVaxQuery = useVaccinations({ limit: 200 })
  const labQuery = useLabResults()

  const pets = petsQuery.data ?? mockPets.map(p => ({
    id: p.id, name: p.name, species: p.species, breed: p.breed ?? '',
    ownerId: p.ownerId, sex: p.gender, createdAt: p.createdAt,
    owner: { id: p.ownerId, fullName: `${p.owner.firstName} ${p.owner.lastName}`, email: p.owner.email },
  }) as any)

  const examinations = examinationsQuery.data ?? mockExaminations.map(e => ({
    id: e.id, petId: e.petId, complaint: e.complaint,
    findings: e.findings, assessment: e.assessment, plan: e.plan,
    createdAt: e.date, followUpDate: e.followUpDate,
  }))

  const upcomingVaccinations = upcomingVaxQuery.data ?? (
    allVaxQuery.data
      ? allVaxQuery.data.filter(v => v.dueAt && (isVaccinationDueSoon(v.dueAt, 30) || isVaccinationOverdue(v.dueAt)))
      : mockVaccinations.filter(v => isVaccinationDueSoon(v.nextDate) || isVaccinationOverdue(v.nextDate)).map(v => ({
          id: v.id, petId: v.petId, name: v.vaccineName,
          appliedAt: v.appliedDate, dueAt: v.nextDate, notes: v.manufacturer,
        }))
  )

  const today = new Date().toDateString()
  const todayExams = examinations.filter(e => {
    const d = e.createdAt ?? ''
    return d && new Date(d).toDateString() === today
  }).length

  const stats = [
    { title: 'Bugünkü Muayene', value: todayExams, icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10', href: '/examinations' },
    { title: 'Yaklaşan Aşı', value: upcomingVaccinations.length, icon: Syringe, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/vaccinations' },
    { title: 'Toplam Hasta', value: pets.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', href: '/patients' },
    { title: 'Lab Sonucu', value: labQuery.data?.length ?? 0, icon: FlaskConical, color: 'text-rose-500', bg: 'bg-rose-500/10', href: '/lab-results' },
  ]

  const recentExams = [...examinations]
    .sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime())
    .slice(0, 5)

  const isLoading = petsQuery.isLoading || examinationsQuery.isLoading

  return (
    <div>
      <Header
        title="Pano"
        subtitle={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <div className="p-6 space-y-6">
        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <Link key={s.title} href={s.href}>
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${s.bg}`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {isLoading
                    ? <Skeleton className="h-7 w-12 mb-1" />
                    : <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  }
                  <div className="text-xs text-muted-foreground mt-0.5">{s.title}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Haftalık Muayene</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart />
            </CardContent>
          </Card>

          {/* Yaklaşan aşılar */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Aşı Uyarıları</CardTitle>
                {upcomingVaccinations.length > 0 && (
                  <Badge variant="destructive" className="text-xs">{upcomingVaccinations.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingVaxQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : upcomingVaccinations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Yaklaşan aşı yok</p>
                </div>
              ) : (
                upcomingVaccinations.slice(0, 5).map(vac => {
                  const dueAt = vac.dueAt ?? vac.appliedAt
                  const pet = pets.find((p: any) => p.id === vac.petId)
                  const overdue = isVaccinationOverdue(dueAt)
                  return (
                    <Link href={`/patients/${vac.petId}`} key={vac.id}>
                      <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`mt-0.5 p-1 rounded-full ${overdue ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                          {overdue
                            ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                            : <Clock className="w-3.5 h-3.5 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {pet ? `${speciesEmoji((pet.species ?? 'other') as any)} ${pet.name}` : 'Hasta bilgisi yok'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{vac.name}</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${overdue ? 'text-destructive' : 'text-amber-600'}`}>
                            {overdue ? 'Gecikmiş! ' : ''}{formatDate(dueAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
              {upcomingVaccinations.length > 5 && (
                <Link href="/vaccinations?filter=upcoming">
                  <p className="text-xs text-center text-primary hover:underline pt-1">
                    +{upcomingVaccinations.length - 5} daha göster
                  </p>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Son muayeneler */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Son Muayeneler</CardTitle>
              <Link href="/examinations" className="text-xs text-primary hover:underline">Tümünü gör</Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : recentExams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Henüz muayene kaydı yok</p>
            ) : (
              <div className="space-y-1">
                {recentExams.map(exam => {
                  const pet = pets.find((p: any) => p.id === exam.petId)
                  return (
                    <Link href={`/patients/${exam.petId}`} key={exam.id}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                          {speciesEmoji((pet?.species?.toLowerCase() ?? 'other') as any)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{pet?.name ?? 'Hasta bilgisi yok'}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground truncate">{pet?.owner?.fullName ?? '—'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{exam.complaint}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-muted-foreground">{exam.createdAt ? formatDate(exam.createdAt) : '—'}</div>
                          {exam.followUpDate && (
                            <Badge variant="outline" className="text-[10px] mt-1 border-amber-300 text-amber-600 bg-amber-50">
                              Takip
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockDashboardStats, mockExaminations, mockVaccinations, mockPets } from '@/lib/mock-data'
import { formatDate, speciesEmoji, isVaccinationDueSoon, isVaccinationOverdue } from '@/lib/utils'
import {
  Stethoscope, Syringe, CalendarClock, Users, FlaskConical,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardChart } from '@/components/shared/dashboard-chart'

const statCards = [
  {
    title: "Bugünkü Muayene",
    key: 'todayExaminations' as const,
    icon: Stethoscope,
    color: 'text-primary',
    bg: 'bg-primary/10',
    trend: '+2 dün',
  },
  {
    title: "Bugün Aşı",
    key: 'todayVaccinations' as const,
    icon: Syringe,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    trend: 'normal',
  },
  {
    title: "Bu Hafta Takip",
    key: 'weekFollowUps' as const,
    icon: CalendarClock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    trend: '3 acil',
  },
  {
    title: "Toplam Hasta",
    key: 'totalPatients' as const,
    icon: Users,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    trend: '+5 bu ay',
  },
  {
    title: "Bekleyen Lab",
    key: 'pendingLabResults' as const,
    icon: FlaskConical,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    trend: 'bekliyor',
  },
]

export default function DashboardPage() {
  const stats = mockDashboardStats

  const upcomingVaccinations = mockVaccinations.filter(v =>
    isVaccinationDueSoon(v.nextDate, 30) || isVaccinationOverdue(v.nextDate)
  )

  const recentExaminations = mockExaminations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div>
      <Header
        title="Pano"
        subtitle={`${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <div className="p-6 space-y-6">
        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map(card => (
            <Card key={card.key} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats[card.key]}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{card.title}</div>
                <div className="text-[10px] text-primary mt-1">{card.trend}</div>
              </CardContent>
            </Card>
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
            <CardContent className="space-y-3">
              {upcomingVaccinations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Yaklaşan aşı yok</p>
                </div>
              ) : (
                upcomingVaccinations.map(vac => {
                  const pet = mockPets.find(p => p.id === vac.petId)
                  const overdue = isVaccinationOverdue(vac.nextDate)
                  return (
                    <Link href={`/patients/${vac.petId}`} key={vac.id}>
                      <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className={`mt-0.5 p-1 rounded-full ${overdue ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                          {overdue
                            ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                            : <Clock className="w-3.5 h-3.5 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {speciesEmoji(pet?.species ?? 'other')} {pet?.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{vac.vaccineName}</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${overdue ? 'text-destructive' : 'text-amber-600'}`}>
                            {overdue ? 'Gecikmiş! ' : ''}{formatDate(vac.nextDate)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Son muayeneler */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Son Muayeneler</CardTitle>
              <Link href="/examinations" className="text-xs text-primary hover:underline">
                Tümünü gör
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentExaminations.map(exam => {
                const pet = mockPets.find(p => p.id === exam.petId)
                return (
                  <Link href={`/patients/${exam.petId}`} key={exam.id}>
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                        {speciesEmoji(pet?.species ?? 'other')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{pet?.name}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground truncate">{pet?.owner.firstName} {pet?.owner.lastName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{exam.complaint}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground">{formatDate(exam.date)}</div>
                        {exam.followUpDate && (
                          <Badge variant="outline" className="text-[10px] mt-1 border-amber-300 text-amber-600 bg-amber-50">
                            Takip: {formatDate(exam.followUpDate)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

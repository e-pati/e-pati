'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  PawPrint,
  Plus,
  Stethoscope,
  Syringe,
  Users,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { DashboardChart } from '@/components/shared/dashboard-chart'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClinicDashboard } from '@/hooks/use-clinic'
import { formatDate, isVaccinationOverdue } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

const QUICK_ACTIONS: Array<{
  label: string
  description: string
  icon: LucideIcon
  href: string
}> = [
  {
    label: 'Yeni muayene',
    description: 'Klinik değerlendirme başlat',
    icon: Stethoscope,
    href: '/examinations/new',
  },
  {
    label: 'Hasta kaydı',
    description: 'Yeni hayvan ve sahip bilgisi ekle',
    icon: Plus,
    href: '/patients/new',
  },
  {
    label: 'Aşı takvimi',
    description: 'Yaklaşan ve geciken planları gör',
    icon: Syringe,
    href: '/vaccinations',
  },
  {
    label: 'Laboratuvar',
    description: 'Sonuç ve numune kayıtlarına git',
    icon: FlaskConical,
    href: '/lab-results',
  },
]

function withoutDoctorTitle(name: string): string {
  return name.replace(/^Dr\.\s*/i, '').trim()
}

function capitalizeFirst(value: string): string {
  return value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1)
}

export default function DashboardPage() {
  const { data, isError, isLoading } = useClinicDashboard()
  const user = useAuthStore(state => state.user)
  const firstName = user?.fullName
    ? withoutDoctorTitle(user.fullName).split(' ')[0]
    : 'Hekim'

  const today = capitalizeFirst(new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }))

  const stats: Array<{
    title: string
    description: string
    value: number
    icon: LucideIcon
    href: string
    tone: string
  }> = [
    {
      title: 'Bugünkü muayene',
      description: 'Günlük klinik iş yükü',
      value: data?.stats.examinationsToday ?? 0,
      icon: Stethoscope,
      href: '/examinations',
      tone: 'bg-blue-50 text-blue-700 ring-blue-100',
    },
    {
      title: 'Yaklaşan aşı',
      description: 'Takip gerektiren plan',
      value: data?.stats.upcomingVaccinationCount ?? 0,
      icon: Syringe,
      href: '/vaccinations',
      tone: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    },
    {
      title: 'Kayıtlı hasta',
      description: 'Aktif klinik kapsamı',
      value: data?.stats.patientCount ?? 0,
      icon: Users,
      href: '/patients',
      tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    },
    {
      title: 'Okunmamış bildirim',
      description: 'Operasyon bildirim kutusu',
      value: data?.stats.unreadNotificationCount ?? 0,
      icon: Bell,
      href: '/notifications',
      tone: 'bg-amber-50 text-amber-700 ring-amber-100',
    },
  ]

  return (
    <div data-testid="clinic-dashboard" className="min-h-full">
      <Header
        title="Pano"
        subtitle="Klinik operasyon ve sağlık kayıtları"
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 px-5 py-6 text-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.9)] sm:px-7 sm:py-7 lg:px-9 lg:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_right,black,transparent_78%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-cyan-300/10 bg-cyan-300/5" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <Badge className="border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-slate-100 shadow-none hover:bg-white/10">
                  KLİNİK OPERASYON ÖZETİ
                </Badge>
                <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <span className={`size-1.5 rounded-full ring-4 ${isError ? 'bg-amber-400 ring-amber-400/10' : 'bg-emerald-400 ring-emerald-400/10'}`} />
                  {isError ? 'Veri bağlantısı kontrol edilmeli' : isLoading ? 'Kayıtlar güncelleniyor' : 'Kayıt sistemi aktif'}
                </span>
              </div>

              <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
                Merhaba {firstName}, kliniğinizin bugünkü görünümü hazır.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                Muayene, aşı ve hasta kayıtlarını tek operasyon ekranından takip edin; öncelikli işleri gün içinde hızla tamamlayın.
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3 border-t border-white/10 pt-5 lg:min-w-64 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <CalendarDays className="size-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Bugün</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{today}</p>
              </div>
            </div>
          </div>
        </section>

        {isError && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <Clock3 className="mt-0.5 size-4 shrink-0" />
            <p className="leading-5">
              Klinik özeti şu anda alınamadı. Kayıt modüllerini kullanmaya devam edebilir, güncel özet için sayfayı daha sonra yenileyebilirsiniz.
            </p>
          </div>
        )}

        <section aria-label="Klinik göstergeleri" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map(stat => (
            <Link
              key={stat.title}
              href={stat.href}
              className="group min-h-40 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex size-10 items-center justify-center rounded-xl ring-1 ${stat.tone}`}>
                  <stat.icon className="size-[18px]" />
                </div>
                <ArrowRight className="size-4 -translate-x-1 text-slate-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </div>

              <div className="mt-5">
                {isLoading ? (
                  <Skeleton className="mb-2 h-8 w-14" />
                ) : isError ? (
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-400 sm:text-3xl">—</p>
                ) : (
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 tabular-nums sm:text-3xl">{stat.value.toLocaleString('tr-TR')}</p>
                )}
                <p className="mt-1.5 text-sm font-semibold text-slate-800">{stat.title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">{stat.description}</p>
              </div>
            </Link>
          ))}
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Son 7 gün</p>
                  <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-slate-900">Klinik aktivitesi</h3>
                  <p className="mt-1 text-xs text-slate-500">Muayene ve uygulanan aşı kayıtlarının günlük dağılımı</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2"><span className="size-2 rounded-sm bg-slate-900" />Muayene</span>
                  <span className="inline-flex items-center gap-2"><span className="size-2 rounded-sm bg-cyan-500" />Aşı</span>
                </div>
              </div>
              <div className="px-3 pb-4 pt-5 sm:px-5">
                <DashboardChart />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Klinik kayıtları</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">Son muayeneler</h3>
                </div>
                <Link href="/examinations" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">
                  Tüm kayıtlar <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3 p-5 sm:p-6">
                  {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-xl" />)}
                </div>
              ) : (data?.recentExaminations.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="Henüz muayene kaydı yok"
                  description="İlk klinik değerlendirme kaydedildiğinde burada görünecek."
                  href="/examinations/new"
                  action="Muayene oluştur"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data!.recentExaminations.map(examination => (
                    <Link
                      href={`/patients/${examination.pet.id}`}
                      key={examination.id}
                      className="group grid min-h-[76px] gap-3 px-5 py-4 transition hover:bg-slate-50/80 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                        <PawPrint className="size-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-slate-900">{examination.pet.name}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-xs text-slate-500">Dr. {withoutDoctorTitle(examination.veterinarian.fullName)}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {examination.complaint || 'Rutin klinik değerlendirme'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 sm:justify-self-end">
                        {formatDate(examination.createdAt)}
                        <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Kısayollar</p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">Hızlı işlemler</h3>

              <div className="mt-4 divide-y divide-slate-100">
                {QUICK_ACTIONS.map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex min-h-[68px] items-center gap-3 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-primary">
                      <action.icon className="size-[17px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{action.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Takip listesi</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">Aşı uyarıları</h3>
                </div>
                <Link href="/vaccinations" aria-label="Tüm aşı kayıtlarını görüntüle" className="flex size-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3 p-5 sm:p-6">
                  {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-xl" />)}
                </div>
              ) : (data?.upcomingVaccinations.length ?? 0) === 0 ? (
                <div className="px-5 py-8 text-center sm:px-6">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">Takvim güncel</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Yaklaşan veya geciken aşı kaydı bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 px-5 sm:px-6">
                  {data!.upcomingVaccinations.map(vaccination => {
                    const overdue = isVaccinationOverdue(vaccination.dueAt)
                    return (
                      <Link
                        href={`/patients/${vaccination.pet.id}`}
                        key={vaccination.id}
                        className="flex min-h-[72px] items-center gap-3 py-4"
                      >
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${overdue ? 'bg-red-50 text-red-700 ring-red-100' : 'bg-amber-50 text-amber-700 ring-amber-100'}`}>
                          {overdue ? <Clock3 className="size-4" /> : <CalendarDays className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{vaccination.pet.name}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{vaccination.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-semibold uppercase tracking-wide ${overdue ? 'text-red-700' : 'text-amber-700'}`}>
                            {overdue ? 'Gecikti' : 'Yaklaşıyor'}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">{formatDate(vaccination.dueAt)}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="border-t border-slate-100 p-4 sm:px-5">
                <Link href="/vaccinations?filter=upcoming" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                  <CalendarDays className="size-4" />
                  Aşı takvimini görüntüle
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
      <Link href={href} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
        {action} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

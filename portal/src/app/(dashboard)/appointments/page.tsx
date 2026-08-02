'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PawPrint,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  appointmentsService,
  type Appointment,
  type AppointmentStatus,
} from '@/services/appointments.service'

const STATUS_FILTERS: Array<{ label: string; value: 'all' | AppointmentStatus }> = [
  { label: 'Tümü', value: 'all' },
  { label: 'Bekleyen', value: 'pending' },
  { label: 'Onaylı', value: 'confirmed' },
  { label: 'Tamamlanan', value: 'completed' },
  { label: 'İptal', value: 'cancelled' },
]

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  confirmed: 'border-teal-200 bg-teal-50 text-teal-800',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all')
  const [mobileDayIndex, setMobileDayIndex] = useState(() => mondayIndex(new Date()))
  const weekStart = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset])
  const weekEnd = useMemo(() => endOfDay(addDays(weekStart, 6)), [weekStart])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => appointmentsService.getAll({
      from: weekStart.toISOString(),
      to: weekEnd.toISOString(),
    }),
    retry: 1,
  })

  const invalidateAppointments = () => {
    void queryClient.invalidateQueries({ queryKey: ['appointments'] })
  }

  const confirmAppointment = useMutation({
    mutationFn: appointmentsService.confirm,
    onSuccess: () => {
      toast.success('Randevu onaylandı')
      invalidateAppointments()
    },
    onError: () => toast.error('Randevu onaylanamadı. Lütfen yeniden deneyin.'),
  })
  const cancelAppointment = useMutation({
    mutationFn: (id: string) => appointmentsService.cancel(id),
    onSuccess: () => {
      toast.success('Randevu iptal edildi')
      invalidateAppointments()
    },
    onError: () => toast.error('Randevu iptal edilemedi. Lütfen yeniden deneyin.'),
  })
  const completeAppointment = useMutation({
    mutationFn: (id: string) => appointmentsService.complete(id),
    onSuccess: () => {
      toast.success('Randevu tamamlandı')
      invalidateAppointments()
    },
    onError: () => toast.error('Randevu tamamlanamadı. Lütfen yeniden deneyin.'),
  })

  const appointments = useMemo(() => (appointmentsQuery.data ?? [])
    .filter(appointment => {
      const timestamp = appointmentTimestamp(appointment)
      return timestamp >= weekStart.getTime() && timestamp <= weekEnd.getTime()
    })
    .sort((a, b) => appointmentTimestamp(a) - appointmentTimestamp(b)),
  [appointmentsQuery.data, weekEnd, weekStart])

  const visibleAppointments = useMemo(() => appointments.filter(appointment => (
    statusFilter === 'all' || appointment.status === statusFilter
  )), [appointments, statusFilter])

  const pendingAppointments = appointments.filter(appointment => appointment.status === 'pending')
  const todaysAppointments = appointments.filter(appointment => (
    isSameDay(appointmentDate(appointment), new Date()) && appointment.status !== 'cancelled'
  ))
  const todaysConfirmed = todaysAppointments.filter(appointment => appointment.status === 'confirmed')
  const activePetCount = new Set(appointments
    .filter(appointment => appointment.status !== 'cancelled')
    .map(appointment => appointment.petId)
    .filter(Boolean)).size
  const selectedMobileDay = weekDays[mobileDayIndex] ?? weekDays[0]
  const mobileAppointments = visibleAppointments.filter(appointment => isSameDay(appointmentDate(appointment), selectedMobileDay))

  const busyAppointmentId = confirmAppointment.isPending
    ? confirmAppointment.variables
    : cancelAppointment.isPending
      ? cancelAppointment.variables
      : completeAppointment.isPending
        ? completeAppointment.variables
        : undefined

  const handleWeekChange = (nextOffset: number) => {
    setWeekOffset(nextOffset)
    setMobileDayIndex(nextOffset === 0 ? mondayIndex(new Date()) : 0)
  }

  return (
    <div data-testid="appointments-page" className="min-h-full">
      <Header title="Randevular" subtitle="Klinik programı ve randevu talepleri" />

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <CalendarDays className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Haftalık klinik programı</h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Randevu taleplerini, onaylı ziyaretleri ve tamamlanan işlemleri gerçek hafta tarihleriyle yönetin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4 xl:min-w-[430px] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              <SummaryMetric label="Bugün" value={todaysAppointments.length} loading={appointmentsQuery.isLoading} />
              <SummaryMetric label="Bekleyen" value={pendingAppointments.length} loading={appointmentsQuery.isLoading} />
              <SummaryMetric label="Aktif hasta" value={activePetCount} loading={appointmentsQuery.isLoading} />
            </div>
          </div>
        </section>

        <section aria-label="Randevu haftası ve durum filtreleri" className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <Button type="button" variant="outline" size="icon" aria-label="Önceki hafta" onClick={() => handleWeekChange(weekOffset - 1)} className="size-10 border-slate-200 bg-white">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="min-w-0 flex-1 text-center sm:min-w-56 sm:flex-none">
                <p className="text-sm font-semibold text-slate-900">{formatWeekRange(weekStart, weekEnd)}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{weekOffset === 0 ? 'Bu hafta' : weekOffset < 0 ? 'Geçmiş hafta' : 'Gelecek hafta'}</p>
              </div>
              <Button type="button" variant="outline" size="icon" aria-label="Sonraki hafta" onClick={() => handleWeekChange(weekOffset + 1)} className="size-10 border-slate-200 bg-white">
                <ChevronRight className="size-4" />
              </Button>
              {weekOffset !== 0 && (
                <Button type="button" variant="ghost" onClick={() => handleWeekChange(0)} className="hidden h-10 px-3 text-xs text-slate-600 sm:inline-flex">Bugün</Button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Randevu durumuna göre filtrele">
                {STATUS_FILTERS.map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={statusFilter === filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'min-h-9 rounded-lg border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      statusFilter === filter.value
                        ? 'border-teal-200 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <Link href="/appointments/new" className={cn(buttonVariants(), 'h-10 gap-2 bg-teal-700 px-4 text-white hover:bg-teal-800')}>
                <Plus className="size-4" /> Yeni Randevu
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p aria-live="polite">
              {appointmentsQuery.isLoading
                ? 'Randevular getiriliyor'
                : appointmentsQuery.isError
                  ? 'Program alınamadı'
                  : statusFilter === 'all'
                    ? `${appointments.length} haftalık kayıt`
                    : `${visibleAppointments.length} ${STATUS_FILTERS.find(filter => filter.value === statusFilter)?.label.toLocaleLowerCase('tr-TR')} kayıt`}
            </p>
            {appointmentsQuery.isFetching && !appointmentsQuery.isLoading && (
              <span className="inline-flex items-center gap-2 text-slate-400"><RefreshCw className="size-3 animate-spin" /> Program güncelleniyor</span>
            )}
          </div>
        </section>

        {appointmentsQuery.isError ? (
          <AppointmentsError onRetry={() => appointmentsQuery.refetch()} />
        ) : appointmentsQuery.isLoading ? (
          <AppointmentsPageSkeleton />
        ) : (
          <div className="space-y-5">
            <section data-testid="weekly-schedule" aria-labelledby="weekly-calendar-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/55 px-5 py-4 sm:px-6">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-teal-700">
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <h2 id="weekly-calendar-title" className="text-sm font-semibold text-slate-950">Haftalık program</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Randevular saat sırasıyla gösterilir</p>
                </div>
              </div>

              <div className="hidden grid-cols-7 divide-x divide-slate-100 xl:grid">
                {weekDays.map(day => (
                  <DayColumn
                    key={day.toISOString()}
                    day={day}
                    appointments={visibleAppointments.filter(appointment => isSameDay(appointmentDate(appointment), day))}
                    busyAppointmentId={busyAppointmentId}
                    onConfirm={id => confirmAppointment.mutate(id)}
                    onCancel={id => cancelAppointment.mutate(id)}
                    onComplete={id => completeAppointment.mutate(id)}
                  />
                ))}
              </div>

              <div className="p-4 sm:p-5 xl:hidden">
                <Select value={String(mobileDayIndex)} onValueChange={value => setMobileDayIndex(Number(value ?? 0))}>
                  <SelectTrigger aria-label="Ajanda günü seç" className="h-11 w-full rounded-lg border-slate-200 bg-white px-3">
                    <SelectValue placeholder="Gün seçin">{formatDayFull(selectedMobileDay)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {weekDays.map((day, index) => <SelectItem key={day.toISOString()} value={String(index)}>{formatDayFull(day)}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="mt-4 space-y-3">
                  {mobileAppointments.length === 0 ? (
                    <DayEmpty compact />
                  ) : mobileAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      busy={busyAppointmentId === appointment.id}
                      onConfirm={() => confirmAppointment.mutate(appointment.id)}
                      onCancel={() => cancelAppointment.mutate(appointment.id)}
                      onComplete={() => completeAppointment.mutate(appointment.id)}
                      roomy
                    />
                  ))}
                </div>
              </div>
            </section>

            <aside className="grid items-start gap-5 md:grid-cols-2">
              <QueuePanel
                icon={Clock3}
                title="Bekleyen talepler"
                description="Klinik onayı bekleyen mobil talepler"
                appointments={pendingAppointments}
                emptyText="Bekleyen randevu talebi yok"
                busyAppointmentId={busyAppointmentId}
                onConfirm={id => confirmAppointment.mutate(id)}
                onCancel={id => cancelAppointment.mutate(id)}
                onComplete={id => completeAppointment.mutate(id)}
              />
              <QueuePanel
                icon={CheckCircle2}
                title="Bugünkü ziyaretler"
                description="Tamamlanmayı bekleyen onaylı randevular"
                appointments={todaysConfirmed}
                emptyText="Bugün tamamlanacak onaylı randevu yok"
                busyAppointmentId={busyAppointmentId}
                onConfirm={id => confirmAppointment.mutate(id)}
                onCancel={id => cancelAppointment.mutate(id)}
                onComplete={id => completeAppointment.mutate(id)}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function DayColumn({
  day,
  appointments,
  busyAppointmentId,
  onConfirm,
  onCancel,
  onComplete,
}: {
  day: Date
  appointments: Appointment[]
  busyAppointmentId?: string
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
  onComplete: (id: string) => void
}) {
  const today = isSameDay(day, new Date())

  return (
    <div className="min-w-0">
      <div className={cn('border-b border-slate-100 px-2 py-3 text-center', today && 'bg-teal-50/70')}>
        <p className={cn('text-[10px] font-semibold uppercase tracking-[0.1em]', today ? 'text-teal-700' : 'text-slate-400')}>{day.toLocaleDateString('tr-TR', { weekday: 'short' })}</p>
        <p className={cn('mt-1 text-sm font-semibold', today ? 'text-teal-900' : 'text-slate-800')}>{day.getDate()}</p>
      </div>
      <div className="min-h-[410px] space-y-2 bg-slate-50/25 p-2">
        {appointments.length === 0 ? <DayEmpty /> : appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            busy={busyAppointmentId === appointment.id}
            onConfirm={() => onConfirm(appointment.id)}
            onCancel={() => onCancel(appointment.id)}
            onComplete={() => onComplete(appointment.id)}
          />
        ))}
      </div>
    </div>
  )
}

function AppointmentCard({
  appointment,
  busy,
  onConfirm,
  onCancel,
  onComplete,
  roomy = false,
}: {
  appointment: Appointment
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
  onComplete: () => void
  roomy?: boolean
}) {
  const petName = appointment.pet?.name ?? 'Hasta bilgisi yok'

  return (
    <article data-testid={`appointment-card-${appointment.id}`} data-layout={roomy ? 'roomy' : 'compact'} className={cn('rounded-lg border border-slate-200 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.02)]', roomy ? 'p-4' : 'p-2.5')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tabular-nums text-teal-700">{formatTime(appointmentDate(appointment))}</p>
          <Link href={`/appointments/${appointment.id}`} className={cn('mt-1 block truncate font-semibold text-slate-900 hover:text-teal-700', roomy ? 'text-sm' : 'text-xs')}>
            {petName}
          </Link>
        </div>
        <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold', STATUS_STYLES[appointment.status])}>{STATUS_LABELS[appointment.status]}</span>
      </div>
      <p className={cn('mt-2 text-slate-500', roomy ? 'line-clamp-2 text-xs leading-5' : 'line-clamp-2 text-[10px] leading-4')}>{appointment.reason || 'Randevu nedeni belirtilmemiş'}</p>
      {roomy && <p className="mt-1 text-[11px] text-slate-400">{appointment.pet?.owner?.fullName ?? 'Sahip bilgisi yok'}</p>}
      {roomy ? (
        <AppointmentActions appointment={appointment} busy={busy} onConfirm={onConfirm} onCancel={onCancel} onComplete={onComplete} />
      ) : null}
    </article>
  )
}

function AppointmentActions({
  appointment,
  busy,
  onConfirm,
  onCancel,
  onComplete,
}: {
  appointment: Appointment
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
  onComplete: () => void
}) {
  const petName = appointment.pet?.name ?? 'Hasta'

  if (appointment.status === 'pending') {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <Button type="button" size="sm" disabled={busy} aria-label={`${petName} randevusunu onayla`} onClick={onConfirm} className="h-9 bg-teal-700 text-xs text-white hover:bg-teal-800">
          {busy ? <RefreshCw className="size-3 animate-spin" /> : 'Onayla'}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} aria-label={`${petName} randevusunu iptal et`} onClick={onCancel} className="h-9 border-slate-200 text-xs">
          İptal
        </Button>
      </div>
    )
  }

  if (appointment.status === 'confirmed') {
    return (
      <Button type="button" size="sm" variant="outline" disabled={busy} aria-label={`${petName} randevusunu tamamla`} onClick={onComplete} className="mt-3 h-9 w-full border-teal-200 text-xs text-teal-800 hover:bg-teal-50">
        {busy ? <RefreshCw className="size-3 animate-spin" /> : 'Tamamlandı'}
      </Button>
    )
  }

  return null
}

function QueuePanel({
  icon: Icon,
  title,
  description,
  appointments,
  emptyText,
  busyAppointmentId,
  onConfirm,
  onCancel,
  onComplete,
}: {
  icon: typeof Clock3
  title: string
  description: string
  appointments: Appointment[]
  emptyText: string
  busyAppointmentId?: string
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
  onComplete: (id: string) => void
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="size-4" /></div>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {appointments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <PawPrint className="mx-auto size-5 text-slate-400" />
            <p className="mt-3 text-xs leading-5 text-slate-500">{emptyText}</p>
          </div>
        ) : appointments.slice(0, 5).map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            busy={busyAppointmentId === appointment.id}
            onConfirm={() => onConfirm(appointment.id)}
            onCancel={() => onCancel(appointment.id)}
            onComplete={() => onComplete(appointment.id)}
            roomy
          />
        ))}
      </div>
    </section>
  )
}

function SummaryMetric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="px-3 text-center first:pl-0 last:pr-0 sm:px-5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      {loading ? <Skeleton className="mx-auto mt-2 h-7 w-12" /> : <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 tabular-nums">{value.toLocaleString('tr-TR')}</p>}
    </div>
  )
}

function DayEmpty({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70 text-center', compact ? 'min-h-48 p-6' : 'min-h-28 px-2 py-5')}>
      <CalendarDays className="size-4 text-slate-300" />
      <p className="mt-2 text-[10px] leading-4 text-slate-400">Randevu yok</p>
    </div>
  )
}

function AppointmentsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200"><AlertTriangle className="size-5" /></div>
      <h3 className="mt-5 text-base font-semibold text-amber-950">Randevu programı alınamadı</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-amber-800">Klinik randevu servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.</p>
      <Button type="button" variant="outline" onClick={onRetry} className="mt-5 h-11 gap-2 border-amber-300 bg-white px-4 text-amber-900 hover:bg-amber-100"><RefreshCw className="size-4" /> Yeniden dene</Button>
    </section>
  )
}

function AppointmentsPageSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Skeleton className="h-[34rem] rounded-xl" />
      <div className="space-y-4"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>
    </div>
  )
}

function getAppointmentDateValue(appointment: Appointment): string {
  return appointment.scheduledAt ?? appointment.startsAt ?? appointment.createdAt ?? ''
}

function appointmentDate(appointment: Appointment): Date {
  return new Date(getAppointmentDateValue(appointment))
}

function appointmentTimestamp(appointment: Appointment): number {
  const timestamp = appointmentDate(appointment).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const difference = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + difference)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function mondayIndex(date: Date): number {
  return date.getDay() === 0 ? 6 : date.getDay() - 1
}

function isSameDay(first: Date, second: Date): boolean {
  if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) return false
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

function formatTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDayFull(date: Date): string {
  return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatWeekRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) return `${start.getDate()}–${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

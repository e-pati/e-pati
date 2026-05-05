'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Clock3, Plus, Stethoscope, Users } from 'lucide-react'
import { appointmentsService, type Appointment } from '@/services/appointments.service'

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

const appointmentContracts = [
  'GET /appointments?from=&to=',
  'POST /appointments',
  'PATCH /appointments/:id',
  'POST /appointments/:id/confirm',
  'PATCH /appointments/:id { status: completed }',
]

const statusLabel: Record<string, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

const statusFilters = [
  { label: 'Tümü', value: 'all' },
  { label: 'Bekleyen', value: 'pending' },
  { label: 'Onaylı', value: 'confirmed' },
  { label: 'Tamamlanan', value: 'completed' },
] as const

function getAppointmentDate(appointment: Appointment) {
  return appointment.scheduledAt ?? appointment.startsAt ?? appointment.createdAt ?? ''
}

function formatTime(value: string) {
  if (!value) return '--:--'
  return new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function isToday(value: string) {
  if (!value) return false
  const date = new Date(value)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function dayIndexForAppointment(value: string) {
  if (!value) return -1
  const day = new Date(value).getDay()
  return day === 0 ? 6 : day - 1
}

function hourForAppointment(value: string) {
  if (!value) return ''
  const hour = new Date(value).getHours()
  return `${String(hour).padStart(2, '0')}:00`
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]['value']>('all')
  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.getAll(),
    retry: 1,
  })
  const confirmAppointment = useMutation({
    mutationFn: appointmentsService.confirm,
    onSuccess: () => {
      toast.success('Randevu onaylandı')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: () => {
      toast.error('Randevu onay servisi henüz hazır değil')
    },
  })
  const cancelAppointment = useMutation({
    mutationFn: appointmentsService.cancel,
    onSuccess: () => {
      toast.success('Randevu iptal edildi')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: () => {
      toast.error('Randevu iptal servisi henüz hazır değil')
    },
  })
  const completeAppointment = useMutation({
    mutationFn: appointmentsService.complete,
    onSuccess: () => {
      toast.success('Randevu tamamlandı')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: () => {
      toast.error('Randevu tamamlama servisi henüz hazır değil')
    },
  })

  const appointments = useMemo(
    () => (appointmentsQuery.data ?? []).sort((a, b) => (
      new Date(getAppointmentDate(a)).getTime() - new Date(getAppointmentDate(b)).getTime()
    )),
    [appointmentsQuery.data]
  )
  const visibleAppointments = useMemo(() => (
    appointments.filter(appointment => statusFilter === 'all' || appointment.status === statusFilter)
  ), [appointments, statusFilter])

  const pendingAppointments = appointments.filter(appointment => appointment.status === 'pending')
  const todaysActiveAppointments = appointments.filter(appointment => (
    isToday(getAppointmentDate(appointment))
    && appointment.status !== 'pending'
    && appointment.status !== 'cancelled'
    && appointment.status !== 'completed'
  ))
  const activePetCount = new Set(appointments.map(appointment => appointment.petId).filter(Boolean)).size
  const stats = [
    { label: 'Bugünkü Randevu', value: appointments.filter(appointment => isToday(getAppointmentDate(appointment))).length, icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Bekleyen Talep', value: pendingAppointments.length, icon: Clock3, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Aktif Hasta', value: activePetCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ]

  return (
    <div>
      <Header title="Randevular" subtitle="Takvim görünümü ve randevu talep akışı" />

      <div className="p-6 space-y-6">
        {appointmentsQuery.isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Randevu servisi henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(item => (
            <Card key={item.label} className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Haftalık Takvim</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {appointmentsQuery.isLoading ? 'Randevular yükleniyor...' : 'Randevu slotları API verisiyle doldurulur.'}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map(filter => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                          statusFilter === filter.value
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-gray-100 bg-gray-50 text-muted-foreground hover:bg-white hover:text-foreground'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <Button render={<Link href="/appointments/new" />} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Randevu
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[76px_repeat(7,1fr)] border-b border-gray-100">
                    <div className="p-3 text-xs font-medium text-muted-foreground">Saat</div>
                    {weekDays.map(day => (
                      <div key={day} className="p-3 text-xs font-semibold text-foreground text-center border-l border-gray-100">
                        {day}
                      </div>
                    ))}
                  </div>
                  {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-[76px_repeat(7,1fr)] min-h-16 border-b border-gray-50 last:border-b-0">
                      <div className="p-3 text-xs text-muted-foreground">{hour}</div>
                      {weekDays.map((day, dayIndex) => {
                        const slotAppointments = visibleAppointments.filter(appointment => (
                          dayIndexForAppointment(getAppointmentDate(appointment)) === dayIndex
                          && hourForAppointment(getAppointmentDate(appointment)) === hour
                        ))

                        return (
                          <div key={`${day}-${hour}`} className="border-l border-gray-50 p-2">
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-1">
                                {slotAppointments.map(appointment => (
                                  <Link key={appointment.id} href={`/appointments/${appointment.id}`} className="block rounded-xl border border-primary/20 bg-primary/10 px-2 py-1.5 transition-colors hover:bg-primary/15">
                                    <p className="truncate text-xs font-semibold text-primary">
                                      {appointment.pet?.name ?? appointment.reason}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                      {formatTime(getAppointmentDate(appointment))} · {statusLabel[appointment.status] ?? appointment.status}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full rounded-xl border border-dashed border-gray-100 bg-gray-50/60" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <Badge className="bg-blue-500/10 text-blue-600 border-0 mb-4">Bugün</Badge>
                <h2 className="text-sm font-semibold text-foreground">Bugünkü onaylı randevular</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Muayene tamamlandığında randevuyu kapatıp listeyi güncel tutun.
                </p>
                <div className="mt-5 space-y-3">
                  {todaysActiveAppointments.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-6 text-center">
                      <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Bugün tamamlanacak onaylı randevu yok</p>
                    </div>
                  ) : todaysActiveAppointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{appointment.pet?.name ?? appointment.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(getAppointmentDate(appointment))} · {appointment.pet?.owner?.fullName ?? 'Sahip bilgisi bekleniyor'}
                          </p>
                        </div>
                        <Badge variant="outline">{statusLabel[appointment.status] ?? appointment.status}</Badge>
                      </div>
                      {appointment.reason && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{appointment.reason}</p>
                      )}
                      <Button
                        size="sm"
                        className="mt-3 h-7 w-full"
                        onClick={() => completeAppointment.mutate(appointment.id)}
                        disabled={completeAppointment.isPending}
                      >
                        Tamamlandı İşaretle
                      </Button>
                      <Button render={<Link href={`/appointments/${appointment.id}`} />} size="sm" variant="outline" className="mt-2 h-7 w-full">
                        Detay
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <Badge className="bg-primary/10 text-primary border-0 mb-4">Mobil talepler</Badge>
                <h2 className="text-sm font-semibold text-foreground">Bekleyen randevu talepleri</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Hayvan sahipleri mobil uygulamadan randevu talep eder; klinik bu listeden onay akışına geçer.
                </p>
                <div className="mt-5 space-y-3">
                  {pendingAppointments.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-6 text-center">
                      <Stethoscope className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Bekleyen randevu talebi yok</p>
                    </div>
                  ) : pendingAppointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-foreground">{appointment.pet?.name ?? appointment.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(getAppointmentDate(appointment))} · {appointment.pet?.owner?.fullName ?? 'Sahip bilgisi bekleniyor'}
                      </p>
                      {appointment.reason && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{appointment.reason}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 flex-1"
                          onClick={() => confirmAppointment.mutate(appointment.id)}
                          disabled={confirmAppointment.isPending || cancelAppointment.isPending}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 flex-1"
                          onClick={() => cancelAppointment.mutate(appointment.id)}
                          disabled={confirmAppointment.isPending || cancelAppointment.isPending}
                        >
                          İptal
                        </Button>
                      </div>
                      <Button render={<Link href={`/appointments/${appointment.id}`} />} size="sm" variant="ghost" className="mt-2 h-7 w-full">
                        Detay
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
                <div className="mt-4 space-y-2">
                  {appointmentContracts.map(endpoint => (
                    <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                      {endpoint}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

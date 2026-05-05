'use client'

import { use } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { appointmentsService, type Appointment } from '@/services/appointments.service'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, PawPrint, Phone, Stethoscope, UserRound, XCircle } from 'lucide-react'

const statusLabel: Record<string, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

const statusTone: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-0',
  confirmed: 'bg-primary/10 text-primary border-0',
  cancelled: 'bg-red-100 text-red-700 border-0',
  completed: 'bg-blue-100 text-blue-700 border-0',
}

const detailContracts = [
  'GET /appointments/:id',
  'POST /appointments/:id/confirm',
  'PATCH /appointments/:id { status: cancelled }',
  'PATCH /appointments/:id { status: completed }',
]

function getAppointmentDate(appointment?: Appointment) {
  return appointment?.scheduledAt ?? appointment?.startsAt ?? appointment?.createdAt ?? ''
}

function formatDateTime(value: string) {
  if (!value) return 'Tarih bekleniyor'
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const appointmentQuery = useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsService.getOne(id),
    retry: 1,
  })

  const refreshAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    queryClient.invalidateQueries({ queryKey: ['appointments', id] })
  }

  const confirmAppointment = useMutation({
    mutationFn: appointmentsService.confirm,
    onSuccess: () => {
      toast.success('Randevu onaylandı')
      refreshAppointments()
    },
    onError: () => toast.error('Randevu onay servisi henüz hazır değil'),
  })
  const cancelAppointment = useMutation({
    mutationFn: appointmentsService.cancel,
    onSuccess: () => {
      toast.success('Randevu iptal edildi')
      refreshAppointments()
    },
    onError: () => toast.error('Randevu iptal servisi henüz hazır değil'),
  })
  const completeAppointment = useMutation({
    mutationFn: appointmentsService.complete,
    onSuccess: () => {
      toast.success('Randevu tamamlandı')
      refreshAppointments()
    },
    onError: () => toast.error('Randevu tamamlama servisi henüz hazır değil'),
  })

  const appointment = appointmentQuery.data
  const appointmentDate = getAppointmentDate(appointment)
  const actionDisabled = confirmAppointment.isPending || cancelAppointment.isPending || completeAppointment.isPending

  return (
    <div>
      <Header title="Randevu Detayı" subtitle="Klinik randevu bilgileri ve durum aksiyonları" />

      <div className="p-6 space-y-6">
        <Button render={<Link href="/appointments" />} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Randevulara Dön
        </Button>

        {appointmentQuery.isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Randevu detay servisi henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        {appointmentQuery.isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-sm">
            Randevu detayı yükleniyor...
          </div>
        ) : !appointment ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-sm">
            Randevu bulunamadı.
          </div>
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge className={statusTone[appointment.status] ?? 'bg-gray-100 text-gray-700 border-0'}>
                      {statusLabel[appointment.status] ?? appointment.status}
                    </Badge>
                    <h1 className="mt-4 text-2xl font-bold text-foreground">
                      {appointment.pet?.name ?? 'Randevu'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">{appointment.reason || 'Randevu sebebi bekleniyor'}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <CalendarDays className="h-7 w-7" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock icon={Clock3} label="Tarih ve saat" value={formatDateTime(appointmentDate)} />
                  <InfoBlock icon={Stethoscope} label="Süre" value={`${appointment.durationMinutes ?? 30} dakika`} />
                  <InfoBlock icon={PawPrint} label="Hasta" value={appointment.pet?.name ?? 'Hasta bilgisi bekleniyor'} />
                  <InfoBlock icon={UserRound} label="Sahip" value={appointment.pet?.owner?.fullName ?? 'Sahip bilgisi bekleniyor'} />
                  <InfoBlock icon={Phone} label="Telefon" value={appointment.pet?.owner?.phone ?? 'Telefon bilgisi bekleniyor'} />
                  <InfoBlock icon={CalendarDays} label="Bildirim" value={appointment.notifyOwner ? 'Sahibe bildirim gönderilecek' : 'Bildirim seçilmedi'} />
                </div>

                {appointment.notes && (
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <h2 className="text-sm font-semibold text-foreground">Notlar</h2>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <h2 className="text-sm font-semibold text-foreground">Durum aksiyonları</h2>
                  <div className="mt-4 space-y-2">
                    {appointment.status === 'pending' && (
                      <Button
                        className="w-full gap-2"
                        onClick={() => confirmAppointment.mutate(appointment.id)}
                        disabled={actionDisabled}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Onayla
                      </Button>
                    )}
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <Button
                        className="w-full gap-2"
                        variant="outline"
                        onClick={() => cancelAppointment.mutate(appointment.id)}
                        disabled={actionDisabled}
                      >
                        <XCircle className="w-4 h-4" />
                        İptal Et
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        className="w-full gap-2"
                        variant="outline"
                        onClick={() => completeAppointment.mutate(appointment.id)}
                        disabled={actionDisabled}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Tamamlandı İşaretle
                      </Button>
                    )}
                    {appointment.petId && (
                      <Button render={<Link href={`/patients/${appointment.petId}`} />} className="w-full" variant="ghost">
                        Hasta Kartını Aç
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
                  <div className="mt-4 space-y-2">
                    {detailContracts.map(endpoint => (
                      <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function InfoBlock({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

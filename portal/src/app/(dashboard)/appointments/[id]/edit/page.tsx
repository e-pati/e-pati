'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, CalendarClock, Save } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { appointmentsService, type Appointment } from '@/services/appointments.service'

const appointmentEditSchema = z.object({
  appointmentDate: z.string().min(1, 'Tarih seçiniz'),
  appointmentTime: z.string().min(1, 'Saat seçiniz'),
  durationMinutes: z.number().min(15, 'En az 15 dakika').max(180, 'En fazla 180 dakika'),
  reason: z.string().min(3, 'Randevu nedeni giriniz'),
  veterinarianId: z.string().optional(),
  notes: z.string().optional(),
  notifyOwner: z.boolean(),
})

type AppointmentEditForm = z.infer<typeof appointmentEditSchema>

const durationOptions = [
  { value: '15', label: '15 dk' },
  { value: '30', label: '30 dk' },
  { value: '45', label: '45 dk' },
  { value: '60', label: '60 dk' },
  { value: '90', label: '90 dk' },
]

const defaultFormValues: AppointmentEditForm = {
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '09:00',
  durationMinutes: 30,
  reason: '',
  veterinarianId: '',
  notes: '',
  notifyOwner: true,
}

const editContracts = [
  'GET /appointments/:id',
  'PATCH /appointments/:id',
]

function getAppointmentDate(appointment?: Appointment) {
  return appointment?.scheduledAt ?? appointment?.startsAt ?? appointment?.createdAt ?? ''
}

function dateInputValue(value: string) {
  if (!value) return defaultFormValues.appointmentDate
  const date = new Date(value)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function timeInputValue(value: string) {
  if (!value) return defaultFormValues.appointmentTime
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formValuesFromAppointment(appointment?: Appointment): AppointmentEditForm {
  if (!appointment) return defaultFormValues
  const appointmentDate = getAppointmentDate(appointment)
  return {
    appointmentDate: dateInputValue(appointmentDate),
    appointmentTime: timeInputValue(appointmentDate),
    durationMinutes: appointment.durationMinutes ?? 30,
    reason: appointment.reason ?? '',
    veterinarianId: appointment.veterinarianId ?? '',
    notes: appointment.notes ?? '',
    notifyOwner: appointment.notifyOwner ?? true,
  }
}

export default function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const appointmentQuery = useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsService.getOne(id),
    retry: 1,
  })
  const formValues = useMemo(() => formValuesFromAppointment(appointmentQuery.data), [appointmentQuery.data])

  const updateAppointment = useMutation({
    mutationFn: (data: AppointmentEditForm) => appointmentsService.update(id, {
      scheduledAt: `${data.appointmentDate}T${data.appointmentTime}:00`,
      durationMinutes: data.durationMinutes,
      reason: data.reason,
      veterinarianId: data.veterinarianId || undefined,
      notes: data.notes || undefined,
      notifyOwner: data.notifyOwner,
    }),
    onSuccess: appointment => {
      toast.success('Randevu güncellendi')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
      router.push(`/appointments/${appointment.id}`)
    },
    onError: () => {
      toast.error('Randevu güncelleme servisi henüz hazır değil')
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentEditForm>({
    resolver: zodResolver(appointmentEditSchema),
    values: formValues,
  })

  const notifyOwner = useWatch({ control, name: 'notifyOwner' })
  const durationMinutes = useWatch({ control, name: 'durationMinutes' })

  return (
    <div>
      <Header title="Randevu Düzenle" subtitle="Randevu saatini, süresini ve klinik notunu güncelleyin" />

      <div className="p-6 space-y-6 max-w-5xl">
        <Link
          href={`/appointments/${id}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
        >
          <ArrowLeft className="w-4 h-4" />
          Detaya Dön
        </Link>

        {appointmentQuery.isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Randevu detay servisi henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        {appointmentQuery.isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-muted-foreground shadow-sm">
            Randevu bilgileri yükleniyor...
          </div>
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
            <form onSubmit={handleSubmit(data => updateAppointment.mutate(data))} className="space-y-5">
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-primary" />
                    Randevu Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tarih</Label>
                    <Input
                      type="date"
                      {...register('appointmentDate')}
                      className={cn(errors.appointmentDate && 'border-destructive')}
                    />
                    {errors.appointmentDate && <p className="text-xs text-destructive">{errors.appointmentDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Saat</Label>
                    <Input
                      type="time"
                      {...register('appointmentTime')}
                      className={cn(errors.appointmentTime && 'border-destructive')}
                    />
                    {errors.appointmentTime && <p className="text-xs text-destructive">{errors.appointmentTime.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Süre</Label>
                    <Select
                      value={String(durationMinutes ?? 30)}
                      onValueChange={(value: string | null) => {
                        if (value) setValue('durationMinutes', Number(value), { shouldValidate: true })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.durationMinutes && <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Veteriner ID</Label>
                    <Input placeholder="Opsiyonel" {...register('veterinarianId')} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Randevu Nedeni</Label>
                    <Input
                      placeholder="Örn. Kontrol muayenesi"
                      {...register('reason')}
                      className={cn(errors.reason && 'border-destructive')}
                    />
                    {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Not</Label>
                    <textarea
                      rows={4}
                      placeholder="Klinik içi not, hazırlık veya özel durum..."
                      {...register('notes')}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOwner}
                      onChange={event => setValue('notifyOwner', event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
                    />
                    <span>
                      <span className="text-sm font-semibold text-foreground">Sahibe güncelleme bildirimi gönder</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        Backend hazır olduğunda randevu değişikliği push/WhatsApp kuyruğuna alınabilir.
                      </span>
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || updateAppointment.isPending} className="gap-2">
                      <Save className="w-4 h-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            <aside className="space-y-5">
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <Badge className="bg-primary/10 text-primary border-0 mb-4">Düzenleme</Badge>
                  <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
                  <div className="mt-4 space-y-2">
                    {editContracts.map(endpoint => (
                      <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>
        )}
      </div>
    </div>
  )
}

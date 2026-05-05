'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Bell, CalendarPlus, CheckCircle2 } from 'lucide-react'
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
import { usePets } from '@/hooks/use-pets'
import { appointmentsService } from '@/services/appointments.service'
import { whatsappService } from '@/services/whatsapp.service'

const appointmentSchema = z.object({
  petId: z.string().min(1, 'Hasta seçiniz'),
  appointmentDate: z.string().min(1, 'Tarih seçiniz'),
  appointmentTime: z.string().min(1, 'Saat seçiniz'),
  durationMinutes: z.number().min(15, 'En az 15 dakika').max(180, 'En fazla 180 dakika'),
  reason: z.string().min(3, 'Randevu nedeni giriniz'),
  veterinarianId: z.string().optional(),
  notes: z.string().optional(),
  notifyOwner: z.boolean(),
  sendWhatsappReminder: z.boolean(),
})

type AppointmentForm = z.infer<typeof appointmentSchema>

const durationOptions = [
  { value: '15', label: '15 dk' },
  { value: '30', label: '30 dk' },
  { value: '45', label: '45 dk' },
  { value: '60', label: '60 dk' },
]

const contractSteps = [
  'POST /appointments',
  'POST /appointments/:id/confirm',
  'POST /notifications/preferences',
]

export default function NewAppointmentPage() {
  const router = useRouter()
  const petsQuery = usePets()
  const createAppointment = useMutation({
    mutationFn: appointmentsService.create,
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      durationMinutes: 30,
      notifyOwner: true,
      sendWhatsappReminder: true,
    },
  })

  const notifyOwner = useWatch({ control, name: 'notifyOwner' })
  const sendWhatsappReminder = useWatch({ control, name: 'sendWhatsappReminder' })
  const selectedPetId = useWatch({ control, name: 'petId' })
  const selectedPet = (petsQuery.data ?? []).find(pet => pet.id === selectedPetId)

  const onSubmit = async (data: AppointmentForm) => {
    try {
      const appointment = await createAppointment.mutateAsync({
        petId: data.petId,
        scheduledAt: `${data.appointmentDate}T${data.appointmentTime}:00`,
        durationMinutes: data.durationMinutes,
        reason: data.reason,
        veterinarianId: data.veterinarianId || undefined,
        notes: data.notes || undefined,
        notifyOwner: data.notifyOwner,
      })
      if (data.sendWhatsappReminder && selectedPet?.owner?.phone) {
        try {
          await whatsappService.send({
            petId: data.petId,
            ownerPhone: selectedPet.owner.phone,
            type: 'appointment_reminder',
            message: [
              `Merhaba ${selectedPet.owner.fullName}`,
              `${selectedPet.name} için randevu oluşturuldu.`,
              `Tarih: ${new Date(data.appointmentDate).toLocaleDateString('tr-TR')}`,
              `Saat: ${data.appointmentTime}`,
              `Neden: ${data.reason}`,
            ].join('\n'),
          })
        } catch {
          toast.error('WhatsApp randevu hatırlatması gönderilemedi', {
            description: 'Randevu kaydedildi; WhatsApp servisi hazır olduğunda hatırlatma kuyruğa alınacak.',
          })
        }
      }

      toast.success('Randevu oluşturuldu')
      router.push(`/appointments?created=${appointment.id}`)
    } catch {
      toast.error('Randevu servisi henüz hazır değil', {
        description: 'Backend POST /appointments endpointi geldiğinde bu form canlı kayıt oluşturacak.',
      })
    }
  }

  return (
    <div>
      <Header title="Yeni Randevu" subtitle="Hasta seçimi, saat planı ve sahip bildirimi" />

      <div className="p-6 space-y-6 max-w-5xl">
        <Link
          href="/appointments"
          className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
        >
          <ArrowLeft className="w-4 h-4" />
          Randevulara dön
        </Link>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Randevu Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Hasta</Label>
                  <Select
                    onValueChange={(value: string | null) => {
                      if (value) setValue('petId', value, { shouldValidate: true })
                    }}
                    disabled={petsQuery.isLoading}
                  >
                    <SelectTrigger className={cn('w-full', errors.petId && 'border-destructive')}>
                      <SelectValue placeholder={petsQuery.isLoading ? 'Hastalar yükleniyor...' : 'Hasta seçin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(petsQuery.data ?? []).map(pet => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} {pet.owner?.fullName ? `- ${pet.owner.fullName}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.petId && <p className="text-xs text-destructive">{errors.petId.message}</p>}
                  {petsQuery.isError && (
                    <p className="text-xs text-amber-700">Hasta listesi alınamadı. API erişimi bekleniyor.</p>
                  )}
                </div>

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
                    defaultValue="30"
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
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Sahibe bildirim gönder
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      Backend hazır olduğunda push/SMS/WhatsApp hatırlatma kuyruğuna alınacak.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsappReminder}
                    onChange={event => setValue('sendWhatsappReminder', event.target.checked)}
                    disabled={!selectedPet?.owner?.phone}
                    className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                  <span>
                    <span className="text-sm font-semibold text-foreground">WhatsApp randevu hatırlatması gönder</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {selectedPet?.owner?.phone
                        ? `${selectedPet.owner.phone} numarasına appointment_reminder template hazırlığı yapılır.`
                        : 'Sahip telefonu olan bir hasta seçildiğinde WhatsApp hatırlatması hazırlanır.'}
                    </span>
                  </span>
                </label>
                {sendWhatsappReminder && selectedPet && !selectedPet.owner?.phone && (
                  <p className="text-xs text-amber-700">WhatsApp hatırlatması için sahip telefon bilgisi olmalı.</p>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || createAppointment.isPending} className="gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    Randevuyu Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <aside className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <Badge className="bg-primary/10 text-primary border-0 mb-4">Hazırlık</Badge>
                <h2 className="text-sm font-semibold text-foreground">Klinik iş akışı</h2>
                <div className="mt-5 space-y-3">
                  {[
                    'Hasta ve saat seçilir',
                    'Randevu bekleyen/onaylı duruma düşer',
                    'Sahibe otomatik hatırlatma gider',
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm text-muted-foreground pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Backend kontratı
                </h2>
                <div className="mt-4 space-y-2">
                  {contractSteps.map(endpoint => (
                    <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                      {endpoint}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  )
}

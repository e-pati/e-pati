'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { vaccinationsService } from '@/services/vaccinations.service'
import { whatsappService } from '@/services/whatsapp.service'
import { toast } from 'sonner'
import { Syringe, X } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Aşı adı gerekli'),
  appliedAt: z.string().min(1, 'Uygulama tarihi gerekli'),
  dueAt: z.string().optional(),
  lotNumber: z.string().optional(),
  notes: z.string().optional(),
  sendWhatsappReminder: z.boolean(),
})

type FormData = z.infer<typeof schema>

const COMMON_VACCINES = [
  'Kuduz', 'Karma (FVRCP)', 'Karma (DHPPiL)', 'Lösemi (FeLV)',
  'Bordetella', 'Leptospira', 'Lyme', 'Giardia',
]

interface Props {
  petId: string
  petName: string
  ownerName: string
  ownerPhone?: string
  open: boolean
  onClose: () => void
}

export function AddVaccinationDialog({ petId, petName, ownerName, ownerPhone, open, onClose }: Props) {
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      appliedAt: new Date().toISOString().split('T')[0],
      sendWhatsappReminder: true,
    },
  })
  const sendWhatsappReminder = useWatch({ control, name: 'sendWhatsappReminder' })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await vaccinationsService.create({
        petId,
        name: data.name,
        appliedAt: new Date(data.appliedAt).toISOString(),
        dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
        lotNumber: data.lotNumber || undefined,
        notes: data.notes || undefined,
      })
      if (data.sendWhatsappReminder && ownerPhone) {
        try {
          await whatsappService.send({
            petId,
            ownerPhone,
            type: 'vaccine_reminder',
            message: [
              `Merhaba ${ownerName}`,
              `${petName} için ${data.name} aşı kaydı oluşturuldu.`,
              data.dueAt ? `Sonraki doz tarihi: ${new Date(data.dueAt).toLocaleDateString('tr-TR')}` : 'Sonraki doz tarihi klinik tarafından ayrıca paylaşılacaktır.',
            ].join('\n'),
          })
        } catch {
          toast.error('WhatsApp aşı bildirimi gönderilemedi', {
            description: 'Aşı kaydedildi; WhatsApp servisi hazır olduğunda bildirim kuyruğa alınacak.',
          })
        }
      }
      toast.success('Aşı kaydedildi')
      qc.invalidateQueries({ queryKey: ['vaccinations', { petId }] })
      qc.invalidateQueries({ queryKey: ['vaccinations'] })
      reset()
      onClose()
    } catch {
      toast.error('Aşı kaydedilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Syringe className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-base font-semibold">Aşı Ekle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Hızlı seçim */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sık Kullanılan Aşılar</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_VACCINES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValue('name', v)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Aşı adı */}
          <div className="space-y-1.5">
            <Label>Aşı Adı <span className="text-destructive">*</span></Label>
            <Input placeholder="örn. Kuduz" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Uygulama tarihi */}
            <div className="space-y-1.5">
              <Label>Uygulama Tarihi <span className="text-destructive">*</span></Label>
              <Input type="date" {...register('appliedAt')} className={errors.appliedAt ? 'border-destructive' : ''} />
              {errors.appliedAt && <p className="text-xs text-destructive">{errors.appliedAt.message}</p>}
            </div>

            {/* Sonraki doz */}
            <div className="space-y-1.5">
              <Label>Sonraki Doz</Label>
              <Input type="date" {...register('dueAt')} />
            </div>
          </div>

          {/* Lot numarası */}
          <div className="space-y-1.5">
            <Label>Lot / Seri Numarası</Label>
            <Input placeholder="LOT-2026-..." {...register('lotNumber')} className="font-mono text-sm" />
          </div>

          {/* Notlar */}
          <div className="space-y-1.5">
            <Label>Notlar</Label>
            <Input placeholder="Üretici, yan etki vb." {...register('notes')} />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('sendWhatsappReminder')}
              disabled={!ownerPhone}
              className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <span>
              <span className="text-sm font-semibold text-foreground">Sahibe WhatsApp bildirimi gönder</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {ownerPhone
                  ? `${ownerPhone} numarasına vaccine_reminder template hazırlığı yapılır.`
                  : 'Sahip telefonu olmadığı için WhatsApp bildirimi gönderilemez.'}
              </span>
            </span>
          </label>
          {sendWhatsappReminder && !ownerPhone && (
            <p className="text-xs text-amber-700">WhatsApp bildirimi için sahip telefon bilgisi olmalı.</p>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </span>
              ) : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

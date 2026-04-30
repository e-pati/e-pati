'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { prescriptionsService } from '@/services/prescriptions.service'
import { toast } from 'sonner'
import { Pill, X, Plus, Trash2 } from 'lucide-react'

const medicationSchema = z.object({
  name: z.string().min(2, 'İlaç adı gerekli'),
  dose: z.string().min(1, 'Doz gerekli'),
  frequency: z.string().min(1, 'Sıklık gerekli'),
  duration: z.string().min(1, 'Süre gerekli'),
  instructions: z.string().optional(),
})

const schema = z.object({
  medications: z.array(medicationSchema).min(1, 'En az bir ilaç ekleyin'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const COMMON_DRUGS = [
  'Amoksisilin', 'Metronidazol', 'Doksisiklin', 'Prednizolon',
  'Meloksikam', 'Gabapentin', 'Furosemid', 'Enalapril',
]

const FREQUENCY_OPTIONS = ['1x1', '2x1', '3x1', '4x1', 'Sabah-akşam', 'Günaşırı', 'Haftada 1']
const DURATION_OPTIONS = ['3 gün', '5 gün', '7 gün', '10 gün', '14 gün', '30 gün', 'Süresiz']

interface Props {
  petId: string
  open: boolean
  onClose: () => void
}

export function AddPrescriptionDialog({ petId, open, onClose }: Props) {
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const rx = await prescriptionsService.create({ petId, medications: data.medications, notes: data.notes })
      toast.success('Reçete kaydedildi', {
        action: {
          label: 'PDF İndir',
          onClick: () => window.open(prescriptionsService.getPdfUrl(rx.id), '_blank'),
        },
      })
      qc.invalidateQueries({ queryKey: ['prescriptions', { petId }] })
      reset()
      onClose()
    } catch {
      toast.error('Reçete kaydedilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <Pill className="w-4 h-4 text-violet-500" />
            </div>
            <h2 className="text-base font-semibold">Reçete Oluştur</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form — scrollable */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* İlaçlar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">İlaçlar</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8"
                  onClick={() => append({ name: '', dose: '', frequency: '', duration: '', instructions: '' })}
                >
                  <Plus className="w-3.5 h-3.5" />
                  İlaç Ekle
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-border p-4 space-y-3 bg-muted/20 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      İlaç {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* İlaç adı + hızlı seçim */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">İlaç Adı <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="İlaç adını yazın veya seçin"
                      {...register(`medications.${index}.name`)}
                      className={errors.medications?.[index]?.name ? 'border-destructive' : ''}
                    />
                    <div className="flex flex-wrap gap-1">
                      {COMMON_DRUGS.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue(`medications.${index}.name`, d)}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    {errors.medications?.[index]?.name && (
                      <p className="text-xs text-destructive">{errors.medications[index]?.name?.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Doz */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Doz <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="örn. 50mg"
                        {...register(`medications.${index}.dose`)}
                        className={errors.medications?.[index]?.dose ? 'border-destructive' : ''}
                      />
                    </div>

                    {/* Sıklık */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sıklık <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="örn. 2x1"
                        list={`freq-${index}`}
                        {...register(`medications.${index}.frequency`)}
                        className={errors.medications?.[index]?.frequency ? 'border-destructive' : ''}
                      />
                      <datalist id={`freq-${index}`}>
                        {FREQUENCY_OPTIONS.map(f => <option key={f} value={f} />)}
                      </datalist>
                    </div>

                    {/* Süre */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Süre <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="örn. 7 gün"
                        list={`dur-${index}`}
                        {...register(`medications.${index}.duration`)}
                        className={errors.medications?.[index]?.duration ? 'border-destructive' : ''}
                      />
                      <datalist id={`dur-${index}`}>
                        {DURATION_OPTIONS.map(d => <option key={d} value={d} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Talimatlar */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Özel Talimat</Label>
                    <Input
                      placeholder="örn. Yemekle birlikte verilmeli"
                      {...register(`medications.${index}.instructions`)}
                    />
                  </div>
                </div>
              ))}

              {errors.medications?.root && (
                <p className="text-xs text-destructive">{errors.medications.root.message}</p>
              )}
            </div>

            {/* Genel notlar */}
            <div className="space-y-1.5">
              <Label>Reçete Notu</Label>
              <Input placeholder="Genel talimat veya not..." {...register('notes')} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </span>
              ) : 'Reçeteyi Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

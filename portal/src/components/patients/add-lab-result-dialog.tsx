'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { labResultsService } from '@/services/lab-results.service'
import { toast } from 'sonner'
import { FlaskConical, X } from 'lucide-react'

const schema = z.object({
  testType: z.string().min(2, 'Test türü gerekli'),
  fileUrl: z.string().url('Geçerli URL giriniz').optional().or(z.literal('')),
  comment: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const COMMON_TESTS = [
  'Tam Kan Sayımı', 'Biyokimya Paneli', 'İdrar Tahlili',
  'Röntgen', 'Ultrason', 'PCR Test', 'Allerji Testi', 'Hormon Paneli',
]

interface Props {
  petId: string
  open: boolean
  onClose: () => void
}

export function AddLabResultDialog({ petId, open, onClose }: Props) {
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await labResultsService.create({
        petId,
        testType: data.testType,
        fileUrl: data.fileUrl || undefined,
        comment: data.comment || undefined,
      })
      toast.success('Lab sonucu kaydedildi')
      qc.invalidateQueries({ queryKey: ['lab-results', { petId }] })
      qc.invalidateQueries({ queryKey: ['lab-results'] })
      reset()
      onClose()
    } catch {
      toast.error('Lab sonucu kaydedilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10">
              <FlaskConical className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-base font-semibold">Lab Sonucu Ekle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Test türü */}
          <div className="space-y-2">
            <Label>Test Türü <span className="text-destructive">*</span></Label>
            <Input
              placeholder="örn. Tam Kan Sayımı"
              {...register('testType')}
              className={errors.testType ? 'border-destructive' : ''}
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {COMMON_TESTS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('testType', t)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.testType && <p className="text-xs text-destructive">{errors.testType.message}</p>}
          </div>

          {/* Dosya URL */}
          <div className="space-y-1.5">
            <Label>Dosya URL (Opsiyonel)</Label>
            <Input
              placeholder="https://... (PDF, görüntü linki)"
              {...register('fileUrl')}
              className={errors.fileUrl ? 'border-destructive' : ''}
            />
            {errors.fileUrl && <p className="text-xs text-destructive">{errors.fileUrl.message}</p>}
            <p className="text-xs text-muted-foreground">
              Dosya yükleme özelliği yakında eklenecek. Şimdilik harici bir link girebilirsiniz.
            </p>
          </div>

          {/* Yorum */}
          <div className="space-y-1.5">
            <Label>Yorum / Değerlendirme</Label>
            <textarea
              {...register('comment')}
              rows={3}
              placeholder="Test sonucunun kısa yorumu veya dikkat çeken bulgular..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
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

'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { labResultsService } from '@/services/lab-results.service'
import { uploadsService } from '@/services/uploads.service'
import { toast } from 'sonner'
import { FlaskConical, X, Upload, FileText, Loader2 } from 'lucide-react'

const schema = z.object({
  testType: z.string().min(2, 'Test türü gerekli'),
  comment: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const COMMON_TESTS = [
  'Tam Kan Sayımı', 'Biyokimya Paneli', 'İdrar Tahlili',
  'Röntgen', 'Ultrason', 'PCR Test', 'Allerji Testi', 'Hormon Paneli',
]

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'

interface Props {
  petId: string
  open: boolean
  onClose: () => void
}

export function AddLabResultDialog({ petId, open, onClose }: Props) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 20 * 1024 * 1024) {
      toast.error('Dosya 20 MB\'dan küçük olmalı')
      return
    }
    setFile(f)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      let fileUrl: string | undefined

      if (file) {
        setUploading(true)
        fileUrl = await uploadsService.uploadFile(file, 'lab-results')
        setUploading(false)
      }

      await labResultsService.create({
        petId,
        testType: data.testType,
        fileUrl,
        comment: data.comment || undefined,
      })

      toast.success('Lab sonucu kaydedildi')
      qc.invalidateQueries({ queryKey: ['lab-results', { petId }] })
      qc.invalidateQueries({ queryKey: ['lab-results'] })
      reset()
      setFile(null)
      onClose()
    } catch {
      toast.error('Lab sonucu kaydedilemedi')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (!open) return null

  const busy = submitting || uploading

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

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Test türü */}
          <div className="space-y-2">
            <Label>Test Türü <span className="text-destructive">*</span></Label>
            <Input
              placeholder="örn. Tam Kan Sayımı"
              {...register('testType')}
              className={errors.testType ? 'border-destructive' : ''}
            />
            <div className="flex flex-wrap gap-1.5">
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

          {/* Dosya yükleme */}
          <div className="space-y-2">
            <Label>Dosya (PDF veya görüntü)</Label>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Dosya seç veya sürükle</span>
                <span className="text-xs text-muted-foreground/70">PDF, JPG, PNG · Maks 20 MB</span>
              </button>
            )}
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
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={busy}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Yükleniyor...
                </span>
              ) : submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

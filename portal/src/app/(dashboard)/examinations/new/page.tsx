'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { useCreateExamination } from '@/hooks/use-examinations'
import { whatsappService } from '@/services/whatsapp.service'
import type { PetSpecies } from '@/types'
import { speciesEmoji, speciesLabel, calculateAge } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react'

const examinationSchema = z.object({
  petId: z.string().min(1, 'Hasta seçiniz'),
  complaint: z.string().min(5, 'Şikayet giriniz'),
  findings: z.string().min(5, 'Bulgular giriniz'),
  assessment: z.string().min(5, 'Değerlendirme giriniz'),
  plan: z.string().min(5, 'Tedavi planı giriniz'),
  followUpDate: z.string().optional(),
  sendWhatsappSummary: z.boolean(),
})

type ExaminationForm = z.infer<typeof examinationSchema>

export default function NewExaminationPage() {
  return (
    <Suspense>
      <NewExaminationForm />
    </Suspense>
  )
}

function NewExaminationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPetId = searchParams.get('petId') ?? ''

  const [petSearch, setPetSearch] = useState('')
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId)
  const [submitted, setSubmitted] = useState(false)
  const [summaryQueued, setSummaryQueued] = useState(false)
  const petsQuery = useAllClinicPatients()
  const createExamination = useCreateExamination()

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<ExaminationForm>({
    resolver: zodResolver(examinationSchema),
    defaultValues: { petId: preselectedPetId, sendWhatsappSummary: true },
  })
  const sendWhatsappSummary = useWatch({ control, name: 'sendWhatsappSummary' })

  const pets = petsQuery.data?.items ?? []
  const selectedPet = pets.find(p => p.id === selectedPetId)

  const filteredPets = pets.filter(pet => {
    const q = petSearch.toLowerCase()
    return !q || pet.name.toLowerCase().includes(q) ||
      (pet.owner?.fullName?.toLowerCase() ?? '').includes(q)
  })

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId)
    setValue('petId', petId)
    setPetSearch('')
  }

  const onSubmit = async (data: ExaminationForm) => {
    try {
      await createExamination.mutateAsync({
        petId: data.petId,
        complaint: data.complaint,
        findings: data.findings,
        assessment: data.assessment,
        plan: data.plan,
      })
      if (data.sendWhatsappSummary && selectedPet?.owner?.phone) {
        try {
          await whatsappService.send({
            petId: data.petId,
            ownerPhone: selectedPet.owner.phone,
            type: 'exam_summary',
            message: [
              `Merhaba ${selectedPet.owner.fullName ?? ''}`.trim(),
              `${selectedPet.name} için muayene özeti:`,
              `Şikayet: ${data.complaint}`,
              `Değerlendirme: ${data.assessment}`,
              `Plan: ${data.plan}`,
            ].join('\n'),
          })
          setSummaryQueued(true)
        } catch {
          toast.error('WhatsApp özeti gönderilemedi', {
            description: 'Muayene kaydedildi; WhatsApp servisi hazır olduğunda özet kuyruğa alınacak.',
          })
        }
      }
      setSubmitted(true)
      setTimeout(() => router.push(`/patients/${data.petId}`), 1200)
    } catch {
      toast.error('Muayene kaydedilemedi', {
        description: 'API bağlantısını kontrol edip tekrar deneyin.',
      })
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Muayene Kaydedildi!</h2>
          <p className="text-muted-foreground text-sm">
            {summaryQueued ? 'WhatsApp özeti kuyruğa alındı.' : 'Hasta profiline yönlendiriliyorsunuz...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Yeni Muayene" subtitle="SOAP formatında muayene kaydı oluşturun" />

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {petsQuery.isError && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              Hasta listesi alınamadı. Lütfen API bağlantısını kontrol edip tekrar deneyin.
            </div>
          )}

          {/* Hasta seçimi */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                  Hasta Seçimi
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPet ? (
                <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="text-4xl">{speciesEmoji(normalizeSpecies(selectedPet.species))}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{selectedPet.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {speciesLabel(normalizeSpecies(selectedPet.species))} · {selectedPet.breed ?? 'Irk belirtilmemiş'}
                      {selectedPet.birthDate ? ` · ${calculateAge(selectedPet.birthDate)}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Sahip: {selectedPet.owner?.fullName ?? 'Sahip bilgisi yok'}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedPetId(''); setValue('petId', '') }}
                    className="text-xs text-muted-foreground"
                  >
                    Değiştir
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={petSearch}
                      onChange={e => setPetSearch(e.target.value)}
                      placeholder="Hasta adı veya sahip adıyla arayın..."
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border/50 p-1">
                    {filteredPets.map(pet => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => handlePetSelect(pet.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors text-left"
                      >
                        <span className="text-2xl">{speciesEmoji(normalizeSpecies(pet.species))}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{pet.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {pet.owner?.fullName ?? 'Sahip bilgisi yok'} · {pet.breed ?? 'Irk belirtilmemiş'}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.petId && <p className="text-sm text-destructive">{errors.petId.message}</p>}
            </CardContent>
          </Card>

          {/* SOAP formu */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                  Muayene Notları
                  <Badge variant="secondary" className="ml-auto text-[10px]">SOAP Formatı</Badge>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                {
                  key: 'complaint' as const,
                  label: 'S — Şikayet (Subjective)',
                  description: 'Sahip tarafından bildirilen belirtiler ve gözlemler',
                  placeholder: 'Örn: 2 gündür yemek yemek istemiyor, letarjik görünüyor...',
                },
                {
                  key: 'findings' as const,
                  label: 'O — Bulgular (Objective)',
                  description: 'Fiziksel muayene bulguları, vital değerler',
                  placeholder: 'Örn: Ağırlık 4.0 kg, ateş 39.8°C, karın palpasyonunda hafif hassasiyet...',
                },
                {
                  key: 'assessment' as const,
                  label: 'A — Değerlendirme (Assessment)',
                  description: 'Tanı ve ayırıcı tanılar',
                  placeholder: 'Örn: Gastroenterit şüphesi. Stres kaynaklı iştahsızlık dışlanamaz...',
                },
                {
                  key: 'plan' as const,
                  label: 'P — Plan (Plan)',
                  description: 'Tedavi planı, reçete, takip talimatları',
                  placeholder: 'Örn: Probiyotik ve mide koruyucu başlandı. 3 gün sonra kontrol önerildi...',
                },
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <div>
                    <Label className="text-sm font-semibold">{field.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                  </div>
                  <textarea
                    {...register(field.key)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={cn(
                      'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm',
                      'placeholder:text-muted-foreground resize-none',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                      'transition-colors',
                      errors[field.key] && 'border-destructive focus:ring-destructive',
                    )}
                  />
                  {errors[field.key] && (
                    <p className="text-sm text-destructive">{errors[field.key]?.message}</p>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Takip Tarihi (Opsiyonel)</Label>
                <p className="text-xs text-muted-foreground">Kontrol muayenesi gerekiyorsa tarih belirleyin</p>
                <Input
                  type="date"
                  {...register('followUpDate')}
                  className="w-48"
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('sendWhatsappSummary')}
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
                  disabled={!selectedPet?.owner?.phone}
                />
                <span>
                  <span className="text-sm font-semibold text-foreground">Muayene özetini WhatsApp ile sahibine gönder</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {selectedPet?.owner?.phone
                      ? `${selectedPet.owner.phone} numarasına exam_summary template hazırlığı yapılır.`
                      : 'Sahip telefonu olmadığı için WhatsApp özeti gönderilemez.'}
                  </span>
                </span>
              </label>
              {sendWhatsappSummary && !selectedPet?.owner?.phone && (
                <p className="text-xs text-amber-700">WhatsApp gönderimi için hasta sahibinde telefon bilgisi olmalı.</p>
              )}
            </CardContent>
          </Card>

          {/* Gönder */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button type="submit" disabled={createExamination.isPending} className="gap-2 min-w-36">
              {createExamination.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : 'Muayeneyi Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLowerCase()
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') {
    return normalized
  }
  return 'other'
}

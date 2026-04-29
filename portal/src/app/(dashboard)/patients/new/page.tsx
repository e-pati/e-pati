'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreatePet } from '@/hooks/use-pets'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  species: z.string().min(1, 'Tür seçiniz'),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  birthDate: z.string().optional(),
  microchipNo: z.string().optional(),
  photoUrl: z.string().url('Geçerli URL giriniz').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const SPECIES = [
  { value: 'Cat', label: '🐈 Kedi' },
  { value: 'Dog', label: '🐕 Köpek' },
  { value: 'Bird', label: '🐦 Kuş' },
  { value: 'Rabbit', label: '🐇 Tavşan' },
  { value: 'Other', label: '🐾 Diğer' },
]

export default function NewPatientPage() {
  const router = useRouter()
  const createPet = useCreatePet()
  const [done, setDone] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sex: 'UNKNOWN' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const pet = await createPet.mutateAsync({
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        sex: data.sex,
        birthDate: data.birthDate || undefined,
        microchipNo: data.microchipNo || undefined,
        photoUrl: data.photoUrl || undefined,
      })
      setDone(true)
      toast.success(`${pet.name} başarıyla eklendi!`)
      setTimeout(() => router.push(`/patients/${pet.id}`), 1200)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Hasta eklenemedi.')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Hasta Eklendi!</h2>
          <p className="text-muted-foreground text-sm">Hasta profiline yönlendiriliyorsunuz...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Yeni Hasta" subtitle="Yeni evcil hayvan kaydı oluşturun" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ad */}
              <div className="space-y-2">
                <Label>Hayvan Adı <span className="text-destructive">*</span></Label>
                <Input placeholder="örn. Pamuk" {...register('name')} className={cn(errors.name && 'border-destructive')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              {/* Tür */}
              <div className="space-y-2">
                <Label>Tür <span className="text-destructive">*</span></Label>
                <Select onValueChange={v => setValue('species', String(v))}>
                  <SelectTrigger className={cn(errors.species && 'border-destructive')}>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.species && <p className="text-xs text-destructive">{errors.species.message}</p>}
              </div>

              {/* Cins */}
              <div className="space-y-2">
                <Label>Cins / Irk</Label>
                <Input placeholder="örn. Van Kedisi" {...register('breed')} />
              </div>

              {/* Cinsiyet */}
              <div className="space-y-2">
                <Label>Cinsiyet</Label>
                <Select defaultValue="UNKNOWN" onValueChange={v => setValue('sex', v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">Dişi</SelectItem>
                    <SelectItem value="MALE">Erkek</SelectItem>
                    <SelectItem value="UNKNOWN">Bilinmiyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Doğum tarihi */}
              <div className="space-y-2">
                <Label>Doğum Tarihi</Label>
                <Input type="date" {...register('birthDate')} />
              </div>

              {/* Mikro çip */}
              <div className="space-y-2">
                <Label>Mikro Çip No</Label>
                <Input placeholder="15 haneli numara" {...register('microchipNo')} className="font-mono" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                Fotoğraf (Opsiyonel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Fotoğraf URL</Label>
                <Input
                  placeholder="https://..."
                  {...register('photoUrl')}
                  className={cn(errors.photoUrl && 'border-destructive')}
                />
                {errors.photoUrl && <p className="text-xs text-destructive">{errors.photoUrl.message}</p>}
                <p className="text-xs text-muted-foreground">Dosya yükleme özelliği yakında eklenecek.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => router.back()}>İptal</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-36">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </span>
              ) : 'Hastayı Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

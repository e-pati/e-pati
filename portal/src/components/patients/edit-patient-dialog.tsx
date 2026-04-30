'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQueryClient } from '@tanstack/react-query'
import { petsService, type ApiPet } from '@/services/pets.service'
import { toast } from 'sonner'
import { PawPrint, X } from 'lucide-react'
import { useState } from 'react'

type PetSex = 'MALE' | 'FEMALE' | 'UNKNOWN'

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  species: z.string().min(1, 'Tür seçiniz'),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  birthDate: z.string().optional(),
  microchipNo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  pet: ApiPet
  open: boolean
  onClose: () => void
}

const SPECIES = [
  { value: 'Cat', label: '🐈 Kedi' },
  { value: 'Dog', label: '🐕 Köpek' },
  { value: 'Bird', label: '🐦 Kuş' },
  { value: 'Rabbit', label: '🐇 Tavşan' },
  { value: 'Other', label: '🐾 Diğer' },
]

export function EditPatientDialog({ pet, open, onClose }: Props) {
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? '',
      sex: (pet.sex as PetSex) ?? 'UNKNOWN',
      birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : '',
      microchipNo: pet.microchipNo ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await petsService.update(pet.id, {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        sex: data.sex,
        birthDate: data.birthDate || undefined,
        microchipNo: data.microchipNo || undefined,
      })
      toast.success('Hasta bilgileri güncellendi')
      qc.invalidateQueries({ queryKey: ['pets', pet.id] })
      qc.invalidateQueries({ queryKey: ['pets'] })
      qc.invalidateQueries({ queryKey: ['clinic-patients'] })
      onClose()
    } catch {
      toast.error('Güncelleme başarısız')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-md border border-border">

        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <PawPrint className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold">Hasta Bilgilerini Düzenle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ad <span className="text-destructive">*</span></Label>
              <Input {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tür <span className="text-destructive">*</span></Label>
              <Select defaultValue={pet.species} onValueChange={v => setValue('species', String(v))}>
                <SelectTrigger className={errors.species ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cins / Irk</Label>
              <Input {...register('breed')} placeholder="örn. Van Kedisi" />
            </div>
            <div className="space-y-1.5">
              <Label>Cinsiyet</Label>
              <Select defaultValue={pet.sex ?? 'UNKNOWN'} onValueChange={v => { if (v) setValue('sex', v as PetSex) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Dişi</SelectItem>
                  <SelectItem value="MALE">Erkek</SelectItem>
                  <SelectItem value="UNKNOWN">Bilinmiyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Doğum Tarihi</Label>
              <Input type="date" {...register('birthDate')} />
            </div>
            <div className="space-y-1.5">
              <Label>Mikro Çip No</Label>
              <Input {...register('microchipNo')} className="font-mono text-sm" placeholder="15 haneli" />
            </div>
          </div>

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

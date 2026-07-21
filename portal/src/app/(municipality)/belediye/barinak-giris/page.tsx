'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Database, Fingerprint, HousePlus, MapPin, Save, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoMunicipality, demoStrayAnimal } from '@/lib/municipality-demo-data'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

const admissionSchema = z.object({
  name: z.string().min(2, 'Hayvan adını girin'),
  species: z.string().min(2),
  breed: z.string().min(2),
  sex: z.string().min(2),
  estimatedAge: z.string().min(2),
  color: z.string().min(2),
  foundDistrict: z.string().min(2, 'İlçe bilgisini girin'),
  healthStatus: z.string().min(3, 'Sağlık ön kontrolünü girin'),
})

type AdmissionForm = z.infer<typeof admissionSchema>

export default function ShelterAdmissionPage() {
  const router = useRouter()
  const completeAdmission = useMunicipalityDemoStore(state => state.completeShelterAdmission)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      name: demoStrayAnimal.name,
      species: demoStrayAnimal.species,
      breed: demoStrayAnimal.breed,
      sex: demoStrayAnimal.sex,
      estimatedAge: demoStrayAnimal.estimatedAge,
      color: demoStrayAnimal.color,
      foundDistrict: demoStrayAnimal.foundDistrict,
      healthStatus: demoStrayAnimal.healthStatus,
    },
  })

  const onSubmit = () => {
    completeAdmission()
    toast.success('Barınak kabulü ve HKN oluşturma tamamlandı')
    router.push('/belediye/kisirlastirma')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/belediye" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-700"><ArrowLeft className="size-4" /> Operasyon paneline dön</Link><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><HousePlus className="size-5" /></div><div><h1 className="text-2xl font-black tracking-tight">Barınak kabul kaydı</h1><p className="mt-1 text-sm text-slate-500">Dost için dijital kimlik ve sağlık ön kontrolü oluşturun.</p></div></div></div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Mock kabul</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Kimlik ve kabul bilgileri</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
              <Field label="Hayvan adı" error={errors.name?.message}><Input {...register('name')} /></Field>
              <Field label="Tür"><Input {...register('species')} /></Field>
              <Field label="Irk"><Input {...register('breed')} /></Field>
              <Field label="Cinsiyet"><Input {...register('sex')} /></Field>
              <Field label="Tahmini yaş"><Input {...register('estimatedAge')} /></Field>
              <Field label="Renk"><Input {...register('color')} /></Field>
              <Field label="Bulunduğu ilçe" error={errors.foundDistrict?.message}><Input {...register('foundDistrict')} /></Field>
              <Field label="Sağlık ön kontrolü" error={errors.healthStatus?.message}><Input {...register('healthStatus')} /></Field>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 sm:col-span-2"><div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><Fingerprint className="size-4" /> Oluşturulacak HKN</div><div className="mt-2 font-mono text-sm font-black text-cyan-950">{demoStrayAnimal.hkn}</div><div className="mt-1 font-mono text-xs text-cyan-800/70">Mikroçip: {demoStrayAnimal.microchipNo}</div></div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2"><Link href="/belediye" className={buttonVariants({ variant: 'outline' })}>İptal</Link><Button type="submit" disabled={isSubmitting} className="bg-cyan-700 hover:bg-cyan-800"><Save className="size-4" /> Kabulü kaydet ve ilerle</Button></div>
            </CardContent>
          </Card>
        </form>
        <aside className="space-y-4">
          <Card className="border-cyan-200 bg-cyan-50/70 shadow-none"><CardContent className="p-5"><ShieldCheck className="size-6 text-cyan-700" /><h2 className="mt-4 font-black text-cyan-950">Tekil kimlik kontrolü</h2><p className="mt-2 text-xs leading-5 text-cyan-900/70">Mikroçip ve temel fiziksel özellikler, aynı hayvanın farklı ekiplerce yeniden kaydedilmesini önlemek için HKN altında eşleştirilir.</p></CardContent></Card>
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-2"><MapPin className="size-4 shrink-0 text-cyan-700" /><div><div className="text-sm font-black">Konum gizliliği</div><p className="mt-1 text-xs leading-5 text-slate-500">Yalnızca {demoMunicipality.district} ilçe bilgisi gösterilir; kesin bulunma noktası ve kişisel veri paylaşılmaz.</p></div></div><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Sentetik kayıt doğrulandı</div></div>
        </aside>
      </div>
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs font-medium text-red-600">{error}</p>}</div>
}

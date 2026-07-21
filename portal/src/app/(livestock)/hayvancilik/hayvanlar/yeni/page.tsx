'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Beef, CheckCircle2, Database, ScanLine } from 'lucide-react'
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
import { demoLivestockAnimal, sourceEnterprise } from '@/lib/livestock-demo-data'
import { cn } from '@/lib/utils'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

const animalSchema = z.object({
  earTag: z.string().min(8, 'Geçerli bir küpe numarası girin'),
  name: z.string().min(2, 'Hayvan adını girin'),
  breed: z.string().min(2, 'Irk bilgisini girin'),
  birthDate: z.string().min(1, 'Doğum tarihini girin'),
  sex: z.string().min(1),
  purpose: z.string().min(1),
})

type AnimalForm = z.infer<typeof animalSchema>

export default function NewLivestockAnimalPage() {
  const router = useRouter()
  const registerAnimal = useLivestockDemoStore(state => state.registerAnimal)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnimalForm>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      earTag: demoLivestockAnimal.earTag,
      name: demoLivestockAnimal.name,
      breed: demoLivestockAnimal.breed,
      birthDate: demoLivestockAnimal.birthDate,
      sex: demoLivestockAnimal.sex,
      purpose: demoLivestockAnimal.purpose,
    },
  })

  const onSubmit = () => {
    registerAnimal()
    toast.success('Küpe doğrulandı ve Sarıkız işletmeye eklendi')
    router.push('/hayvancilik/hareket')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/hayvancilik/isletmeler/yeni" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700">
            <ArrowLeft className="size-4" /> İşletme kaydına dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Beef className="size-5" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Küpe ile hayvan girişi</h1>
              <p className="mt-1 text-sm text-slate-500">Resmî küpe numarasını HKN ve işletme kaydıyla eşleştirin.</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Mock doğrulama</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base"><ScanLine className="size-4 text-emerald-700" /> Kimlik ve üretim bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
              <Field label="Küpe numarası" error={errors.earTag?.message}>
                <div className="relative">
                  <Input {...register('earTag')} className={cn('pr-10 font-mono font-bold', errors.earTag && 'border-red-400')} />
                  <CheckCircle2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
                </div>
              </Field>
              <Field label="Oluşturulacak HKN">
                <Input value={demoLivestockAnimal.hkn} readOnly className="bg-slate-50 font-mono text-slate-600" />
              </Field>
              <Field label="Hayvan adı" error={errors.name?.message}><Input {...register('name')} /></Field>
              <Field label="Irk" error={errors.breed?.message}><Input {...register('breed')} /></Field>
              <Field label="Doğum tarihi" error={errors.birthDate?.message}><Input type="date" {...register('birthDate')} /></Field>
              <Field label="Cinsiyet"><Input {...register('sex')} /></Field>
              <Field label="Üretim amacı"><Input {...register('purpose')} /></Field>
              <Field label="Giriş yapılacak işletme"><Input value={sourceEnterprise.name} readOnly className="bg-slate-50" /></Field>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
                <Link href="/hayvancilik" className={buttonVariants({ variant: 'outline' })}>İptal</Link>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800">
                  <ScanLine className="size-4" /> Küpeyi doğrula ve ilerle
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4">
          <Card className="border-sky-200 bg-sky-50/70 shadow-none">
            <CardContent className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">KAYNAK SİSTEM SONUCU</div>
              <h2 className="mt-3 font-black text-sky-950">Küpe kaydı bulundu</h2>
              <dl className="mt-4 space-y-3 text-xs">
                <InfoRow label="Durum" value="Aktif" />
                <InfoRow label="Tür" value="Büyükbaş" />
                <InfoRow label="İl" value="Ankara" />
                <InfoRow label="Sahiplik" value="Doğrulandı" />
              </dl>
            </CardContent>
          </Card>
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-5 text-slate-500">
            Demo ortamında doğrulama sonucu sentetiktir. Canlı ortamda bu adım HAYBİS/TÜRKVET kimliklendirme kaydıyla eşleşir.
          </p>
        </aside>
      </div>
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs font-medium text-red-600">{error}</p>}</div>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-sky-100 pb-2 last:border-0"><dt className="text-sky-900/60">{label}</dt><dd className="font-bold text-sky-950">{value}</dd></div>
}

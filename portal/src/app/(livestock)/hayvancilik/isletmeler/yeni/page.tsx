'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2, CheckCircle2, Database, Save } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

const enterpriseSchema = z.object({
  registrationNo: z.string().min(8, 'İşletme numarası en az 8 karakter olmalı'),
  name: z.string().min(3, 'İşletme adını girin'),
  city: z.string().min(2, 'İl bilgisini girin'),
  district: z.string().min(2, 'İlçe bilgisini girin'),
  type: z.string().min(2, 'Faaliyet türünü girin'),
  capacity: z.number().min(1, 'Kapasite en az 1 olmalı'),
})

type EnterpriseForm = z.infer<typeof enterpriseSchema>

export default function NewEnterprisePage() {
  const router = useRouter()
  const registerEnterprise = useLivestockDemoStore(state => state.registerEnterprise)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EnterpriseForm>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      registrationNo: 'TR-06-AYŞ-00741',
      name: 'Ayışığı Damızlık İşletmesi',
      city: 'Ankara',
      district: 'Gölbaşı',
      type: 'Damızlık sığırcılık',
      capacity: 120,
    },
  })

  const onSubmit = (data: EnterpriseForm) => {
    registerEnterprise(data)
    toast.success('Demo işletmesi başarıyla oluşturuldu')
    router.push('/hayvancilik/hayvanlar/yeni')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/hayvancilik" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700">
            <ArrowLeft className="size-4" /> Üretici paneline dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Yeni işletme kaydı</h1>
              <p className="mt-1 text-sm text-slate-500">Üretici işletmesini ulusal kayıt otoritesiyle eşleştirin.</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
          <Database className="size-3" /> Mock kayıt
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base">İşletme ve faaliyet bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
              <Field label="İşletme kayıt numarası" error={errors.registrationNo?.message}>
                <Input {...register('registrationNo')} className={cn('font-mono', errors.registrationNo && 'border-red-400')} />
              </Field>
              <Field label="İşletme adı" error={errors.name?.message}>
                <Input {...register('name')} className={cn(errors.name && 'border-red-400')} />
              </Field>
              <Field label="İl" error={errors.city?.message}>
                <Input {...register('city')} className={cn(errors.city && 'border-red-400')} />
              </Field>
              <Field label="İlçe" error={errors.district?.message}>
                <Input {...register('district')} className={cn(errors.district && 'border-red-400')} />
              </Field>
              <Field label="Faaliyet türü" error={errors.type?.message}>
                <Input {...register('type')} className={cn(errors.type && 'border-red-400')} />
              </Field>
              <Field label="Hayvan kapasitesi" error={errors.capacity?.message}>
                <Input type="number" {...register('capacity', { valueAsNumber: true })} className={cn(errors.capacity && 'border-red-400')} />
              </Field>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
                <Link href="/hayvancilik" className={buttonVariants({ variant: 'outline' })}>İptal</Link>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800">
                  <Save className="size-4" /> İşletmeyi kaydet ve ilerle
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/70 shadow-none">
            <CardContent className="p-5">
              <CheckCircle2 className="size-6 text-emerald-700" />
              <h2 className="mt-4 font-black text-emerald-950">Entegrasyon ilkesi</h2>
              <p className="mt-2 text-xs leading-5 text-emerald-900/70">
                Canlı sistemde işletme kaydı HAYBİS/TÜRKVET kayıt otoritesiyle doğrulanır. Bu ekran yalnızca modern veri giriş deneyimini simüle eder.
              </p>
            </CardContent>
          </Card>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-5 text-slate-500">
            Bu form sentetik bilgilerle önceden doldurulmuştur. Gerçek kişi, işletme veya üretim verisi içermez.
          </div>
        </aside>
      </div>
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

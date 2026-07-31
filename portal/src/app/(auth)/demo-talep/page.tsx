'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, BadgeCheck, CheckCircle2 } from 'lucide-react'
import { BrandMark } from '@/components/landing/brand-mark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const demoRequestSchema = z.object({
  clinicName: z.string().min(2, 'Kurum/klinik adı en az 2 karakter olmalıdır'),
  authorizedName: z.string().min(2, 'Yetkili adı en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta giriniz'),
  phone: z.string().min(10, 'Geçerli telefon numarası giriniz'),
  city: z.string().min(2, 'Şehir giriniz'),
  address: z.string().min(10, 'Değerlendirme kapsamı en az 10 karakter olmalıdır'),
  veterinarianCount: z.coerce.number().min(1, 'En az 1 kullanıcı giriniz').max(250, 'Geçerli bir sayı giriniz'),
})

type DemoRequestFormInput = z.input<typeof demoRequestSchema>
type DemoRequestForm = z.output<typeof demoRequestSchema>

const fields: Array<{
  key: keyof DemoRequestForm
  label: string
  placeholder: string
  type?: string
}> = [
  { key: 'clinicName', label: 'Kurum / Klinik Adı', placeholder: 'Örnek Veteriner Kliniği' },
  { key: 'authorizedName', label: 'Yetkili Ad Soyad', placeholder: 'Ad Soyad' },
  { key: 'email', label: 'E-posta', placeholder: 'iletisim@example.com', type: 'email' },
  { key: 'phone', label: 'Telefon', placeholder: '+90 555 111 22 33', type: 'tel' },
  { key: 'city', label: 'Şehir', placeholder: 'İstanbul' },
  { key: 'veterinarianCount', label: 'Tahmini Kullanıcı Sayısı', placeholder: '3', type: 'number' },
]

const evaluationPoints = [
  'Çalışan ürün yüzeyleri sentetik kayıtlarla gösterilir',
  'Veri sınırları ve sentetik demo kapsamı açıkça paylaşılır',
  'Sınırlı pilot için gerekli kararlar birlikte tanımlanır',
]

export default function DemoRequestPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DemoRequestFormInput, unknown, DemoRequestForm>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: { veterinarianCount: 1 },
  })

  const onSubmit = async (data: DemoRequestForm) => {
    // Mevcut demo talep akışı: Resend anahtarı tanımlıysa e-posta gönderilir,
    // tanımlı değilse istek başarılı sayılır. Gerçek CRM/backend entegrasyonu
    // bu uç nokta üzerinden yapılacaktır.
    await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
        <div className="w-full max-w-md space-y-5 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#0f766e]/10">
            <CheckCircle2 className="size-8 text-[#0f766e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#102a43]">Demo talebiniz alındı</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Görüşme planlaması için en kısa sürede dönüş yapılacaktır. Demo ortamındaki tüm
              kayıtlar sentetiktir; gerçek veri bağlantıları izin ve teknik değerlendirmeye tabidir.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e] hover:underline">
            <ArrowLeft className="size-4" />
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#102a43] p-12 text-white lg:flex">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="size-4" />
            Ana sayfaya dön
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <BrandMark inverse />
          <p className="mt-8 text-4xl font-bold leading-[1.08] tracking-[-0.035em]">
            Ürün değerlendirmesi için görüşme planlayalım.
          </p>
          <p className="mt-5 text-base leading-7 text-white/70">
            Demo görüşmesinde çalışan ürün yüzeylerini, sentetik veri sınırlarını ve sınırlı pilot
            için gerekli kararları açık biçimde paylaşırız.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {evaluationPoints.map((item) => (
            <div key={item} className="flex items-start gap-3 border-t border-white/12 pt-3 text-sm font-medium leading-6 text-white/72">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#5eead4]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#102a43] lg:hidden">
            <ArrowLeft className="size-4" />
            Ana sayfaya dön
          </Link>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              {/* Sayfanın tek h1'i: CardTitle div render ettiği için doğrudan başlık kullanılır. */}
              <h1 className="text-2xl font-bold text-[#102a43]">Demo görüşmesi talebi</h1>
              <CardDescription>
                Bilgileriniz yalnız görüşme planlaması için kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.type ?? 'text'}
                        placeholder={field.placeholder}
                        className={cn(errors[field.key] && 'border-destructive focus-visible:ring-destructive')}
                        {...register(field.key)}
                      />
                      {errors[field.key] && (
                        <p className="text-sm text-destructive">{errors[field.key]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Değerlendirme kapsamı</Label>
                  <textarea
                    id="address"
                    rows={4}
                    placeholder="Hangi kullanım alanını değerlendirmek istediğinizi kısaca yazın"
                    className={cn(
                      'w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                      errors.address && 'border-destructive focus:ring-destructive',
                    )}
                    {...register('address')}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Gönderiliyor...' : 'Demo görüşmesi talep et'}
                </Button>

                <p className="text-xs leading-5 text-slate-500">
                  VetCep bağımsız bir teknoloji platformudur. Herhangi bir kurum adına hareket etmez;
                  gerçek veri bağlantıları izin, protokol ve teknik değerlendirmeye tabidir.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

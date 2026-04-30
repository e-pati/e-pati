'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Building2, CheckCircle2, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const onboardingSchema = z.object({
  clinicName: z.string().min(2, 'Klinik adı en az 2 karakter olmalıdır'),
  authorizedName: z.string().min(2, 'Yetkili adı en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta giriniz'),
  phone: z.string().min(10, 'Geçerli telefon numarası giriniz'),
  city: z.string().min(2, 'Şehir giriniz'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  veterinarianCount: z.coerce.number().min(1, 'En az 1 veteriner giriniz').max(250, 'Geçerli bir sayı giriniz'),
})

type OnboardingFormInput = z.input<typeof onboardingSchema>
type OnboardingForm = z.output<typeof onboardingSchema>

const fields: Array<{
  key: keyof OnboardingForm
  label: string
  placeholder: string
  type?: string
}> = [
  { key: 'clinicName', label: 'Klinik Adı', placeholder: 'Pati Sağlık Kliniği' },
  { key: 'authorizedName', label: 'Yetkili Ad Soyad', placeholder: 'Dr. Ayşe Kaya' },
  { key: 'email', label: 'Klinik E-postası', placeholder: 'klinik@example.com', type: 'email' },
  { key: 'phone', label: 'Telefon', placeholder: '+90 555 111 22 33', type: 'tel' },
  { key: 'city', label: 'Şehir', placeholder: 'İstanbul' },
  { key: 'veterinarianCount', label: 'Veteriner Sayısı', placeholder: '3', type: 'number' },
]

export default function ClinicOnboardingPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingFormInput, unknown, OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { veterinarianCount: 1 },
  })

  const onSubmit = async (data: OnboardingForm) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const subject = encodeURIComponent(`e-Pati Klinik Başvurusu — ${data.clinicName}`)
    const body = encodeURIComponent(
      `Klinik Adı: ${data.clinicName}\n` +
      `Yetkili: ${data.authorizedName}\n` +
      `E-posta: ${data.email}\n` +
      `Telefon: ${data.phone}\n` +
      `Şehir: ${data.city}\n` +
      `Veteriner Sayısı: ${data.veterinarianCount}\n\n` +
      `Başvuru tarihi: ${new Date().toLocaleString('tr-TR')}`
    )
    window.open(`mailto:burakgemicioglu33@gmail.com?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Başvuru Alındı</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Klinik hesabı onaylandığında giriş bilgileri e-posta ile paylaşılacak.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden lg:flex bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 18 }).map((_, index) => (
            <PawPrint
              key={index}
              className="absolute text-white"
              style={{
                top: `${(index * 41 + 9) % 100}%`,
                left: `${(index * 59 + 17) % 100}%`,
                width: `${22 + (index * 5) % 34}px`,
                transform: `rotate(${(index * 61) % 360}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-4 h-4" />
            Girişe dön
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Klinik Ön Kayıt</h1>
          <p className="text-primary-foreground/80 mt-4 text-lg leading-relaxed">
            Klinik ekibiniz için e-Pati portal hesabı başlatın.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {['Hasta takibi', 'Aşı planı', 'Muayene arşivi'].map(item => (
            <div key={item} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
              {item}
            </div>
          ))}
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            <ArrowLeft className="w-4 h-4" />
            Girişe dön
          </Link>

          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Klinik Bilgileri</CardTitle>
              <CardDescription>Başvuru sonrası hesap onayı klinik yöneticisine iletilir.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map(field => (
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
                  <Label htmlFor="address">Açık Adres</Label>
                  <textarea
                    id="address"
                    rows={4}
                    placeholder="Mahalle, cadde, bina no ve ilçe bilgisi"
                    className={cn(
                      'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring',
                      errors.address && 'border-destructive focus:ring-destructive',
                    )}
                    {...register('address')}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

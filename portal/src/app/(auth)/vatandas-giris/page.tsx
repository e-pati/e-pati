'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Landmark,
  LockKeyhole,
  PawPrint,
  ShieldCheck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const DEMO_REDIRECT_PATH = '/get-app?source=edevlet-demo'

const citizenLoginSchema = z.object({
  identityNumber: z
    .string()
    .regex(/^\d{11}$/, 'TC Kimlik No 11 rakamdan oluşmalıdır'),
  password: z.string().min(4, 'Şifre en az 4 karakter olmalıdır'),
})

type CitizenLoginForm = z.infer<typeof citizenLoginSchema>

export default function CitizenLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitizenLoginForm>({
    resolver: zodResolver(citizenLoginSchema),
    defaultValues: {
      identityNumber: '',
      password: '',
    },
  })

  const identityNumberField = register('identityNumber')

  const onSubmit = () => {
    setIsLoading(true)

    // DEMO ENTEGRASYON NOKTASI:
    // Üretimde bu adım e-Devlet kimlik doğrulama adaptörüne bağlanacaktır.
    window.setTimeout(() => {
      router.push(DEMO_REDIRECT_PATH)
    }, 700)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f6f8] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#b3262d]" />
      <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#b3262d]/5 blur-3xl" />
      <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-slate-300/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#b3262d] text-white shadow-sm">
              <PawPrint className="size-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">VetCep</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Hayvan Bilgi Sistemi
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="h-7 border-amber-300 bg-amber-50 px-3 font-semibold text-amber-800"
          >
            Simülasyon / Demo
          </Badge>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_460px] lg:py-16">
          <div className="hidden max-w-xl lg:block">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-red-100 bg-white text-[#b3262d] shadow-sm">
              <Landmark className="size-7" aria-hidden="true" />
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#b3262d]">
              Vatandaş Giriş Kapısı
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950">
              Hayvanlarınıza ait kayıtlara güvenli erişim
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Evcil ve üretim hayvanlarınıza ait kimlik, sağlık ve aşılama kayıtlarını tek
              dijital deneyim üzerinden görüntüleyin.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <ShieldCheck className="mb-3 size-5 text-[#b3262d]" />
                <p className="font-semibold text-slate-900">Güvenli kimlik doğrulama</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Vatandaş erişimi için e-Devlet entegrasyon deneyimi.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <PawPrint className="mb-3 size-5 text-[#b3262d]" />
                <p className="font-semibold text-slate-900">Tek dijital kayıt</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Farklı hayvan türleri için ortak kimlik ve sağlık görünümü.
                </p>
              </div>
            </div>
          </div>

          <Card className="gap-0 rounded-2xl bg-white py-0 shadow-xl shadow-slate-900/8 ring-slate-900/10">
            <div className="rounded-t-2xl border-b border-red-100 bg-[#b3262d]/5 px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#b3262d] text-white">
                  <Landmark className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#8f1f25]">Entegrasyon simülasyonu</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Bu ekran gerçek e-Devlet Kapısı değildir ve herhangi bir resmî sisteme
                    bağlanmaz.
                  </p>
                </div>
              </div>
            </div>

            <CardHeader className="gap-2 px-6 pb-5 pt-7">
              <CardTitle className="text-2xl font-bold tracking-tight">
                <h2>Vatandaş Girişi</h2>
              </CardTitle>
              <CardDescription className="leading-6">
                Demo hesabıyla hayvan kayıtlarınıza erişin.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="identityNumber">TC Kimlik No</Label>
                  <Input
                    id="identityNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    placeholder="11 haneli TC Kimlik No"
                    aria-invalid={Boolean(errors.identityNumber)}
                    className={cn(
                      'h-11 px-3',
                      errors.identityNumber &&
                        'border-destructive focus-visible:ring-destructive/20',
                    )}
                    {...identityNumberField}
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 11)
                      identityNumberField.onChange(event)
                    }}
                  />
                  {errors.identityNumber && (
                    <p className="text-sm text-destructive">{errors.identityNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">e-Devlet Şifresi</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="off"
                      placeholder="Şifrenizi girin"
                      aria-invalid={Boolean(errors.password)}
                      className={cn(
                        'h-11 px-3 pr-11',
                        errors.password &&
                          'border-destructive focus-visible:ring-destructive/20',
                      )}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3262d]/40"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                  Demo için herhangi bir 11 haneli numara ve en az 4 karakterli şifre
                  kullanabilirsiniz. Lütfen gerçek şifrenizi girmeyin.
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full bg-[#b3262d] px-4 text-sm font-bold text-white hover:bg-[#971f25] focus-visible:ring-[#b3262d]/30"
                >
                  {isLoading ? (
                    <>
                      <span
                        className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="size-4" aria-hidden="true" />
                      e-Devlet ile Giriş Yap
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <p className="text-xs leading-5 text-slate-500">
                  VetCep, mevcut kamu kayıt sistemlerinin üzerinde çalışan bir entegrasyon ve
                  deneyim katmanıdır.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>VetCep Ulusal Hayvan Sağlığı Platformu · 2026</p>
          <p>Demo ortamı · Gerçek kişisel veri kullanılmaz</p>
        </footer>
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { BrandMark } from '@/components/landing/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
})

type LoginForm = z.infer<typeof loginSchema>

const accessRows = [
  {
    index: '01',
    title: 'Klinik kayıtları',
    detail: 'Yetki kapsamıyla görüntülenir',
  },
  {
    index: '02',
    title: 'Sağlık işlemleri',
    detail: 'İzlenebilir geçmişte toplanır',
  },
  {
    index: '03',
    title: 'Ekip erişimi',
    detail: 'Rol bazlı deneyime dönüşür',
  },
] as const

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setApiError('')

    try {
      const response = await authService.loginClinic(data.email, data.password)
      setUser(response.user)

      const requestedPath = new URLSearchParams(window.location.search).get('next')
      const safeRequestedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : undefined
      const defaultPath = response.user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard'

      router.push(safeRequestedPath ?? defaultPath)
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined

      setApiError(
        typeof message === 'string'
          ? message
          : 'Giriş başarısız. Bilgilerinizi kontrol edip yeniden deneyin.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full bg-[#f3f6f7] text-[#102a43] selection:bg-[#0f766e]/20 selection:text-[#102a43]">
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.08fr)_minmax(500px,0.92fr)]">
        <section className="relative hidden overflow-hidden bg-[#102a43] px-10 py-9 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'linear-gradient(to bottom right, black, transparent 78%)',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              aria-label="VetCep ana sayfası"
              className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#102a43]"
            >
              <BrandMark inverse />
            </Link>

            <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-white/55">
              PORTAL / 2026.07
            </span>
          </div>

          <div className="relative z-10 my-auto max-w-[660px] py-12">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78d8cb]">
              <span className="h-px w-8 bg-[#78d8cb]" />
              Yetkili portal erişimi
            </div>

            <h1 className="max-w-[620px] text-[clamp(2.8rem,4.3vw,4.9rem)] font-bold leading-[0.98] tracking-[-0.055em] text-white">
              Kayıtları yöneten ekibin çalışma alanı.
            </h1>
            <p className="mt-7 max-w-[560px] text-[15px] leading-7 text-slate-300 xl:text-base">
              Klinik operasyonlarını, sağlık kayıtlarını ve ekip iş akışlarını tek bir izlenebilir
              çalışma düzeninde yönetin.
            </p>

            <div className="mt-12 max-w-[610px] border-y border-white/14">
              {accessRows.map(row => (
                <div
                  key={row.index}
                  className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-white/10 py-4 last:border-b-0"
                >
                  <span className="font-mono text-[11px] font-medium text-[#78d8cb]">
                    {row.index}
                  </span>
                  <span className="text-sm font-semibold tracking-[-0.01em] text-white">
                    {row.title}
                  </span>
                  <span className="text-right text-xs text-slate-400">{row.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-8 border-t border-white/12 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-[#78d8cb]">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Kontrollü erişim</p>
                <p className="mt-1 text-[11px] text-slate-400">Oturum ve rol kapsamı birlikte doğrulanır.</p>
              </div>
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] text-white/35">
              VETCEP · AUTH
            </span>
          </div>
        </section>

        <section className="relative flex min-h-svh flex-col bg-[#f7f9fa] px-5 py-6 sm:px-8 lg:px-12 lg:py-9 xl:px-20 xl:py-12">
          <div className="flex items-center justify-between lg:justify-end">
            <Link
              href="/"
              aria-label="VetCep ana sayfası"
              className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f9fa] lg:hidden"
            >
              <BrandMark />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#425b70] outline-none transition-colors hover:text-[#0f766e] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9fa]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Ana sayfa
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12 sm:py-16 lg:py-10">
            <div className="lg:hidden">
              <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#0f766e]">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Yetkili portal erişimi
              </div>
            </div>

            <div className="mt-8 border-b border-[#d9e1e5] pb-8 lg:mt-0">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#0f766e]">
                VetCep / Portal
              </p>
              <h2 className="mt-4 text-[clamp(2.25rem,4vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.05em] text-[#102a43]">
                Portal girişi
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#5d7080]">
                Klinik ve yetkili ekip hesabınızla güvenli oturum açın.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[#e6b8b4] bg-[#fff4f2] px-4 py-3 text-sm leading-6 text-[#9a332b]"
                >
                  <CircleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-[#223f57]">
                  E-posta adresi
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ad.soyad@klinik.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={cn(
                    'h-12 border-[#cbd6dc] bg-white px-4 text-[15px] text-[#102a43] shadow-none placeholder:text-[#8797a3] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/20 dark:bg-white dark:text-[#102a43]',
                    errors.email && 'border-[#c24a42] focus-visible:border-[#c24a42] focus-visible:ring-[#c24a42]/15',
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-[#a63c34]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#223f57]">
                    Şifre
                  </Label>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg px-2 text-xs font-semibold text-[#0f766e] outline-none transition-colors hover:text-[#0b5f59] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9fa]"
                    onClick={() => toast.info('Şifre desteği', {
                      description: 'Klinik hesabınız için sistem yöneticinizle iletişime geçin.',
                      duration: 5000,
                    })}
                  >
                    Şifre desteği
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi girin"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={cn(
                      'h-12 border-[#cbd6dc] bg-white px-4 pr-12 text-[15px] text-[#102a43] shadow-none placeholder:text-[#8797a3] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/20 dark:bg-white dark:text-[#102a43]',
                      errors.password && 'border-[#c24a42] focus-visible:border-[#c24a42] focus-visible:ring-[#c24a42]/15',
                    )}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(value => !value)}
                    className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#647887] outline-none transition-colors hover:bg-[#edf3f3] hover:text-[#0f766e] focus-visible:ring-2 focus-visible:ring-[#0f766e]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" aria-hidden="true" />
                    ) : (
                      <Eye className="size-[18px]" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-[#a63c34]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-lg bg-[#0f766e] px-5 text-sm font-semibold text-white shadow-none hover:bg-[#0b655f] focus-visible:border-[#0f766e] focus-visible:ring-[#0f766e]/30 disabled:bg-[#6f9f9b]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Oturum açılıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Giriş yap
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 grid grid-cols-2 border-y border-[#d9e1e5] py-4 text-xs text-[#607483]">
              <span className="flex items-center gap-2">
                <Activity className="size-3.5 text-[#0f766e]" aria-hidden="true" />
                Rol bazlı erişim
              </span>
              <span className="flex items-center justify-end gap-2 text-right">
                <Clock3 className="size-3.5 text-[#0f766e]" aria-hidden="true" />
                İzlenebilir oturum
              </span>
            </div>

            <p className="mt-7 text-sm leading-6 text-[#607483]">
              Portal hesabınız yok mu?{' '}
              <Link
                href="/demo-talep"
                className="inline-flex min-h-11 items-center rounded-lg font-semibold text-[#0f766e] outline-none hover:text-[#0b5f59] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9fa]"
              >
                Demo görüşmesi talep et
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-[#d9e1e5] pt-5 font-mono text-[9px] tracking-[0.12em] text-[#7c8d99]">
            <span>VETCEP PORTAL</span>
            <span>YETKİLİ ERİŞİM</span>
          </div>
        </section>
      </div>
    </main>
  )
}

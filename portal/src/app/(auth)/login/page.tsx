'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import axios from 'axios'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore(s => s.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setApiError('')
    try {
      const res = await authService.loginClinic(data.email, data.password)
      setUser(res.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined
      setApiError(typeof message === 'string' ? message : 'Giriş başarısız. Bilgilerinizi kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol panel — marka */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/[0.03] rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/15 rounded-xl p-2.5">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">VetCep</span>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Kliniğinizin her<br />kaydı burada.
          </h1>
          <p className="text-primary-foreground/70 text-base leading-relaxed mb-10">
            Hasta takibi, aşı planı, muayene arşivi ve<br />lab sonuçları — tek platformda.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Hasta Takibi', value: '🐾' },
              { label: 'Aşı Planı', value: '💉' },
              { label: 'Muayene Arşivi', value: '🩺' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="text-xs text-primary-foreground/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-primary-foreground/40">
          VetCep Klinik Portalı · 2026
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobilde logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-primary rounded-xl p-2">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">VetCep</span>
          </div>

          <Card className="bg-white border-0 shadow-lg rounded-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
              <CardDescription>Klinik hesabınızla oturum açın</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {apiError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {apiError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doktor@klinik.com"
                    autoComplete="email"
                    className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Şifre</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => toast.info('Şifre sıfırlama', {
                        description: 'Klinik hesabınız için sistem yöneticinizle iletişime geçin.',
                        duration: 5000,
                      })}
                    >
                      Şifremi unuttum
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={cn(
                        'pr-10',
                        errors.password && 'border-destructive focus-visible:ring-destructive',
                      )}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Giriş yapılıyor...
                    </span>
                  ) : 'Giriş Yap'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Klinik hesabınız yok mu?{' '}
            <Link href="/clinic-onboarding" className="text-primary hover:underline font-medium">
              Klinik kaydı için iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

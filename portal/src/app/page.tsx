'use client'

import Link from 'next/link'
import { PawPrint, Stethoscope, Syringe, FlaskConical, Bell, Shield, BarChart3, Users, CheckCircle2, ArrowRight, Star } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Hasta Yönetimi',
    desc: 'Tüm evcil hayvan kayıtları, sahip bilgileri ve tıbbi geçmiş tek ekranda. Mikro çip ile hızlı arama.',
  },
  {
    icon: Syringe,
    title: 'Aşı Takibi',
    desc: 'Otomatik aşı hatırlatmaları, gecikmiş aşı uyarıları ve 30 günlük takvim görünümü.',
  },
  {
    icon: Stethoscope,
    title: 'Muayene Arşivi',
    desc: 'SOAP formatında muayene kayıtları, takip tarihleri ve veteriner notları. Geçmişe anında erişim.',
  },
  {
    icon: FlaskConical,
    title: 'Lab Sonuçları',
    desc: 'Kan tahlili, röntgen ve diğer tetkik sonuçlarını dijital arşivde saklayın, PDF olarak indirin.',
  },
  {
    icon: Bell,
    title: 'Akıllı Bildirimler',
    desc: 'Aşı tarihleri, takip randevuları ve ilaç hatırlatmaları hem klinik portalına hem sahibin telefonuna.',
  },
  {
    icon: BarChart3,
    title: 'Klinik Raporu',
    desc: 'Günlük muayene sayısı, yaklaşan aşılar ve hasta istatistiklerini tek bakışta görün.',
  },
]

const steps = [
  { num: '01', title: 'Kliniğinizi kaydedin', desc: 'Birkaç dakikada klinik hesabı oluşturun, sistemin kullanıma hazır olur.' },
  { num: '02', title: 'Ekibinizi ekleyin', desc: 'Veterinerler ve klinik çalışanları kendi hesaplarıyla giriş yapar.' },
  { num: '03', title: 'Hastaları yönetin', desc: 'Hayvan sahipleri mobil uygulamadan kayıt olur, siz portaldan takip edersiniz.' },
]

const stats = [
  { value: '500+', label: 'Kayıtlı Hasta' },
  { value: '12+', label: 'Klinik Ortağı' },
  { value: '98%', label: 'Müşteri Memnuniyeti' },
  { value: '7/24', label: 'Teknik Destek' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">e-Pati</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Giriş Yap
            </Link>
            <Link
              href="/clinic-onboarding"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Demo İste
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Star className="w-3 h-3" />
          Veteriner klinikleri için tasarlandı
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6 leading-tight">
          Kliniğinizin tüm
          <br />
          <span className="text-primary">sağlık kayıtları</span> dijitalde
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Hasta takibi, aşı planı, muayene arşivi ve lab sonuçları — hepsi tek platformda.
          Hayvan sahipleri mobil uygulamadan, klinik ekibiniz web portalından erişir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/clinic-onboarding"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-base"
          >
            Ücretsiz Demo İste
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted/50 transition-colors text-base"
          >
            Klinik Girişi
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Kliniğinize özel her şey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Kağıt dosyaya ve Excel tablolarına son. e-Pati ile klinik iş akışınız tamamen dijitale taşınır.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">3 adımda başlayın</h2>
            <p className="text-muted-foreground">Kurulum gerektirmez, teknik bilgi gerekmez.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-primary rounded-3xl p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <PawPrint
                key={i}
                className="absolute"
                style={{
                  top: `${(i * 43 + 11) % 100}%`,
                  left: `${(i * 61 + 7) % 100}%`,
                  width: `${20 + (i * 7) % 30}px`,
                  transform: `rotate(${(i * 67) % 360}deg)`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Kliniğinizi dijitalleştirmeye hazır mısınız?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Demo talebi bırakın, ekibimiz 24 saat içinde sizinle iletişime geçsin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/clinic-onboarding"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Ücretsiz Demo İste
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                Hesabım var, giriş yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <PawPrint className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">e-Pati</span>
            <span className="text-xs text-muted-foreground ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Klinik Girişi</Link>
            <Link href="/clinic-onboarding" className="hover:text-foreground transition-colors">Demo İste</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

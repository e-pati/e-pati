'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  UsersRound,
} from 'lucide-react'

const navItems = [
  { label: 'Özellikler', href: '#features' },
  { label: 'Mobil Uygulama', href: '#clinics' },
  { label: 'Fiyatlandırma', href: '/billing' },
  { label: 'Referanslar', href: '#workflow' },
  { label: 'Hakkımızda', href: '/clinic-onboarding' },
]

const features = [
  {
    icon: UsersRound,
    title: 'Hasta ve sahip yönetimi',
    text: 'Mikro çip, sahip bilgisi, tıbbi geçmiş ve dosyalar tek hasta kartında düzenli kalır.',
  },
  {
    icon: CalendarCheck2,
    title: 'Randevu ve yoğunluk takibi',
    text: 'Günlük plan, bekleyen mobil talepler ve tamamlanan randevular tek takvimde görünür.',
  },
  {
    icon: Syringe,
    title: 'Aşı ve hatırlatma sistemi',
    text: 'Geciken aşılar, yaklaşan kontroller ve sahip bildirimleri otomatik takip edilir.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp iletişimi',
    text: 'Muayene özeti, aşı hatırlatması ve lab sonucu mesajları klinik akışına bağlanır.',
  },
  {
    icon: BarChart3,
    title: 'Klinik analitiği',
    text: 'Kayıp hasta riski, yoğun saatler ve gelir görünümü satış sonrası kararları güçlendirir.',
  },
  {
    icon: ShieldCheck,
    title: 'Bulut tabanlı güvenli kayıt',
    text: 'Klinik ekibiniz web portalından, hayvan sahipleri mobil uygulamadan erişir.',
  },
]

const workflow = [
  { title: 'Klinik hesabı açılır', text: '14 günlük deneme hesabı hazırlanır, ekip girişi aktif edilir.' },
  { title: 'Hastalar dijitale taşınır', text: 'Hayvan kayıtları, sahip bilgileri, aşılar ve muayene geçmişi portala alınır.' },
  { title: 'Sahipler mobilde kalır', text: 'Randevu talepleri, bildirimler ve sağlık kayıtları mobil uygulamaya bağlanır.' },
]

const stats = [
  { value: '14 gün', label: 'Ücretsiz deneme' },
  { value: '7/24', label: 'Bulut erişimi' },
  { value: '5 dk', label: 'Hasta kartı kurulumu' },
  { value: '360°', label: 'Klinik görünümü' },
]

const trustItems = [
  'Kurulum desteği',
  'Mobil uygulama dahil',
  'Güvenli bulut altyapısı',
]

const heroProofItems = [
  { icon: ShieldCheck, title: 'Verileriniz güvende', text: 'Bulut tabanlı koruma' },
  { icon: CheckCircle2, title: 'KVKK', text: 'Uyumlu akışlar' },
  { icon: Star, title: 'ISO', text: '27001 hazırlığı' },
  { icon: PawPrint, title: 'Türkiye', text: 'Sunucuları' },
  { icon: Clock3, title: '7/24', text: 'Destek' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-[#0b2a4a]">
      <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-sm shadow-blue-900/10">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#0b2a4a]">VetCep</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Klinik Yönetim Sistemi</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-semibold text-slate-600 lg:flex">
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[#2563eb]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-[#0b2a4a]/20 px-4 py-2 text-xs font-bold text-[#0b2a4a] transition-colors hover:bg-sky-50"
            >
              Giriş Yap
            </Link>
            <Link
              href="/clinic-onboarding"
              className="hidden rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-900/10 transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Demo Talep Et
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_72%_8%,#e7f2ff_0,#f8fbff_32%,#ffffff_68%)]">
        <div className="absolute -right-24 top-12 h-[520px] w-[520px] rounded-full border border-sky-100" />
        <div className="absolute -right-10 top-32 h-[420px] w-[420px] rounded-full border border-sky-100" />
        <div className="absolute -bottom-20 left-0 h-56 w-[52vw] rounded-tr-[100%] bg-[#eaf4ff]" />

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-5 py-12 md:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:py-14">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#2563eb] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Veteriner klinikleri için dijital işletim sistemi
            </div>

            <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-[#0b2a4a] sm:text-5xl">
              Kliniğinizin yönetimi ve hasta sahipleriyle iletişimi
              <span className="block text-[#2563eb]">tek platformda.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Randevu, hasta kaydı, aşı takibi, laboratuvar sonuçları, reçeteler ve mobil sahip uygulaması tek dijital deneyimde birleşir.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/clinic-onboarding"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition-transform hover:-translate-y-0.5"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Demo Talep Et
              </Link>
              <Link
                href="#features"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-6 text-sm font-black text-[#2563eb] shadow-sm transition-colors hover:bg-sky-50"
              >
                <BarChart3 className="h-4 w-4" />
                Klinik Portalını İncele
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {trustItems.map(item => (
                <div key={item} className="inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563eb]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="relative min-h-[460px] lg:min-h-[540px]">
            <div className="absolute left-2 top-12 h-[380px] w-[78%] overflow-hidden rounded-3xl border-[10px] border-[#0b2a4a] bg-white shadow-2xl shadow-blue-950/20 [transform:perspective(1200px)_rotateY(-9deg)_rotateZ(-2deg)] lg:left-6 lg:top-4 lg:h-[440px]">
              <div className="grid h-full grid-cols-[88px_1fr]">
                <aside className="bg-[#0b2a4a] p-4 text-white">
                  <div className="mb-6 flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-sky-300" />
                    <span className="text-sm font-black">VetCep</span>
                  </div>
                  <div className="space-y-2 text-[10px] font-bold text-white/72">
                    {['Ana Sayfa', 'Randevular', 'Hastalar', 'Aşı Takibi', 'Laboratuvar', 'Ödemeler', 'Analitik'].map(item => (
                      <div key={item} className="rounded-lg px-2 py-2 first:bg-white/12">{item}</div>
                    ))}
                  </div>
                </aside>

                <div className="bg-[#f7fbff] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-[#0b2a4a]">Merhaba, Dr. Can Yılmaz</div>
                      <div className="text-[11px] font-medium text-slate-500">Bugünün klinik operasyon özeti</div>
                    </div>
                    <div className="hidden h-8 w-36 rounded-full border border-sky-100 bg-white px-3 text-[10px] font-semibold text-slate-400 md:flex md:items-center">Ara...</div>
                  </div>

                  <div className="mb-4 grid grid-cols-4 gap-3">
                    {[
                      ['12', 'Randevu'],
                      ['4', 'Bekleyen'],
                      ['7', 'Aşı hatırlatma'],
                      ['1.248', 'Toplam hasta'],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
                        <div className="text-lg font-black text-[#0b2a4a]">{value}</div>
                        <div className="text-[9px] font-bold text-slate-400">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
                    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-black text-[#0b2a4a]">Randevu Takvimi</span>
                        <CalendarCheck2 className="h-4 w-4 text-[#2563eb]" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-slate-400">
                        {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((time, index) => (
                          <div key={time} className="min-h-12 rounded-lg bg-slate-50 p-2">
                            <div>{time}</div>
                            {index === 1 && <div className="mt-1 rounded-md bg-blue-100 px-1.5 py-1 text-[#2563eb]">Mia kontrol</div>}
                            {index === 3 && <div className="mt-1 rounded-md bg-amber-100 px-1.5 py-1 text-amber-700">Oscar aşı</div>}
                            {index === 6 && <div className="mt-1 rounded-md bg-emerald-100 px-1.5 py-1 text-emerald-700">Pamuk lab</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 text-xs font-black text-[#0b2a4a]">Son Eklenen Hastalar</div>
                        {['Pamuk', 'Mia', 'Oscar'].map((pet, index) => (
                          <div key={pet} className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2 last:mb-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[#2563eb]">
                              <PawPrint className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-black text-slate-900">{pet}</div>
                              <div className="text-[9px] text-slate-400">{['Golden Retriever', 'British Shorthair', 'Tekir'][index]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-[#2563eb]" />
                          <span className="text-xs font-black text-[#0b2a4a]">Aylık trend</span>
                        </div>
                        <div className="text-2xl font-black text-[#0b2a4a]">156</div>
                        <div className="mt-2 flex h-12 items-end gap-1.5">
                          {[32, 54, 44, 72, 62, 88, 78].map(height => (
                            <div key={height} className="flex-1 rounded-t-md bg-[#2563eb]/25" style={{ height: `${height}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-1 top-24 w-[210px] rounded-[32px] border-[8px] border-[#0b2a4a] bg-[#0b2a4a] shadow-2xl shadow-blue-950/20 lg:right-0 lg:top-28">
              <div className="overflow-hidden rounded-[24px] bg-white">
                <div className="bg-[#2563eb] px-4 pb-10 pt-4 text-white">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-black">VetCep Mobil</span>
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/40 bg-white/20">
                    <PawPrint className="h-9 w-9" />
                  </div>
                </div>
                <div className="-mt-6 space-y-3 px-3 pb-4">
                  {[
                    ['Yaklaşan Aşı', 'Karma aşı · 3 gün kaldı', Syringe],
                    ['Reçete geçmişi', '4 kayıt görüntülenebilir', FileText],
                    ['Randevu Talebi', 'Bugün 14:30 onaylandı', CalendarCheck2],
                  ].map(([title, text, Icon]) => (
                    <div key={String(title)} className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                      <div className="mb-1 flex items-center gap-2 text-[11px] font-black text-[#0b2a4a]">
                        <Icon className="h-3.5 w-3.5 text-[#2563eb]" />
                        {title as string}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">{text as string}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 gap-1.5 border-t border-sky-100 pt-2">
                    {['Ana', 'Kayıt', 'Aşı', 'Profil'].map(item => (
                      <div key={item} className="rounded-lg py-1 text-center text-[9px] font-bold text-slate-400 first:bg-sky-50 first:text-[#2563eb]">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto -mt-8 max-w-5xl px-5 pb-8 md:px-8">
          <div className="grid gap-3 rounded-[28px] border border-sky-100 bg-white/90 p-4 shadow-xl shadow-blue-900/8 backdrop-blur md:grid-cols-5">
            {heroProofItems.map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#2563eb]">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#0b2a4a]">{item.title}</div>
                  <div className="text-[10px] font-semibold text-slate-400">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf6ff] py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 md:grid-cols-4 md:px-8">
          {stats.map(item => (
            <div key={item.label} className="rounded-3xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-[#2f6fa8]">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-3xl font-black text-[#2f6fa8]">{item.value}</div>
              <div className="mt-1 text-sm font-bold text-slate-600">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#2f6fa8]">Kliniklere Ne Sağlar?</div>
          <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Kağıt dosyadan premium klinik deneyimine</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            VetCep, kliniklerin ilk görüşmede göstermek isteyeceği sade, hızlı ve güven veren bir dijital altyapı sunar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(item => (
            <article key={item.title} className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#2f6fa8]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-[#f7fbff] py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-[#2f6fa8]">İş Akışı</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Kliniğe anlatması kolay, kullanması hızlı.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Satış görüşmesinde net bir hikaye: kayıtları toparla, ekibi aynı ekrana al, sahipleri mobilde tut.
            </p>
            <Link href="/clinic-onboarding" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#2f6fa8] px-5 py-3 font-black text-white">
              Klinik demo talep et
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {workflow.map((item, index) => (
              <div key={item.title} className="flex gap-5 rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2f6fa8] text-lg font-black text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="clinics" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="overflow-hidden rounded-[40px] bg-[#2f6fa8] text-white shadow-2xl shadow-blue-900/15">
          <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                <Stethoscope className="h-3.5 w-3.5" />
                Anlaşmak istediğiniz klinikler için
              </div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">İlk bakışta güven veren bir klinik portalı.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
                Demo sırasında hasta kartını, randevu takvimini, WhatsApp akışını ve mobil sahip deneyimini aynı ürün hikayesinde gösterebilirsiniz.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/clinic-onboarding" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-black text-[#2f6fa8]">
                  Demo İste
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-6 py-3 font-black text-white hover:bg-white/10">
                  Giriş Yap
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: FileText, label: 'SOAP muayene kayıtları' },
                { icon: BellRing, label: 'Aşı ve ilaç hatırlatmaları' },
                { icon: MessageCircle, label: 'WhatsApp hasta iletişimi' },
                { icon: BarChart3, label: 'Kayıp hasta ve yoğunluk analitiği' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <item.icon className="h-5 w-5" />
                  <span className="font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 md:flex-row md:px-8">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <PawPrint className="h-4 w-4 text-[#2f6fa8]" />
            VetCep © 2026
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-bold text-[#2f6fa8]">Giriş Yap</Link>
            <Link href="/clinic-onboarding" className="font-bold text-slate-600 hover:text-[#2f6fa8]">Demo İste</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

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
  HeartPulse,
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
  { label: 'İş Akışı', href: '#workflow' },
  { label: 'Klinikler', href: '#clinics' },
  { label: 'İletişim', href: '/clinic-onboarding' },
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="bg-[#0b2a4a] text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-xs md:px-8">
          <span className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            Klinikler için canlı demo görüşmeleri
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <MessageCircle className="h-3.5 w-3.5" />
            Web portal + mobil sahip uygulaması
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-sm shadow-blue-900/10">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#0b2a4a]">VetCep</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400">Klinik Portalı</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[#2563eb]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-bold text-[#0b2a4a] transition-colors hover:bg-sky-50"
            >
              Giriş Yap
            </Link>
            <Link
              href="/clinic-onboarding"
              className="hidden rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Demo Talep Et
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#f7fbff]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(37,99,235,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-white" />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-16 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-[#2563eb] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Veteriner klinikleri için dijital işletim sistemi
            </div>

            <h1 className="text-4xl font-black leading-[1.04] tracking-tight text-[#0b2a4a] sm:text-5xl md:text-6xl">
              Kliniğinizin yönetimi ve hasta sahipleriyle iletişimi
              <span className="block text-[#2563eb]">tek platformda.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Randevu, hasta kaydı, aşı takibi, laboratuvar sonuçları, reçeteler ve mobil sahip uygulaması tek dijital deneyimde birleşir.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/clinic-onboarding"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-6 text-base font-black text-white shadow-lg shadow-blue-900/15 transition-transform hover:-translate-y-0.5"
              >
                Demo Talep Et
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-6 text-base font-black text-[#0b2a4a] shadow-sm transition-colors hover:bg-sky-50"
              >
                Klinik Portalını İncele
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {trustItems.map(item => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-sky-100 pt-6">
              {[
                { value: '14 gün', label: 'deneme' },
                { value: '7/24', label: 'erişim' },
                { value: '360°', label: 'klinik görünümü' },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-2xl font-black text-[#0b2a4a]">{item.value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[560px] lg:min-h-[620px]">
            <div className="absolute right-0 top-0 h-full w-[88%] rounded-[44px] border border-sky-100 bg-white/78 shadow-2xl shadow-blue-900/10 backdrop-blur" />
            <div className="absolute right-6 top-7 h-[430px] w-[86%] overflow-hidden rounded-[30px] border border-white bg-white shadow-2xl shadow-blue-900/16">
              <div className="flex items-center justify-between border-b border-sky-100 bg-[#f0f7ff] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-black text-[#2563eb]">VetCep Klinik Portalı</span>
              </div>

              <div className="grid gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-[#0b2a4a]">Klinik Operasyon</div>
                    <div className="text-xs font-medium text-slate-500">Bugünün canlı akışı</div>
                  </div>
                  <span className="rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-black text-[#16a34a]">Aktif</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Randevu', value: '18', icon: CalendarCheck2 },
                    { label: 'Bildirim', value: '42', icon: BellRing },
                    { label: 'Hasta', value: '486', icon: PawPrint },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl border border-sky-100 bg-[#f7fbff] p-4">
                      <item.icon className="h-4 w-4 text-[#2563eb]" />
                      <div className="mt-3 text-2xl font-black text-[#0b2a4a]">{item.value}</div>
                      <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[1fr_0.72fr] gap-4">
                  <div className="rounded-3xl border border-sky-100 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-[#0b2a4a]">Bugünün randevuları</div>
                        <div className="text-xs text-slate-500">Ekip ve hasta görünümü</div>
                      </div>
                      <CalendarCheck2 className="h-4 w-4 text-[#2563eb]" />
                    </div>
                    {[
                      ['09:30', 'Mia', 'Aşı kontrolü'],
                      ['11:00', 'Oscar', 'Muayene'],
                      ['14:30', 'Pamuk', 'Lab sonucu'],
                    ].map(([time, pet, note]) => (
                      <div key={`${time}-${pet}`} className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 last:mb-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563eb]">
                          <PawPrint className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-slate-900">{pet}</div>
                          <div className="truncate text-xs text-slate-500">{note}</div>
                        </div>
                        <div className="text-xs font-black text-slate-500">{time}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl bg-[#0b2a4a] p-4 text-white">
                    <div className="mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-sky-300" />
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-sky-200">Analitik</span>
                    </div>
                    <div className="space-y-3">
                      {[72, 48, 86, 58].map((height, index) => (
                        <div key={height} className="flex items-center gap-2">
                          <span className="w-7 text-[10px] font-bold text-white/60">{['Pts', 'Sal', 'Çar', 'Per'][index]}</span>
                          <div className="h-2 flex-1 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-sky-300" style={{ width: `${height}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-7 text-3xl font-black">+31%</div>
                    <div className="mt-1 text-xs font-medium text-white/60">geri dönen hasta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 left-2 w-[245px] rounded-[36px] border border-slate-200 bg-[#0b2a4a] p-2 shadow-2xl shadow-blue-900/20">
              <div className="rounded-[28px] bg-white p-4">
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4ff] text-[#2563eb]">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0b2a4a]">Pamuk</div>
                    <div className="text-xs font-medium text-slate-500">Golden Retriever</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-[#f7fbff] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-[#0b2a4a]">Yaklaşan aşı</span>
                    <Syringe className="h-4 w-4 text-[#2563eb]" />
                  </div>
                  <div className="text-sm font-bold text-slate-600">Karma aşı · 3 gün kaldı</div>
                </div>
                <div className="mt-3 rounded-2xl border border-sky-100 p-3">
                  <div className="text-xs font-black text-[#0b2a4a]">Reçete geçmişi</div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <FileText className="h-3.5 w-3.5 text-[#2563eb]" />
                    4 kayıt görüntülenebilir
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-24 right-1 max-w-[250px] rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-xl shadow-blue-900/10">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#2563eb]">
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#0b2a4a]">Mobil bildirim</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">Sahip aşı hatırlatmasını telefonunda görür.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eaf6ff] py-10">
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

import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Beef,
  Building2,
  Check,
  ChevronRight,
  CircleDotDashed,
  Database,
  FileClock,
  HeartPulse,
  House,
  Layers3,
  LockKeyhole,
  MapPinned,
  Network,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Syringe,
  UserRound,
  Warehouse,
} from 'lucide-react'

import { HeroProductVisual, RegionalHealthVisual } from '@/components/landing/platform-visuals'
import { SectionHeading } from '@/components/landing/section-heading'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'

const platformPrinciples = [
  {
    icon: CircleDotDashed,
    title: 'Yaşam boyu kayıt',
    description: 'Kimlikten sağlık geçmişine uzanan olayları tek ve anlaşılır bir zaman çizgisinde toplar.',
  },
  {
    icon: Network,
    title: 'Birlikte çalışabilir mimari',
    description: 'Mevcut kayıt altyapılarıyla, gerekli izin ve protokoller sağlandığında birlikte çalışacak şekilde tasarlanır.',
  },
  {
    icon: Activity,
    title: 'Eyleme dönüşen görünürlük',
    description: 'Dağınık kayıtları saha ekipleri ve karar vericiler için okunabilir sağlık göstergelerine dönüştürür.',
  },
]

const useCases = [
  {
    number: '01',
    icon: UserRound,
    title: 'Hayvan sahibi deneyimi',
    description: 'Kimlik, aşı, reçete ve sağlık geçmişine sade bir mobil deneyim üzerinden erişim.',
    detail: 'Evcil ve üretim hayvanları için tek sahip görünümü',
  },
  {
    number: '02',
    icon: Stethoscope,
    title: 'Veteriner ve klinik operasyonları',
    description: 'Hasta kartı, muayene, aşılama, laboratuvar ve randevu iş akışlarının tek portalda yönetimi.',
    detail: 'Klinik kayıtlarında derinlik ve izlenebilirlik',
  },
  {
    number: '03',
    icon: Beef,
    title: 'Üretici ve işletme kayıtları',
    description: 'İşletme, küpe, hareket ve olay geçmişinin üretici ihtiyaçlarına uygun görünümü.',
    detail: 'Saha hareketlerinden yaşam döngüsü kaydına',
  },
  {
    number: '04',
    icon: Warehouse,
    title: 'Barınak ve saha operasyonları',
    description: 'Kabul, koruyucu sağlık, kısırlaştırma ve sahiplendirme adımlarının tutarlı kayıt zinciri.',
    detail: 'Operasyon sürecinde kesintisiz olay geçmişi',
  },
  {
    number: '05',
    icon: MapPinned,
    title: 'Bölgesel analitik ve karar desteği',
    description: 'Popülasyon, aşılama kapsamı ve erken sinyaller için coğrafi ve karşılaştırılabilir görünüm.',
    detail: 'Sentetik verilerle geliştirilen karar-destek yüzeyi',
  },
]

const lifecycle = [
  { icon: ScanLine, title: 'Kimlik', text: 'Tekil hayvan kaydı' },
  { icon: HeartPulse, title: 'Sağlık', text: 'Muayene ve bulgular' },
  { icon: Syringe, title: 'Koruyucu sağlık', text: 'Aşı ve kontroller' },
  { icon: House, title: 'Sahiplik', text: 'Doğrulanabilir ilişki' },
  { icon: Building2, title: 'Hareket', text: 'İşletme ve saha olayları' },
  { icon: FileClock, title: 'Geçmiş', text: 'Yaşam boyu zaman çizgisi' },
]

const architectureLayers = [
  {
    label: 'Yetkili kayıt kaynakları',
    title: 'Mevcut altyapılar',
    text: 'Gerçek bağlantılar yalnız ilgili yetki, veri sahipliği kararı ve teknik protokoller sonrasında ele alınır.',
    icon: Database,
  },
  {
    label: 'VetCep katmanı',
    title: 'Entegrasyon ve deneyim',
    text: 'Kayıtları kullanıcı rolüne uygun iş akışlarına, izlenebilir olaylara ve anlaşılır ürün yüzeylerine dönüştürür.',
    icon: Layers3,
  },
  {
    label: 'Ürün yüzeyleri',
    title: 'Rol bazlı erişim',
    text: 'Hayvan sahibi, veteriner, üretici, saha operasyonu ve analitik kullanım alanlarını aynı mimari üzerinde buluşturur.',
    icon: Smartphone,
  },
]

const trustPrinciples = [
  'Rol ve görev kapsamına göre erişim yaklaşımı',
  'Gerektiği kadar veri gösteren sade ekranlar',
  'Kritik kayıtlar için olay ve işlem geçmişi hedefi',
  'Demo, pilot ve üretim ortamlarının açık ayrımı',
  'Gerçek entegrasyonlarda izin ve protokol zorunluluğu',
  'Tanıtım ortamında kişisel veri yerine sentetik kayıtlar',
]

const deliveryStages = [
  {
    status: 'Bugün',
    title: 'Demonstrasyon',
    text: 'Temel kullanıcı yüzeyleri ve karar-destek senaryoları sentetik verilerle çalışır.',
    active: true,
  },
  {
    status: 'Sonraki adım',
    title: 'Sınırlı pilot',
    text: 'Kapsam, kullanıcı grubu, veri kaynağı ve başarı ölçütleri yazılı olarak tanımlanır.',
  },
  {
    status: 'Yetkilendirme sonrası',
    title: 'Üretim değerlendirmesi',
    text: 'Güvenlik, hukuk, veri yönetişimi ve entegrasyon kararları tamamlanmadan canlı veri kullanılmaz.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#102a43]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#f8fafc]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-y-0 right-0 w-[48%] bg-[linear-gradient(135deg,transparent_0%,rgba(204,251,241,0.48)_100%)]" />
            <div className="absolute left-[8%] top-28 size-64 rounded-full border border-[#0f766e]/8" />
            <div className="absolute left-[4%] top-44 size-40 rounded-full border border-[#0f766e]/8" />
          </div>

          <div className="relative mx-auto grid max-w-[1280px] gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0f766e]/20 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f766e] shadow-sm">
                <span className="size-1.5 rounded-full bg-[#0f766e]" />
                Bağımsız hayvan sağlığı teknolojisi
              </div>

              <h1 className="mt-7 max-w-3xl text-balance text-[42px] font-black leading-[0.98] tracking-[-0.055em] text-[#102a43] sm:text-6xl lg:text-[68px]">
                Hayvan sağlığında yaşam boyu dijital kayıt.
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                VetCep; veterinerler, hayvan sahipleri, üreticiler ve saha ekipleri için kimlik, sağlık ve yaşam döngüsü kayıtlarını tek, anlaşılır deneyimde buluşturmayı hedefler.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/clinic-onboarding"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-6 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(15,118,110,0.2)] transition-colors hover:bg-[#0b655f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                >
                  Ürün demosu talep et
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-extrabold text-[#102a43] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                >
                  Portal girişi
                </Link>
              </div>

              <div className="mt-8 flex items-start gap-3 border-l-2 border-[#0f766e]/30 pl-4 text-xs font-semibold leading-5 text-slate-500">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#0f766e]" />
                <span>Ürün ekranları sentetik kayıtlarla hazırlanır. Gerçek veri bağlantıları izin ve teknik değerlendirmeye tabidir.</span>
              </div>
            </div>

            <HeroProductVisual />
          </div>

          <div className="relative border-t border-slate-200 bg-white/75">
            <div className="mx-auto grid max-w-[1280px] divide-y divide-slate-200 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:grid-cols-4 lg:px-10">
              {[
                ['Bağımsız platform', 'Herhangi bir kurum adına hareket etmez'],
                ['Sentetik demonstrasyon', 'Kişisel veri içermeyen ürün senaryoları'],
                ['Modüler mimari', 'Farklı kullanıcı rollerine uyarlanabilir yapı'],
                ['Yetkiye bağlı bağlantı', 'Entegrasyon öncesi izin ve protokol'],
              ].map(([title, text]) => (
                <div key={title} className="px-0 py-5 sm:px-5 lg:px-6">
                  <div className="text-xs font-black text-[#102a43]">{title}</div>
                  <div className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
              <SectionHeading
                eyebrow="Platform yaklaşımı"
                title="Kayıt tutmanın ötesinde, ortak bir sağlık görünümü."
                description="VetCep, farklı kullanım alanlarında oluşan olayları tek bir ürün diliyle görünür kılmayı; kullanıcıya yalnız ihtiyacı olan doğru bilgiyi sunmayı amaçlar."
              />
              <p className="border-l border-slate-300 pl-6 text-base leading-8 text-slate-600 lg:mb-1 lg:pl-8">
                Mevcut kayıt altyapılarının yerine geçme iddiası taşımaz. Gerçek kullanımda veri kaynağı, erişim yönü ve sorumluluklar ilgili taraflarla yazılı olarak belirlenir; VetCep bu kayıtları modern iş akışlarına ve karar desteğine taşıyan deneyim katmanı olarak konumlanır.
              </p>
            </div>

            <div className="mt-14 grid border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
              {platformPrinciples.map((item) => (
                <article key={item.title} className="border-b border-slate-200 py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
                  <item.icon className="size-6 text-[#0f766e]" strokeWidth={1.8} />
                  <h3 className="mt-6 text-lg font-black tracking-[-0.025em] text-[#102a43]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="scroll-mt-24 border-y border-slate-200 bg-[#eef3f6] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Kullanım alanları"
              title="Aynı kayıt omurgası, role göre şekillenen deneyimler."
              description="Her kullanıcı aynı verinin tamamını değil; görevini güvenli ve anlaşılır biçimde tamamlamak için gerekli görünümü kullanır."
              className="max-w-3xl"
            />

            <div className="mt-14 border-t border-slate-300">
              {useCases.map((item) => (
                <article key={item.number} className="group grid gap-5 border-b border-slate-300 py-7 md:grid-cols-[64px_0.85fr_1.15fr_32px] md:items-center md:gap-8">
                  <div className="flex items-center justify-between md:block">
                    <span className="font-mono text-xs font-bold text-slate-400">{item.number}</span>
                    <span className="flex size-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#0f766e] md:mt-3">
                      <item.icon className="size-4.5" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-[-0.03em] text-[#102a43] sm:text-2xl">{item.title}</h3>
                    <p className="mt-2 text-xs font-bold text-[#0f766e]">{item.detail}</p>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-slate-600">{item.description}</p>
                  <ChevronRight className="hidden size-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0f766e] md:block" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Dijital yaşam döngüsü"
              title="Her olay, aynı hayvan kaydının devamı."
              description="VetCep, parçalı işlemleri birbirinden kopuk ekranlar olarak değil; kimlikten geçmişe uzanan tutarlı bir yaşam döngüsü olarak ele alır."
              align="center"
              className="max-w-3xl"
            />

            <div className="relative mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-0">
              <div className="absolute left-[8%] right-[8%] top-8 hidden h-px bg-slate-200 lg:block" aria-hidden="true" />
              {lifecycle.map((item, index) => (
                <div key={item.title} className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:block lg:border-0 lg:p-0 lg:text-center">
                  <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-[#f8fafc] text-[#0f766e] shadow-sm lg:mx-auto">
                    <item.icon className="size-5" strokeWidth={1.8} />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#102a43] font-mono text-[8px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="lg:mt-5">
                    <h3 className="text-sm font-black text-[#102a43]">{item.title}</h3>
                    <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#102a43] py-20 text-white sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 lg:px-10">
            <div>
              <SectionHeading
                eyebrow="Bölgesel görünürlük"
                title="Sağlık sinyallerini coğrafi bağlamıyla okuyun."
                description="Popülasyon, aşılama kapsamı ve erken sinyaller sentetik verilerle aynı görünümde karşılaştırılır. Bu ekran bir ürün kabiliyeti demonstrasyonudur; gerçek sağlık verisi içermez."
                inverse
              />
              <div className="mt-8 space-y-3">
                {[
                  'Bölgesel karşılaştırma ve kapsam görünümü',
                  'İl bazında sentetik risk ve aşılama özeti',
                  'Karar vericiler için açıklanabilir sinyal akışı',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-white/74">
                    <span className="flex size-5 items-center justify-center rounded-full border border-[#5eead4]/35 bg-[#5eead4]/10 text-[#99f6e4]">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <RegionalHealthVisual />
          </div>
        </section>

        <section id="approach" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Birlikte çalışma yaklaşımı"
              title="Yerine geçen değil, izinle birlikte çalışan bir katman."
              description="Entegrasyon bir pazarlama iddiası değil; veri sahibi, erişim yönü, güvenlik sınırı ve sorumlulukların yazılı olarak belirlendiği teknik bir süreçtir."
              align="center"
              className="max-w-4xl"
            />

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {architectureLayers.map((layer, index) => (
                <article key={layer.title} className="relative border border-slate-200 bg-[#f8fafc] p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#0f766e] shadow-sm ring-1 ring-slate-200">
                      <layer.icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">0{index + 1}</span>
                  </div>
                  <div className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#0f766e]">{layer.label}</div>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#102a43]">{layer.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{layer.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <p><strong>Şeffaflık ilkesi:</strong> Bu sayfa herhangi bir kurumla mevcut bağlantı, yetkilendirme veya onay iddiası taşımaz. Gerçek bağlantılar ayrı sözleşme ve teknik değerlendirme gerektirir.</p>
            </div>
          </div>
        </section>

        <section id="trust" className="scroll-mt-24 border-y border-slate-200 bg-[#eef3f6] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-[1280px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
            <div>
              <SectionHeading
                eyebrow="Güven ve yönetişim"
                title="İddialar değil, açık sınırlar ve doğrulanabilir adımlar."
                description="VetCep’in güven yaklaşımı; bugün neyin demo olduğunu, pilotta hangi kararların alınacağını ve üretim öncesi hangi kapıların kapanması gerektiğini açıkça ayırır."
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {trustPrinciples.map((item) => (
                  <div key={item} className="flex items-start gap-3 border-t border-slate-300 pt-3 text-sm font-bold leading-6 text-slate-700">
                    <Check className="mt-1 size-4 shrink-0 text-[#0f766e]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,35,55,0.08)] sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">Ürün olgunluk çizgisi</div>
                  <div className="mt-1 text-lg font-black text-[#102a43]">Demo → Pilot → Üretim</div>
                </div>
                <LockKeyhole className="size-6 text-[#0f766e]" strokeWidth={1.7} />
              </div>

              <div className="mt-6 space-y-0">
                {deliveryStages.map((stage, index) => (
                  <div key={stage.title} className="relative grid grid-cols-[32px_1fr] gap-4 pb-7 last:pb-0">
                    {index < deliveryStages.length - 1 && <span className="absolute left-[15px] top-7 h-full w-px bg-slate-200" aria-hidden="true" />}
                    <span className={`relative z-10 mt-0.5 flex size-8 items-center justify-center rounded-full border ${stage.active ? 'border-[#0f766e] bg-[#0f766e] text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                      {stage.active ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                    </span>
                    <div>
                      <div className={`text-[10px] font-extrabold uppercase tracking-[0.15em] ${stage.active ? 'text-[#0f766e]' : 'text-slate-400'}`}>{stage.status}</div>
                      <h3 className="mt-1 text-base font-black text-[#102a43]">{stage.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{stage.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[32px] bg-[#0f766e] text-white shadow-[0_30px_70px_rgba(15,118,110,0.2)]">
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#99f6e4]">Ürün değerlendirmesi</div>
                <h2 className="mt-4 max-w-3xl text-balance text-3xl font-black leading-[1.05] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                  Hayvan sağlığı kayıtları için ortak bir dijital deneyimi birlikte değerlendirelim.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Demo görüşmesinde çalışan ürün yüzeylerini, sentetik veri sınırlarını ve sınırlı pilot için gerekli kararları açık biçimde paylaşalım.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/clinic-onboarding" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-extrabold text-[#0f766e] transition-colors hover:bg-[#f0fdfa]">
                  Demo görüşmesi talep et
                  <ArrowRight className="size-4" />
                </Link>
                <a href="mailto:hello@vetcep.com" className="inline-flex h-12 items-center justify-center rounded-lg border border-white/25 px-6 text-sm font-extrabold text-white transition-colors hover:bg-white/10">
                  hello@vetcep.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

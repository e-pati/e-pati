import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  PawPrint,
  QrCode,
  Smartphone,
  Star,
  Stethoscope,
  Syringe,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'VetCep Uygulamasını İndir',
  description: 'Evcil hayvanınızın sağlık kayıtlarını, aşı takvimini ve veteriner bilgilerini her zaman yanınızda taşıyın.',
}

const features = [
  { icon: Stethoscope, text: 'Muayene geçmişi' },
  { icon: Syringe, text: 'Aşı takibi' },
  { icon: Bell, text: 'Hatırlatmalar' },
  { icon: QrCode, text: 'QR ile hızlı erişim' },
]

export default async function GetAppPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const { source } = await searchParams
  const isCitizenDemo = source === 'edevlet-demo'

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center px-6 py-16 text-center">

      {isCitizenDemo && (
        <div className="mb-8 flex w-full max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-emerald-950 shadow-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">Vatandaş girişi tamamlandı · Simülasyon</p>
            <p className="mt-1 text-xs leading-5 text-emerald-800">
              Gerçek kimlik doğrulaması yapılmadı ve herhangi bir resmî sisteme veri gönderilmedi.
            </p>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <PawPrint className="w-7 h-7 text-primary-foreground" />
        </div>
        <span className="text-3xl font-bold text-foreground tracking-tight">VetCep</span>
      </div>

      {/* Başlık */}
      <h1 className="text-4xl font-bold text-foreground mb-4 max-w-xs leading-tight">
        {isCitizenDemo ? (
          <>Hayvan kayıtlarınız<br />her zaman yanınızda</>
        ) : (
          <>Evcil dostunuz<br />her zaman güvende</>
        )}
      </h1>
      <p className="text-muted-foreground text-base max-w-sm mb-10 leading-relaxed">
        {isCitizenDemo
          ? 'Evcil ve üretim hayvanlarınıza ait kimlik, aşı ve sağlık kayıtlarını tek mobil deneyimde görüntüleyin.'
          : 'Veteriner ziyaretleri, aşı takvimleri ve sağlık kayıtları — hepsi cebinizde. Çip numaranızı girerek kliniğinizdeki verilere anında ulaşın.'}
      </p>

      {/* Özellikler */}
      <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-xs">
        {features.map(f => (
          <div key={f.text} className="flex items-center gap-2.5 bg-background rounded-xl p-3 border border-border/50 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{f.text}</span>
          </div>
        ))}
      </div>

      {isCitizenDemo ? (
        <div className="mb-10 w-full max-w-xs rounded-2xl border border-primary/20 bg-background p-5 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Mobil demo cihazında hazır</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Pamuk ve Sarıkız kayıt senaryosu</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Sunumda evcil hayvan aşı kartı ile üretici hayvan kayıtları Expo demo uygulamasından gösterilir.
          </p>
        </div>
      ) : (
        <>
          {/* İndirme butonları */}
          <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
            {/* App Store */}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-foreground text-background rounded-2xl px-6 py-4 hover:opacity-90 transition-opacity shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current flex-shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-70">İndir</div>
                <div className="text-base font-semibold leading-tight">App Store</div>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-foreground text-background rounded-2xl px-6 py-4 hover:opacity-90 transition-opacity shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current flex-shrink-0">
                <path d="M3.18 23.76c.35.19.74.24 1.14.14l.1-.06 11.34-6.55-2.49-2.49-10.09 8.96zM.77 1.5C.44 1.87.25 2.43.25 3.15v17.7c0 .72.19 1.28.53 1.65l.09.08 9.9-9.9v-.23L.77 1.5zM20.94 10.4l-2.74-1.58-2.76 2.76 2.76 2.76 2.76-1.6c.79-.45.79-1.89-.02-2.34zM4.32.1L15.66 6.65l-2.49 2.49L3.08.18l.1-.06C3.57-.02 3.97.03 4.32.1z" />
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-70">Google Play&apos;den Al</div>
                <div className="text-base font-semibold leading-tight">Google Play</div>
              </div>
            </a>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1">Ücretsiz · iOS & Android</span>
          </div>
        </>
      )}

      {/* Klinik için */}
      <div className="border-t border-border/50 pt-8 w-full max-w-xs">
        {!isCitizenDemo && (
          <>
            <p className="text-xs text-muted-foreground mb-3">Klinik portalı için</p>
            <Link
              href="/"
              className="text-sm text-primary hover:underline font-medium"
            >
              e-pati-portal.vercel.app →
            </Link>
          </>
        )}
        <Link
          href="/demo-akisi"
          className={isCitizenDemo
            ? 'text-sm font-semibold text-primary hover:underline'
            : 'mt-4 block text-xs font-semibold text-muted-foreground hover:text-primary'}
        >
          ← Sunum akışına dön
        </Link>
      </div>
    </div>
  )
}

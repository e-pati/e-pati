import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/shared/providers'

const BASE_URL = 'https://vetcep.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'VetCep — Veteriner Klinik Yönetim Sistemi',
    template: '%s | VetCep',
  },
  description: 'Veteriner klinikleri için hasta takibi, aşı planı, muayene arşivi ve evcil hayvan sahibi mobil uygulaması. Türkiye\'nin dijital veteriner klinik portalı.',
  keywords: ['veteriner yazılımı', 'veteriner klinik programı', 'evcil hayvan sağlık takibi', 'veteriner yönetim sistemi', 'hasta takip programı', 'aşı takip', 'VetCep'],
  authors: [{ name: 'VetCep', url: BASE_URL }],
  creator: 'VetCep',
  publisher: 'VetCep',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'VetCep',
    title: 'VetCep — Veteriner Klinik Yönetim Sistemi',
    description: 'Hasta takibi, aşı planı, muayene arşivi ve evcil hayvan sahibi mobil uygulaması — tek platformda.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VetCep Veteriner Klinik Portalı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetCep — Veteriner Klinik Yönetim Sistemi',
    description: 'Türkiye\'nin dijital veteriner klinik portalı. 14 gün ücretsiz dene.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: BASE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

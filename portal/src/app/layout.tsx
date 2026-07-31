import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/providers'

const BASE_URL = 'https://vetcep.com'

// Değişken fontlar: ağırlık ölçeği 400/600/700 ile sınırlıdır, 900 kullanılmaz.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

// Kayıt numarası / zaman damgası / sürüm imzası için mono aile.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'VetCep — Hayvan Sağlığı Kayıt Platformu',
    template: '%s | VetCep',
  },
  description: 'Hayvan kimliği, sağlık ve yaşam döngüsü kayıtlarını veterinerler, hayvan sahipleri, üreticiler ve saha ekipleri için anlaşılır bir dijital deneyimde buluşturmayı hedefleyen bağımsız teknoloji platformu.',
  keywords: ['hayvan sağlığı', 'dijital hayvan kaydı', 'veteriner yazılımı', 'hayvan kimliği', 'aşı takibi', 'üretici kayıtları', 'VetCep'],
  authors: [{ name: 'VetCep', url: BASE_URL }],
  creator: 'VetCep',
  publisher: 'VetCep',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'VetCep',
    title: 'VetCep — Hayvan Sağlığında Yaşam Boyu Dijital Kayıt',
    description: 'Kimlik, sağlık ve yaşam döngüsü kayıtları için bağımsız dijital deneyim platformu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetCep — Hayvan Sağlığı Kayıt Platformu',
    description: 'Hayvan sağlığında yaşam boyu dijital kayıt deneyimi.',
  },
  alternates: { canonical: BASE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

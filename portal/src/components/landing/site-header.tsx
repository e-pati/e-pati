import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { BrandMark } from './brand-mark'
import { MobileNav } from './mobile-nav'

const navigation = [
  { label: 'Platform', href: '#platform' },
  { label: 'Kullanım alanları', href: '#use-cases' },
  { label: 'Yaklaşım', href: '#approach' },
  { label: 'Güven', href: '#trust' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8fafc]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="VetCep ana sayfa" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-4">
          <BrandMark />
        </Link>

        <nav aria-label="Ana navigasyon" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-bold text-slate-600 transition-colors hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-semibold text-[#102a43] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
          >
            Portal girişi
          </Link>
          <Link
            href="/demo-talep"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#173f5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
          >
            Demo talebi
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <MobileNav navigation={navigation} />
      </div>
    </header>
  )
}

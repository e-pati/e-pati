import Link from 'next/link'
import { ArrowUpRight, Menu } from 'lucide-react'

import { BrandMark } from './brand-mark'

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
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-extrabold text-[#102a43] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
          >
            Portal girişi
          </Link>
          <Link
            href="/clinic-onboarding"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-[#173f5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
          >
            Demo talep et
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <details className="group relative sm:hidden">
          <summary
            aria-label="Navigasyon menüsünü aç"
            className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-[#102a43] shadow-sm marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
          >
            <Menu className="size-5" />
          </summary>
          <div className="absolute right-0 top-14 w-[min(320px,calc(100vw-40px))] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
            <nav aria-label="Mobil navigasyon" className="grid">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0f766e]">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-xs font-extrabold text-[#102a43]">
                Portal girişi
              </Link>
              <Link href="/clinic-onboarding" className="inline-flex h-11 items-center justify-center rounded-xl bg-[#102a43] text-xs font-extrabold text-white">
                Demo talep et
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}

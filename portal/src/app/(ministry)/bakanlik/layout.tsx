import Link from 'next/link'
import { Database, Landmark, PawPrint, Presentation, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export default function MinistryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/bakanlik" className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#123b55] text-white shadow-sm">
              <PawPrint className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-tight text-slate-950 sm:text-base">
                VetCep Bakanlık Konsolu
              </div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">
                Ulusal Hayvan Sağlığı Karar Destek Sistemi
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/demo-akisi" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 xl:flex">
              <Presentation className="size-4" /> Sunum Akışı
            </Link>
            <Badge
              variant="outline"
              className="hidden h-7 border-amber-300 bg-amber-50 px-3 font-semibold text-amber-800 sm:inline-flex"
            >
              <Database className="size-3" />
              Sentetik Veri · Demo
            </Badge>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span className="hidden sm:inline">Bakanlık Merkez</span>
              <Landmark className="size-4 sm:hidden" />
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}

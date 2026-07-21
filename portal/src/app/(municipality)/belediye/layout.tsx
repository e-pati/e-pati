import Link from 'next/link'
import { Building2, Database, House, PawPrint, Presentation, ShieldCheck } from 'lucide-react'

import { MunicipalityDemoSteps } from '@/components/municipality/municipality-demo-steps'
import { Badge } from '@/components/ui/badge'

export default function MunicipalityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f7f8] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1420px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/belediye" className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#153d58] text-white shadow-sm">
              <PawPrint className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-tight sm:text-base">VetCep Belediye Operasyonları</div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">Sahipsiz hayvan yaşam döngüsü</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/demo-akisi" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 xl:flex">
              <Presentation className="size-4" /> Sunum Akışı
            </Link>
            <Link href="/belediye" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white sm:flex">
              <House className="size-4" /> Operasyon paneli
            </Link>
            <Badge variant="outline" className="h-8 border-amber-300 bg-amber-50 px-3 font-semibold text-amber-800">
              <Database className="size-3" /> <span className="hidden sm:inline">Sentetik Veri · </span>Demo
            </Badge>
            <div className="hidden items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900 lg:flex">
              <ShieldCheck className="size-4" /> Belediye operasyon simülasyonu
            </div>
            <Building2 className="size-5 text-cyan-800 lg:hidden" />
          </div>
        </div>
      </header>
      <MunicipalityDemoSteps />
      {children}
    </div>
  )
}

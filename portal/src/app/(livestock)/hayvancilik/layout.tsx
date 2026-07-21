import Link from 'next/link'
import { Database, House, Layers3, PawPrint, ShieldCheck } from 'lucide-react'

import { LivestockDemoSteps } from '@/components/livestock/livestock-demo-steps'
import { Badge } from '@/components/ui/badge'

export default function LivestockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/hayvancilik" className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#174936] text-white shadow-sm">
              <PawPrint className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-tight sm:text-base">VetCep Hayvancılık</div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">
                Üretici deneyim ve entegrasyon katmanı
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/hayvancilik"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-white sm:flex"
            >
              <House className="size-4" />
              Üretici paneli
            </Link>
            <Badge variant="outline" className="h-8 border-amber-300 bg-amber-50 px-3 font-semibold text-amber-800">
              <Database className="size-3" />
              <span className="hidden sm:inline">Sentetik Veri · </span>Demo
            </Badge>
            <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 lg:flex">
              <ShieldCheck className="size-4" />
              HAYBİS entegrasyon simülasyonu
            </div>
            <Layers3 className="size-5 text-emerald-800 lg:hidden" />
          </div>
        </div>
      </header>

      <LivestockDemoSteps />
      {children}
    </div>
  )
}


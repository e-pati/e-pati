import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'

import { BrandMark } from './brand-mark'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-10 lg:py-16">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
            Hayvan kimliği, sağlık ve yaşam döngüsü kayıtlarını anlaşılır bir dijital deneyimde buluşturmayı hedefleyen bağımsız teknoloji platformu.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">Platform</h3>
          <div className="mt-5 grid gap-3 text-sm font-bold text-slate-600">
            <Link href="#platform" className="hover:text-[#0f766e]">Genel bakış</Link>
            <Link href="#use-cases" className="hover:text-[#0f766e]">Kullanım alanları</Link>
            <Link href="#approach" className="hover:text-[#0f766e]">Çalışma yaklaşımı</Link>
            <Link href="#trust" className="hover:text-[#0f766e]">Güven ilkeleri</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">İletişim</h3>
          <div className="mt-5 grid gap-3 text-sm font-bold text-slate-600">
            <a href="mailto:hello@vetcep.com" className="inline-flex items-center gap-2 hover:text-[#0f766e]">
              <Mail className="size-4" />
              hello@vetcep.com
            </a>
            <Link href="/clinic-onboarding" className="inline-flex items-center gap-2 hover:text-[#0f766e]">
              Demo görüşmesi
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/login" className="hover:text-[#0f766e]">Portal girişi</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-5 text-[11px] font-semibold leading-5 text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <span>© 2026 VetCep. Bağımsız teknoloji platformu.</span>
          <span className="max-w-3xl md:text-right">
            Bu sayfadaki ekranlar ve veriler sentetik demonstrasyondur. Gerçek entegrasyonlar ilgili izin, protokol ve teknik değerlendirmelere tabidir.
          </span>
        </div>
      </div>
    </footer>
  )
}

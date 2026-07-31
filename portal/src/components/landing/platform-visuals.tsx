import { Activity, Check, FileHeart, MapPinned, ShieldCheck, Syringe } from 'lucide-react'

import { turkeyProvinceGeometries } from '@/lib/turkey-province-map-data'

export function HeroProductVisual() {
  return (
    <div className="relative mx-auto min-h-[430px] w-full max-w-[610px] lg:min-h-[520px]" aria-label="VetCep dijital hayvan kaydı ürün görünümü">
      <div className="absolute inset-x-0 top-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#102a43] shadow-[0_30px_80px_rgba(15,35,55,0.22)] lg:inset-x-4">
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/58">
            <span className="size-2 rounded-full bg-[#2dd4bf]" />
            Sentetik demo kaydı
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold text-white/55">HKN · Demo</span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[0.76fr_1.24fr] sm:p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/52">Dijital kimlik</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-[#2dd4bf]/15 text-[#5eead4]">
                <ShieldCheck className="size-3.5" />
              </span>
            </div>
            <div className="mt-7 flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f0fdfa] text-xl font-black text-[#0f766e]">P</div>
              <div>
                <div className="text-lg font-black tracking-tight">Pamuk</div>
                <div className="mt-1 text-[11px] font-semibold text-white/55">Golden Retriever · Dişi</div>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-white/10 pt-4 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-white/48">Kayıt numarası</dt>
                <dd className="font-mono font-bold text-white/84">34-2026-1842</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-white/48">Kimlik durumu</dt>
                <dd className="inline-flex items-center gap-1.5 font-bold text-[#5eead4]"><Check className="size-3" /> Doğrulandı</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Sağlık özeti</div>
                  <div className="mt-1 text-sm font-black text-[#102a43]">Koruyucu sağlık planı güncel</div>
                </div>
                <Activity className="size-5 text-[#0f766e]" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['4', 'Aşı kaydı'],
                  ['2', 'Muayene'],
                  ['0', 'Aktif uyarı'],
                ].map(([value, label]) => (
                  <div key={label} className="border-l border-slate-200 pl-3 first:border-l-0 first:pl-0">
                    <div className="text-xl font-black tracking-tight text-[#102a43]">{value}</div>
                    <div className="mt-1 text-[9px] font-bold leading-3 text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/48">Son kayıt hareketleri</div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Syringe, title: 'Kuduz aşısı', detail: '12 Haziran 2026 · Tamamlandı' },
                  { icon: FileHeart, title: 'Genel muayene', detail: '28 Mayıs 2026 · Klinik kaydı' },
                  { icon: MapPinned, title: 'Sahiplik bilgisi', detail: 'Doğrulanmış kayıt' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#5eead4]">
                      <item.icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold">{item.title}</div>
                      <div className="mt-0.5 truncate text-[9px] font-semibold text-white/45">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1 left-1/2 flex w-[86%] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_50px_rgba(15,35,55,0.12)] sm:w-[78%] lg:bottom-3">
        <div className="min-w-0">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Yaşam boyu kayıt</div>
          <div className="mt-1 truncate text-xs font-black text-[#102a43]">Kimlikten sağlık geçmişine tek görünüm</div>
        </div>
        <div className="flex shrink-0 -space-x-2">
          {['K', 'S', 'H', 'O'].map((label, index) => (
            <span key={label} className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#e2e8f0] text-[9px] font-black text-[#102a43]" style={{ zIndex: 4 - index }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RegionalHealthVisual() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b2135] shadow-[0_30px_70px_rgba(2,15,25,0.28)]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-white/45">Bölgesel sağlık görünümü</div>
          <div className="mt-1 text-sm font-black text-white">Sentetik risk ve aşılama dağılımı</div>
        </div>
        <span className="w-fit rounded-full border border-[#5eead4]/25 bg-[#5eead4]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#99f6e4]">
          Demo verisi
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <svg viewBox="0 0 900 380" role="img" aria-label="Sentetik bölgesel hayvan sağlığı risk haritası" className="h-auto w-full">
          <defs>
            <pattern id="landingMapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeOpacity="0.08" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="900" height="380" rx="24" fill="url(#landingMapGrid)" />
          <g transform="translate(0 3)">
            {turkeyProvinceGeometries.map((province) => {
              const fill = province.plateCode === 42 ? '#f59e0b' : province.plateCode % 7 === 0 ? '#2dd4bf' : '#0f766e'
              return (
                <path
                  key={province.plateCode}
                  d={province.path}
                  fill={fill}
                  fillOpacity={province.plateCode === 42 ? 0.95 : 0.78}
                  stroke="#ccfbf1"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </g>
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          {[
            ['81', 'Bölgesel görünüm'],
            ['%87', 'Demo aşılama'],
            ['4', 'Sentetik sinyal'],
          ].map(([value, label]) => (
            <div key={label} className="border-l border-white/10 pl-3 first:border-0 first:pl-0">
              <div className="text-xl font-black tracking-tight text-white sm:text-2xl">{value}</div>
              <div className="mt-1 text-[9px] font-bold leading-4 text-white/42 sm:text-[10px]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight, Building2, CheckCircle2, HeartHandshake, HousePlus, PawPrint, RotateCcw, Scissors, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { demoMunicipality, demoStrayAnimal, municipalityDemoStats } from '@/lib/municipality-demo-data'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

const stats = [
  { label: 'Bakımevindeki hayvan', value: municipalityDemoStats.shelterAnimals, icon: PawPrint, style: 'bg-cyan-50 text-cyan-700' },
  { label: 'Kısırlaştırma bekleyen', value: municipalityDemoStats.awaitingSterilization, icon: Scissors, style: 'bg-amber-50 text-amber-700' },
  { label: 'Sahiplendirmeye hazır', value: municipalityDemoStats.readyForAdoption, icon: HeartHandshake, style: 'bg-emerald-50 text-emerald-700' },
  { label: 'Bu ay sahiplendirilen', value: municipalityDemoStats.adoptedThisMonth, icon: CheckCircle2, style: 'bg-violet-50 text-violet-700' },
]

export default function MunicipalityDashboardPage() {
  const { shelterAdmissionCompleted, sterilizationCompleted, listingPublished, resetDemo } = useMunicipalityDemoStore()
  const completed = [shelterAdmissionCompleted, sterilizationCompleted, listingPublished].filter(Boolean).length

  return (
    <main className="mx-auto max-w-[1420px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-3xl bg-[#153d58] text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-0 bg-white/10 text-cyan-50">Tek Belediye · Tohumlanmış Demo</Badge>
              <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-100">Resmî kayıt değildir</Badge>
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Barınak kabulünden güvenli sahiplendirmeye izlenebilir süreç</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/75 sm:text-base">
              Belediyenin sahipsiz hayvan operasyonlarını tek HKN altında standartlaştıran demo deneyimi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/belediye/barinak-giris" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-sm font-bold text-[#153d58] transition-colors hover:bg-cyan-50">
                Demo akışını başlat <ArrowRight className="size-4" />
              </Link>
              <Button type="button" variant="outline" onClick={resetDemo} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <RotateCcw className="size-4" /> Demo akışını sıfırla
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-center justify-between">
              <div><div className="text-xs font-bold uppercase tracking-wider text-cyan-100/70">Senaryo ilerlemesi</div><div className="mt-1 text-3xl font-black">{completed}/3</div></div>
              <ShieldCheck className="size-9 text-cyan-200" />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/15"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${(completed / 3) * 100}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-cyan-50/70">Barınak girişi, kısırlaştırma ve ilan kaydı tek yaşam döngüsünde birleşir.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => <Card key={stat.label} className="border-slate-200 shadow-none"><CardContent className="flex items-center gap-4 p-5"><div className={`flex size-11 items-center justify-center rounded-xl ${stat.style}`}><stat.icon className="size-5" /></div><div><div className="text-2xl font-black">{stat.value}</div><div className="text-xs font-medium text-slate-500">{stat.label}</div></div></CardContent></Card>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">AKTİF DEMO KAYDI</div><CardTitle className="mt-1 text-lg">Dost’un belediye süreci</CardTitle></div>
            <Badge variant="outline">HKN bekliyor</Badge>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-cyan-50 text-4xl">🐕</div>
            <div>
              <h2 className="text-xl font-black">{demoStrayAnimal.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{demoStrayAnimal.breed} · {demoStrayAnimal.sex} · {demoStrayAnimal.estimatedAge}</p>
              <p className="mt-3 text-xs text-slate-500">Bulunduğu bölge: {demoStrayAnimal.foundDistrict} / Ankara · Hassas konum paylaşılmaz</p>
            </div>
            <Link href="/belediye/barinak-giris" className={buttonVariants({ className: 'bg-cyan-700 hover:bg-cyan-800' })}><HousePlus className="size-4" /> Kaydı aç</Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4 text-cyan-700" /> Demo birimi</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl bg-slate-50 p-4"><div className="font-black text-slate-900">{demoMunicipality.name}</div><div className="mt-1 text-xs text-slate-500">{demoMunicipality.unit}</div><div className="mt-3 text-xs font-semibold text-cyan-800">{demoMunicipality.shelter}</div></div>
            <div className="mt-4 space-y-2"><Status label="Barınak kabulü" complete={shelterAdmissionCompleted} /><Status label="Kısırlaştırma" complete={sterilizationCompleted} /><Status label="İlan yayını" complete={listingPublished} /></div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function Status({ label, complete }: { label: string; complete: boolean }) {
  return <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm"><span className="font-semibold text-slate-700">{label}</span>{complete ? <CheckCircle2 className="size-4 text-emerald-600" /> : <span className="text-[11px] font-semibold text-slate-400">Bekliyor</span>}</div>
}

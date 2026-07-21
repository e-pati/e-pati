'use client'

import { Activity, ArrowLeft, Beef, Building2, CalendarDays, CheckCircle2, Clock3, Database, Fingerprint, HeartPulse, MapPin, MoveRight, ShieldCheck, Syringe } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { demoLivestockAnimal, destinationEnterprise, sourceEnterprise, type DemoLivestockEvent } from '@/lib/livestock-demo-data'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

const eventIcons: Record<DemoLivestockEvent['type'], typeof Activity> = {
  registration: Fingerprint,
  health: HeartPulse,
  movement: MoveRight,
}

export default function LivestockAnimalDetailPage() {
  const { events, currentEnterpriseId, movementCompleted } = useLivestockDemoStore()
  const currentEnterprise = currentEnterpriseId === destinationEnterprise.id ? destinationEnterprise : sourceEnterprise

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/hayvancilik" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="size-4" /> Üretici paneline dön</Link>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Sentetik hayvan profili</Badge>
      </div>

      <section className="overflow-hidden rounded-3xl bg-[#143f31] text-white shadow-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[auto_1fr_auto] md:items-center lg:px-10">
          <div className="flex size-24 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-5xl">🐄</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">BÜYÜKBAŞ DİJİTAL KİMLİK</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{demoLivestockAnimal.name}</h1>
            <p className="mt-1 text-sm text-emerald-50/70">{demoLivestockAnimal.breed} · {demoLivestockAnimal.sex} · {demoLivestockAnimal.purpose}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-0 bg-emerald-300/15 text-emerald-100"><CheckCircle2 className="size-3" /> Sağlıklı</Badge>
              <Badge className="border-0 bg-white/10 text-white"><Syringe className="size-3" /> Aşı %{demoLivestockAnimal.vaccinationCoverage}</Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 md:text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">HAYVAN KİMLİK NUMARASI</div>
            <div className="mt-2 font-mono text-sm font-black text-white sm:text-base">{demoLivestockAnimal.hkn}</div>
            <div className="mt-2 font-mono text-xs text-emerald-100/70">Küpe: {demoLivestockAnimal.earTag}</div>
          </div>
        </div>
      </section>

      {movementCompleted && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div><div className="text-sm font-black">Hareket başarıyla tamamlandı</div><p className="mt-1 text-xs text-emerald-800/70">Sarıkız’ın güncel işletmesi ve yaşam boyu olay zinciri yenilendi.</p></div>
        </div>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.42fr_1fr]">
        <div className="space-y-5">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Kimlik özeti</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <InfoItem label="Tür" value={demoLivestockAnimal.species} icon={Beef} />
              <InfoItem label="Doğum" value="8 Nisan 2022" icon={CalendarDays} />
              <InfoItem label="Irk" value={demoLivestockAnimal.breed} icon={Activity} />
              <InfoItem label="Cinsiyet" value={demoLivestockAnimal.sex} icon={ShieldCheck} />
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><Building2 className="size-5" /></div>
                <Badge className="bg-emerald-100 text-emerald-800">Güncel işletme</Badge>
              </div>
              <h2 className="mt-4 font-black text-emerald-950">{currentEnterprise.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-900/60"><MapPin className="size-3" /> {currentEnterprise.district} / {currentEnterprise.city}</p>
              <p className="mt-3 font-mono text-xs font-bold text-emerald-900/75">{currentEnterprise.registrationNo}</p>
            </CardContent>
          </Card>

          {!movementCompleted && (
            <Link href="/hayvancilik/hareket" className={buttonVariants({ className: 'w-full bg-emerald-700 hover:bg-emerald-800' })}>
              <MoveRight className="size-4" /> Hareket akışına git
            </Link>
          )}
        </div>

        <Card className="border-slate-200 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">YAŞAM BOYU KAYIT</div><CardTitle className="mt-1 text-lg">Olay geçmişi</CardTitle></div>
            <Badge variant="outline">{events.length} olay</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-0">
              {events.map((event, index) => {
                const Icon = eventIcons[event.type]
                return (
                  <div key={event.id} className="grid grid-cols-[40px_1fr] gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex size-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"><Icon className="size-4" /></div>
                      {index < events.length - 1 && <div className="min-h-16 w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-7">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-black text-slate-900">{event.title}</h2>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Clock3 className="size-3" /> {formatEventDate(event.date)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{event.description}</p>
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500"><MapPin className="size-3" /> {event.location}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return <div><Icon className="size-4 text-emerald-700" /><div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-bold text-slate-800">{value}</div></div>
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

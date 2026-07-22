'use client'

import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  Beef,
  Building2,
  CheckCircle2,
  CircleAlert,
  MoveRight,
  RotateCcw,
  ShieldCheck,
  Syringe,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  destinationEnterprise,
  livestockDemoStats,
  sourceEnterprise,
} from '@/lib/livestock-demo-data'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

const statCards = [
  { label: 'Toplam hayvan', value: livestockDemoStats.totalAnimals, icon: Beef, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Aşı bekleyen', value: livestockDemoStats.vaccinationDue, icon: Syringe, color: 'text-amber-700', bg: 'bg-amber-50' },
  { label: 'Aktif hareket', value: livestockDemoStats.activeMovements, icon: MoveRight, color: 'text-sky-700', bg: 'bg-sky-50' },
  { label: 'Sağlık uyarısı', value: livestockDemoStats.healthAlerts, icon: Activity, color: 'text-rose-700', bg: 'bg-rose-50' },
]

export default function LivestockDashboardPage() {
  const {
    createdEnterprise,
    animalRegistered,
    movementCompleted,
    resetDemo,
  } = useLivestockDemoStore()
  const completedSteps = [Boolean(createdEnterprise), animalRegistered, movementCompleted].filter(Boolean).length
  const enterprises = createdEnterprise
    ? [sourceEnterprise, destinationEnterprise, createdEnterprise]
    : [sourceEnterprise, destinationEnterprise]

  return (
    <main className="mx-auto max-w-[1480px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-3xl bg-[#123d2e] text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.6fr] lg:px-10 lg:py-10">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-white/10 text-emerald-50">Üretici Demo Alanı</Badge>
              <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-100">Resmî kayıt değildir</Badge>
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              İşletmeden hayvan hareketine tek dijital kayıt zinciri
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75 sm:text-base">
              HAYBİS/TÜRKVET kayıt otoritesinin üzerinde çalışan modern üretici deneyimini dört adımda gösterin.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/hayvancilik/isletmeler/yeni"
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-sm font-bold text-[#123d2e] transition-colors hover:bg-emerald-50 sm:w-auto"
              >
                Demo akışını başlat <ArrowRight className="size-4" />
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={resetDemo}
                className="h-11 w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <RotateCcw className="size-4" /> Demo akışını sıfırla
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100/70">Senaryo ilerlemesi</div>
                <div className="mt-1 text-3xl font-black">{completedSteps}/3</div>
              </div>
              <ShieldCheck className="size-9 text-emerald-200" />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/15">
              <div
                className="h-full rounded-full bg-emerald-300 transition-all"
                style={{ width: `${(completedSteps / 3) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-emerald-50/70">
              İşletme kaydı, küpe ile giriş ve hareket onayı tamamlandığında olay geçmişi tek profilde birleşir.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <Card key={card.label} className="border-slate-200 shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex size-11 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-950">{card.value}</div>
                <div className="text-xs font-medium text-slate-500">{card.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">İşletme ağı</div>
              <CardTitle className="mt-1 text-lg">Kayıtlı demo işletmeleri</CardTitle>
            </div>
            <Badge variant="outline">{enterprises.length} işletme</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {enterprises.map(enterprise => (
              <div key={enterprise.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    <Building2 className="size-5" />
                  </div>
                  <Badge className={enterprise.status === 'demo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}>
                    {enterprise.status === 'demo' ? 'Yeni demo' : 'Doğrulandı'}
                  </Badge>
                </div>
                <h2 className="mt-4 font-black text-slate-950">{enterprise.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{enterprise.district} / {enterprise.city}</p>
                <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">İşletme No</div>
                    <div className="font-mono text-xs font-bold text-slate-700">{enterprise.registrationNo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black">{enterprise.animalCount}</div>
                    <div className="text-[10px] text-slate-400">hayvan</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleAlert className="size-4 text-amber-600" /> Demo durum özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow label="İşletme kaydı" complete={Boolean(createdEnterprise)} />
            <StatusRow label="Küpe ile hayvan girişi" complete={animalRegistered} />
            <StatusRow label="İşletmeler arası hareket" complete={movementCompleted} />
            <Link href="/hayvancilik/hayvanlar/sarikiz" className={buttonVariants({ variant: 'outline', className: 'mt-2 w-full' })}>
              Sarıkız olay geçmişi
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function StatusRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {complete ? (
        <CheckCircle2 className="size-5 text-emerald-600" />
      ) : (
        <span className="text-xs font-semibold text-slate-400">Bekliyor</span>
      )}
    </div>
  )
}

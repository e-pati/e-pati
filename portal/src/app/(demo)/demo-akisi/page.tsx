'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Beef,
  Building2,
  Check,
  CirclePlay,
  Clock3,
  ExternalLink,
  Flag,
  Landmark,
  MapPinned,
  PawPrint,
  Presentation,
  RotateCcw,
  Smartphone,
  Stethoscope,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DEMO_TOTAL_MINUTES,
  demoPresentationStages,
  type DemoPresentationStage,
} from '@/lib/demo-presentation-data'
import { cn } from '@/lib/utils'
import { useDemoPresentationStore } from '@/stores/demo-presentation.store'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

const stageIcons = {
  opening: Presentation,
  citizen: Smartphone,
  clinic: Stethoscope,
  producer: Beef,
  municipality: Building2,
  ministry: MapPinned,
  closing: Flag,
} as const

const toneStyles: Record<DemoPresentationStage['tone'], { active: string; icon: string; badge: string }> = {
  slate: { active: 'border-slate-400 bg-slate-50', icon: 'bg-slate-900 text-white', badge: 'bg-slate-100 text-slate-700' },
  red: { active: 'border-red-300 bg-red-50', icon: 'bg-red-700 text-white', badge: 'bg-red-100 text-red-700' },
  violet: { active: 'border-violet-300 bg-violet-50', icon: 'bg-violet-700 text-white', badge: 'bg-violet-100 text-violet-700' },
  emerald: { active: 'border-emerald-300 bg-emerald-50', icon: 'bg-emerald-700 text-white', badge: 'bg-emerald-100 text-emerald-700' },
  cyan: { active: 'border-cyan-300 bg-cyan-50', icon: 'bg-cyan-700 text-white', badge: 'bg-cyan-100 text-cyan-700' },
  blue: { active: 'border-blue-300 bg-blue-50', icon: 'bg-blue-800 text-white', badge: 'bg-blue-100 text-blue-700' },
  amber: { active: 'border-amber-300 bg-amber-50', icon: 'bg-amber-600 text-white', badge: 'bg-amber-100 text-amber-800' },
}

export default function DemoPresentationPage() {
  const {
    currentStageIndex,
    startedAt,
    isRunning,
    startPresentation,
    goToStage,
    nextStage,
    resetPresentation,
  } = useDemoPresentationStore()
  const resetLivestock = useLivestockDemoStore(state => state.resetDemo)
  const resetMunicipality = useMunicipalityDemoStore(state => state.resetDemo)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning || !startedAt) return

    const updateElapsed = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    const interval = window.setInterval(updateElapsed, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning, startedAt])

  const currentStage = demoPresentationStages[currentStageIndex]
  const isLastStage = currentStageIndex === demoPresentationStages.length - 1
  const targetSeconds = DEMO_TOTAL_MINUTES * 60
  const progress = ((currentStageIndex + 1) / demoPresentationStages.length) * 100

  const start = () => {
    resetLivestock()
    resetMunicipality()
    setElapsedSeconds(0)
    startPresentation()
  }

  const resetAll = () => {
    resetLivestock()
    resetMunicipality()
    setElapsedSeconds(0)
    resetPresentation()
  }

  return (
    <div className="min-h-screen bg-[#f2f5f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white"><PawPrint className="size-5" /></div>
            <div><div className="text-sm font-black sm:text-base">VetCep Faz 0 Sunum Kumandası</div><div className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block">Bakanlık toplantısı · Presenter görünümü</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Dahili Demo Aracı</Badge>
            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 sm:flex"><Clock3 className="size-4" /> Hedef 25:00</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-10">
            <div>
              <div className="flex flex-wrap gap-2"><Badge className="border-0 bg-white/10 text-slate-100">7 Bölüm</Badge><Badge className="border border-emerald-300/25 bg-emerald-300/10 text-emerald-100">Tek prova rotası</Badge></div>
              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">25 dakikada vatandaş deneyiminden ulusal karar desteğine</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Tüm Faz 0 yüzeylerini doğru sırada açın, süreyi takip edin ve demo durumlarını tek noktadan sıfırlayın.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={start} className="bg-white text-slate-950 hover:bg-slate-100"><CirclePlay className="size-4" /> {isRunning ? 'Sunumu yeniden başlat' : 'Sunumu başlat'}</Button>
                <Button type="button" variant="outline" onClick={resetAll} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><RotateCcw className="size-4" /> Tüm demo durumlarını sıfırla</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Geçen süre</div><div data-testid="presentation-timer" className={cn('mt-1 font-mono text-4xl font-black', elapsedSeconds > targetSeconds && 'text-rose-300')}>{formatTime(elapsedSeconds)}</div></div><div className="text-right"><div className="text-xs text-slate-400">Bölüm</div><div className="mt-1 text-2xl font-black">{currentStageIndex + 1}/7</div></div></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="mt-4 text-sm font-bold text-white">{isRunning ? currentStage.title : 'Sunum başlamaya hazır'}</div>
              <div className="mt-1 text-xs text-slate-400">{isRunning ? currentStage.timeRange : 'Başlatıldığında demo durumları temizlenir.'}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Sunum zaman çizelgesi</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4">
              {demoPresentationStages.map((stage, index) => {
                const Icon = stageIcons[stage.id as keyof typeof stageIcons]
                const active = index === currentStageIndex
                const complete = isRunning && index < currentStageIndex
                const styles = toneStyles[stage.tone]
                return (
                  <button key={stage.id} type="button" onClick={() => goToStage(index)} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors', active ? styles.active : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white')}>
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', complete ? 'bg-emerald-600 text-white' : active ? styles.icon : 'bg-white text-slate-500')}>
                      {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-black">{stage.order}. {stage.title}</span><span className="shrink-0 font-mono text-[10px] font-bold text-slate-400">{stage.timeRange}</span></div><div className="mt-1 text-[11px] text-slate-500">{stage.durationMinutes} dakika</div></div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className={cn('border-2 shadow-none', toneStyles[currentStage.tone].active)}>
            <CardHeader className="border-b border-slate-200/70">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><Badge className={toneStyles[currentStage.tone].badge}>Bölüm {currentStage.order} · {currentStage.timeRange}</Badge><CardTitle data-testid="presentation-current-stage" className="mt-3 text-2xl">{currentStage.title}</CardTitle></div>
                <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hedef süre</div><div className="font-mono text-lg font-black">{currentStage.durationMinutes}:00</div></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">SEYİRCİYE ANA MESAJ</div><p className="mt-2 text-lg font-black leading-7 text-slate-950">{currentStage.audienceMessage}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4"><div className="flex items-center gap-2 text-xs font-black text-slate-700"><Presentation className="size-4" /> Konuşmacı notu</div><p className="mt-2 text-sm leading-6 text-slate-600">{currentStage.presenterNote}</p></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">GÖSTERİLECEKLER</div><div className="mt-3 grid gap-2 sm:grid-cols-3">{currentStage.checkpoints.map(item => <div key={item} className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-bold text-slate-700 shadow-sm"><Check className="size-4 shrink-0 text-emerald-600" /> {item}</div>)}</div></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5">
                <div className="flex flex-wrap gap-2">
                  {currentStage.href && <Link href={currentStage.href} target="_blank" className={buttonVariants({ className: 'bg-slate-950 text-white hover:bg-slate-800' })}>{currentStage.actionLabel} <ExternalLink className="size-4" /></Link>}
                  {currentStage.supportingLinks?.map(link => <Link key={link.href} href={link.href} target="_blank" className={buttonVariants({ variant: 'outline' })}>{link.label}</Link>)}
                </div>
                <Button type="button" onClick={nextStage} disabled={isLastStage} className="bg-cyan-700 hover:bg-cyan-800">Sonraki bölüme geç <ArrowRight className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><Landmark className="mt-0.5 size-5 shrink-0 text-blue-700" /><p><strong>Sunum ilkesi:</strong> HAYBİS, PETVET, İTS ve e-Devlet kayıt otoriteleridir. VetCep; entegrasyon, kullanıcı deneyimi, klinik derinlik ve karar-destek katmanı olarak anlatılır.</p></div>
      </main>
    </div>
  )
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

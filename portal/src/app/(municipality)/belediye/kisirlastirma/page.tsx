'use client'

import { ArrowLeft, CalendarCheck, CheckCircle2, ClipboardCheck, Database, HeartPulse, Scissors, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { demoSterilization, demoStrayAnimal } from '@/lib/municipality-demo-data'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

export default function SterilizationPage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const sterilizationCompleted = useMunicipalityDemoStore(state => state.sterilizationCompleted)
  const completeSterilization = useMunicipalityDemoStore(state => state.completeSterilization)

  const submit = () => {
    if (!confirmed && !sterilizationCompleted) {
      toast.error('Operasyon kaydını doğruladığınızı işaretleyin')
      return
    }
    completeSterilization()
    toast.success('Kısırlaştırma kaydı tamamlandı')
    router.push('/belediye/sahiplendirme/yeni')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/belediye/barinak-giris" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-700"><ArrowLeft className="size-4" /> Barınak kabulüne dön</Link><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><Scissors className="size-5" /></div><div><h1 className="text-2xl font-black tracking-tight">Kısırlaştırma kaydı</h1><p className="mt-1 text-sm text-slate-500">Dost’un operasyon ve kontrol bilgilerini yaşam boyu sağlık kaydına ekleyin.</p></div></div></div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Demo sağlık işlemi</Badge>
      </div>

      <Card className="mb-6 border-slate-200 shadow-none">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-50 text-3xl">🐕</div>
          <div className="min-w-0 flex-1"><div className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">BELEDİYE HAYVAN KAYDI</div><div className="mt-1 flex flex-wrap items-center gap-3"><h2 className="text-lg font-black">{demoStrayAnimal.name}</h2><span className="font-mono text-xs font-bold text-slate-500">{demoStrayAnimal.hkn}</span></div><p className="text-xs text-slate-500">{demoStrayAnimal.breed} · {demoStrayAnimal.sex} · {demoStrayAnimal.estimatedAge}</p></div>
          <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="size-3" /> Operasyona uygun</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-base"><Stethoscope className="size-4 text-cyan-700" /> Operasyon bilgileri</CardTitle></CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Info label="Protokol numarası" value={demoSterilization.protocolNo} mono />
            <Info label="Operasyon tarihi" value="21 Temmuz 2026" />
            <Info label="İşlem" value={demoSterilization.procedure} />
            <Info label="Veteriner hekim" value={demoSterilization.veterinarian} />
            <Info label="Operasyon sonucu" value={demoSterilization.result} success />
            <Info label="Kontrol tarihi" value="28 Temmuz 2026" />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <input type="checkbox" checked={confirmed || sterilizationCompleted} onChange={event => setConfirmed(event.target.checked)} className="mt-0.5 size-4 accent-cyan-700" />
              <span><span className="block text-sm font-bold text-slate-800">Operasyon kaydını doğruladım</span><span className="mt-1 block text-xs leading-5 text-slate-500">Protokol, hekim, sonuç ve kontrol tarihinin demo senaryosuyla uyumlu olduğunu onaylıyorum.</span></span>
            </label>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/70 shadow-none"><CardContent className="p-5"><HeartPulse className="size-6 text-emerald-700" /><h2 className="mt-4 font-black text-emerald-950">Ön kontroller tamam</h2><ul className="mt-3 space-y-2 text-xs text-emerald-900/75"><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> Genel muayene uygun</li><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> Kimlik kaydı doğrulandı</li><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> Kontrol tarihi planlandı</li></ul></CardContent></Card>
          <Button type="button" onClick={submit} className="h-11 w-full bg-cyan-700 hover:bg-cyan-800"><ClipboardCheck className="size-4" /> İşlemi kaydet ve ilerle</Button>
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500"><CalendarCheck className="mt-0.5 size-4 shrink-0 text-cyan-700" /> Bu ekran gerçek operasyon veya tıbbi talimat oluşturmaz; sentetik demo kaydıdır.</div>
        </aside>
      </div>
    </main>
  )
}

function Info({ label, value, mono = false, success = false }: { label: string; value: string; mono?: boolean; success?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className={`mt-1 text-sm font-bold ${success ? 'text-emerald-700' : 'text-slate-800'} ${mono ? 'font-mono' : ''}`}>{value}</div></div>
}

'use client'

import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ClipboardCheck, Database, MapPin, MoveRight, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { demoLivestockAnimal, destinationEnterprise, sourceEnterprise } from '@/lib/livestock-demo-data'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

export default function LivestockMovementPage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const completeMovement = useLivestockDemoStore(state => state.completeMovement)
  const movementCompleted = useLivestockDemoStore(state => state.movementCompleted)

  const submitMovement = () => {
    if (!confirmed && !movementCompleted) {
      toast.error('Hareket bilgilerini doğruladığınızı işaretleyin')
      return
    }
    completeMovement()
    toast.success('İşletmeler arası hareket başarıyla tamamlandı')
    router.push('/hayvancilik/hayvanlar/sarikiz')
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/hayvancilik/hayvanlar/yeni" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700">
            <ArrowLeft className="size-4" /> Hayvan girişine dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><Truck className="size-5" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">İşletmeler arası hayvan hareketi</h1>
              <p className="mt-1 text-sm text-slate-500">Kaynak ve hedef işletme arasında izlenebilir nakil kaydı oluşturun.</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Demo sevk kaydı</Badge>
      </div>

      <Card className="mb-6 border-slate-200 shadow-none">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">🐄</div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">HAREKET EDECEK HAYVAN</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-lg font-black">{demoLivestockAnimal.name}</h2>
              <span className="font-mono text-xs font-bold text-slate-500">{demoLivestockAnimal.earTag}</span>
            </div>
            <p className="text-xs text-slate-500">{demoLivestockAnimal.breed} · {demoLivestockAnimal.sex} · {demoLivestockAnimal.purpose}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="size-3" /> Sağlık uygun</Badge>
        </CardContent>
      </Card>

      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <EnterpriseCard title="Kaynak işletme" enterprise={sourceEnterprise} tone="source" />
        <div className="flex items-center justify-center">
          <div className="flex size-12 rotate-90 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 lg:rotate-0"><ArrowRight className="size-5" /></div>
        </div>
        <EnterpriseCard title="Hedef işletme" enterprise={destinationEnterprise} tone="destination" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">Sevk ve doğrulama özeti</CardTitle></CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <SummaryItem label="Planlanan hareket tarihi" value="21 Temmuz 2026" />
            <SummaryItem label="Sevk belgesi" value="SVK-2026-06-001847" mono />
            <SummaryItem label="Nakil amacı" value="İşletme devri" />
            <SummaryItem label="Veteriner sağlık raporu" value="Uygun · 7 gün geçerli" />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={confirmed || movementCompleted}
                onChange={event => setConfirmed(event.target.checked)}
                className="mt-0.5 size-4 accent-emerald-700"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800">Hareket bilgilerini doğruladım</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">Kaynak, hedef, küpe ve sağlık raporu bilgilerinin demo senaryosuyla uyumlu olduğunu onaylıyorum.</span>
              </span>
            </label>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-sky-200 bg-sky-50/70 shadow-none">
            <CardContent className="p-5">
              <ClipboardCheck className="size-6 text-sky-700" />
              <h2 className="mt-4 font-black text-sky-950">Kontroller tamamlandı</h2>
              <ul className="mt-3 space-y-2 text-xs text-sky-900/75">
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> Küpe ve HKN eşleşti</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> İşletmeler aktif</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> Sağlık raporu geçerli</li>
              </ul>
            </CardContent>
          </Card>
          <Button type="button" onClick={submitMovement} className="h-12 w-full bg-emerald-700 hover:bg-emerald-800">
            <MoveRight className="size-4" /> Hareketi onayla ve tamamla
          </Button>
          <p className="text-center text-[11px] leading-4 text-slate-400">Bu işlem yalnızca tarayıcıdaki sentetik demo durumunu günceller.</p>
        </aside>
      </div>
    </main>
  )
}

function EnterpriseCard({
  title,
  enterprise,
  tone,
}: {
  title: string
  enterprise: typeof sourceEnterprise
  tone: 'source' | 'destination'
}) {
  return (
    <Card className={tone === 'source' ? 'border-amber-200 bg-amber-50/40 shadow-none' : 'border-emerald-200 bg-emerald-50/40 shadow-none'}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Badge className={tone === 'source' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}>{title}</Badge>
          <Building2 className={tone === 'source' ? 'size-5 text-amber-700' : 'size-5 text-emerald-700'} />
        </div>
        <h2 className="mt-5 text-lg font-black">{enterprise.name}</h2>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="size-3.5" /> {enterprise.district} / {enterprise.city}</div>
        <div className="mt-5 border-t border-slate-200/70 pt-4 font-mono text-xs font-bold text-slate-600">{enterprise.registrationNo}</div>
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className={`mt-1 text-sm font-bold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</div></div>
}

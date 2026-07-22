'use client'

import { ArrowLeft, BadgeCheck, CheckCircle2, Database, HeartHandshake, MapPin, Send, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoMunicipality, demoStrayAnimal } from '@/lib/municipality-demo-data'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

export default function AdoptionListingPage() {
  const listingPublished = useMunicipalityDemoStore(state => state.listingPublished)
  const publishListing = useMunicipalityDemoStore(state => state.publishListing)
  const [summary, setSummary] = useState(demoStrayAnimal.adoptionSummary)

  const publish = () => {
    publishListing()
    toast.success('Dost’un sahiplendirme ilanı yayımlandı')
  }

  if (listingPublished) {
    return <PublishedListing summary={summary} />
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/belediye/kisirlastirma" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-700"><ArrowLeft className="size-4" /> Kısırlaştırma kaydına dön</Link><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><HeartHandshake className="size-5" /></div><div><h1 className="text-2xl font-black tracking-tight">Sahiplendirme ilanı</h1><p className="mt-1 text-sm text-slate-500">Doğrulanmış kimlik ve sağlık kayıtlarından güvenilir ilan oluşturun.</p></div></div></div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800"><Database className="size-3" /> Mock yayın</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100"><CardTitle className="text-base">İlan bilgileri</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <Field label="İlan başlığı"><Input value="Dost sıcak bir yuva arıyor" readOnly /></Field>
            <Field label="Şehir / ilçe"><Input value="Ankara / Keçiören" readOnly /></Field>
            <Field label="Hayvan profili"><Input value={`${demoStrayAnimal.breed} · ${demoStrayAnimal.sex} · ${demoStrayAnimal.estimatedAge}`} readOnly /></Field>
            <Field label="Sağlık durumu"><Input value="Kontrollü · Kısırlaştırıldı" readOnly /></Field>
            <div className="space-y-2 sm:col-span-2"><Label>Tanıtım metni</Label><textarea value={summary} onChange={event => setSummary(event.target.value)} rows={5} className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20" /></div>
            <div className="sm:col-span-2"><Label>Karakter özellikleri</Label><div className="mt-2 flex flex-wrap gap-2">{demoStrayAnimal.temperament.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}</div></div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:justify-end"><Link href="/belediye" className={buttonVariants({ variant: 'outline', className: 'h-11 w-full sm:w-auto' })}>Taslağı kapat</Link><Button type="button" onClick={publish} disabled={summary.trim().length < 20} className="h-11 w-full bg-rose-700 hover:bg-rose-800 sm:w-auto"><Send className="size-4" /> İlanı yayımla</Button></div>
          </CardContent>
        </Card>
        <aside className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/70 shadow-none"><CardContent className="p-5"><ShieldCheck className="size-6 text-emerald-700" /><h2 className="mt-4 font-black text-emerald-950">Yayın kontrolleri</h2><ul className="mt-3 space-y-2 text-xs text-emerald-900/75"><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> HKN doğrulandı</li><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> Sağlık ön kontrolü kayıtlı</li><li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" /> Kısırlaştırma tamamlandı</li></ul></CardContent></Card>
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-5 text-slate-500">İlanda kişisel veri, kesin bulunma konumu veya belediye iç operasyon bilgisi paylaşılmaz.</p>
        </aside>
      </div>
    </main>
  )
}

function PublishedListing({ summary }: { summary: string }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><BadgeCheck className="size-5" /> İlan başarıyla yayımlandı</div><h1 className="mt-2 text-2xl font-black tracking-tight">Dost sıcak bir yuva arıyor</h1></div><Badge className="bg-emerald-100 text-emerald-800">Yayında · Demo</Badge></div>
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="grid md:grid-cols-[0.72fr_1fr]">
          <div className="flex min-h-80 items-center justify-center bg-gradient-to-br from-cyan-100 to-sky-50 text-8xl">🐕</div>
          <CardContent className="p-7 lg:p-9">
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{demoStrayAnimal.breed}</Badge><Badge variant="secondary">{demoStrayAnimal.sex}</Badge><Badge variant="secondary">{demoStrayAnimal.estimatedAge}</Badge></div>
            <h2 className="mt-5 text-3xl font-black">{demoStrayAnimal.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">{demoStrayAnimal.temperament.map(item => <Badge key={item} variant="outline">{item}</Badge>)}</div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="size-4" /> Kısırlaştırıldı</div></div><div className="rounded-xl bg-cyan-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><MapPin className="size-4" /> Keçiören / Ankara</div></div></div>
            <div className="mt-6 border-t border-slate-100 pt-5"><div className="text-xs font-bold text-slate-800">{demoMunicipality.name}</div><div className="mt-1 text-xs text-slate-500">{demoMunicipality.shelter} · Belediye sorumluluğunda</div></div>
          </CardContent>
        </div>
      </Card>
      <div className="mt-5 flex justify-end"><Link href="/belediye" className={buttonVariants({ className: 'bg-cyan-700 hover:bg-cyan-800' })}>Operasyon paneline dön</Link></div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

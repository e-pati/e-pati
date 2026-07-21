'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, HeartHandshake, HousePlus, Scissors } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useMunicipalityDemoStore } from '@/stores/municipality-demo.store'

const steps = [
  { href: '/belediye/barinak-giris', label: 'Barınak girişi', icon: HousePlus, state: 'admission' },
  { href: '/belediye/kisirlastirma', label: 'Kısırlaştırma', icon: Scissors, state: 'sterilization' },
  { href: '/belediye/sahiplendirme/yeni', label: 'Sahiplendirme ilanı', icon: HeartHandshake, state: 'listing' },
] as const

export function MunicipalityDemoSteps() {
  const pathname = usePathname()
  const { shelterAdmissionCompleted, sterilizationCompleted, listingPublished } = useMunicipalityDemoStore()

  const isComplete = (state: (typeof steps)[number]['state']) => {
    if (state === 'admission') return shelterAdmissionCompleted
    if (state === 'sterilization') return sterilizationCompleted
    return listingPublished
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1420px] grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-3 sm:px-6 lg:px-8">
        {steps.map((step, index) => {
          const active = pathname === step.href
          const complete = isComplete(step.state)

          return (
            <Link
              key={step.href}
              href={step.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                active
                  ? 'border-cyan-300 bg-cyan-50 text-cyan-950'
                  : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white',
              )}
            >
              <div className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                complete ? 'bg-cyan-700 text-white' : active ? 'bg-cyan-100 text-cyan-700' : 'bg-white text-slate-500',
              )}>
                {complete ? <Check className="size-4" /> : <step.icon className="size-4" />}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Adım {index + 1}</div>
                <div className="text-sm font-bold">{step.label}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

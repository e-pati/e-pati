'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Beef, Building2, Check, History, MoveRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLivestockDemoStore } from '@/stores/livestock-demo.store'

const steps = [
  { href: '/hayvancilik/isletmeler/yeni', label: 'İşletme kaydı', icon: Building2, state: 'enterprise' },
  { href: '/hayvancilik/hayvanlar/yeni', label: 'Küpe ile giriş', icon: Beef, state: 'animal' },
  { href: '/hayvancilik/hareket', label: 'İşletme hareketi', icon: MoveRight, state: 'movement' },
  { href: '/hayvancilik/hayvanlar/sarikiz', label: 'Olay geçmişi', icon: History, state: 'history' },
] as const

export function LivestockDemoSteps() {
  const pathname = usePathname()
  const { createdEnterprise, animalRegistered, movementCompleted } = useLivestockDemoStore()

  const isComplete = (state: (typeof steps)[number]['state']) => {
    if (state === 'enterprise') return Boolean(createdEnterprise)
    if (state === 'animal') return animalRegistered
    if (state === 'movement' || state === 'history') return movementCompleted
    return false
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-2 px-4 py-3 sm:px-6 lg:grid-cols-4 lg:px-8">
        {steps.map((step, index) => {
          const active = pathname === step.href
          const complete = isComplete(step.state)

          return (
            <Link
              key={step.href}
              href={step.href}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                active
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white',
              )}
            >
              <div className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                complete ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500',
              )}>
                {complete ? <Check className="size-4" /> : <step.icon className="size-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Adım {index + 1}</div>
                <div className="truncate text-xs font-bold sm:text-sm">{step.label}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

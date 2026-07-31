'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Menu } from 'lucide-react'

type MobileNavProps = {
  navigation: Array<{ label: string; href: string }>
}

/**
 * details/summary tabanlı mobil menü. JavaScript olmadan da açılıp kapanır;
 * bu bileşen yalnız Escape tuşu ve dışarı tıklama davranışını ekler.
 */
export function MobileNav({ navigation }: MobileNavProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const close = () => {
      if (detailsRef.current?.open) {
        detailsRef.current.open = false
      }
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const element = detailsRef.current
      if (element?.open && !element.contains(event.target as Node)) {
        close()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && detailsRef.current?.open) {
        close()
        // Odak, menüyü açan düğmeye geri döner.
        detailsRef.current.querySelector('summary')?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <details ref={detailsRef} className="group relative sm:hidden">
      <summary
        aria-label="Navigasyon menüsünü aç"
        className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-[#102a43] shadow-sm marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
      >
        <Menu className="size-5" />
      </summary>
      <div className="absolute right-0 top-14 w-[min(320px,calc(100vw-40px))] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
        <nav aria-label="Mobil navigasyon" className="grid">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0f766e]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-[#102a43]">
            Portal girişi
          </Link>
          <Link href="/demo-talep" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#102a43] text-xs font-semibold text-white">
            Demo talebi
          </Link>
        </div>
      </div>
    </details>
  )
}

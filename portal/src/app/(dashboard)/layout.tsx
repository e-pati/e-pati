'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Menu, PawPrint } from 'lucide-react'
import { SubscriptionBanner } from '@/components/shared/subscription-banner'
import { SubscriptionGuard } from '@/components/shared/subscription-guard'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F4F7F8]">
      {/* Mobil overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop her zaman görünür, mobilde drawer */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Ana içerik */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobil header — hamburger */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <PawPrint className="size-4" />
            </span>
            <span className="text-sm font-semibold text-slate-900">VetCep Klinik</span>
          </div>
        </div>
        <SubscriptionBanner />
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </main>
      </div>
    </AuthGuard>
  )
}

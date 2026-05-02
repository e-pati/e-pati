'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Menu, X } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
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
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-background sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-primary">e-Pati</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

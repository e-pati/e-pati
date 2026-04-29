'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="p-4 rounded-2xl bg-destructive/10 mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Sayfa yüklenemedi</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {error.message || 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.'}
      </p>
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  )
}

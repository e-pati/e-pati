import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-background">
      <div className="p-5 rounded-3xl bg-primary/10 mb-6">
        <PawPrint className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-3">Sayfa bulunamadı</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link href="/dashboard">
        <Button>Panoya Dön</Button>
      </Link>
    </div>
  )
}

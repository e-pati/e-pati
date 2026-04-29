'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onChange }: Props) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        {from}–{to} / {total} kayıt
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Önceki
        </Button>
        <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page === totalPages} className="gap-1">
          Sonraki <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

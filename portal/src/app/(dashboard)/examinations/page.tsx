'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useExaminations } from '@/hooks/use-examinations'
import { usePets } from '@/hooks/use-pets'
import { mockExaminations, mockPets } from '@/lib/mock-data'
import { formatDate, speciesEmoji } from '@/lib/utils'
import { Search, Stethoscope, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function ExaminationsPage() {
  return <Suspense><ExaminationsContent /></Suspense>
}

function ExaminationsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const examinationsQuery = useExaminations({ limit: 200 })
  const petsQuery = usePets()

  const examinations = examinationsQuery.data ?? (
    examinationsQuery.isError
      ? mockExaminations.map(e => ({
          id: e.id, petId: e.petId, complaint: e.complaint,
          findings: e.findings, assessment: e.assessment, plan: e.plan,
          createdAt: e.date, followUpDate: e.followUpDate,
        }))
      : []
  )

  const pets = petsQuery.data ?? mockPets.map(p => ({
    id: p.id, ownerId: p.ownerId, name: p.name, species: p.species,
    breed: p.breed ?? '', sex: p.gender, createdAt: p.createdAt,
    owner: { id: p.ownerId, fullName: `${p.owner.firstName} ${p.owner.lastName}`, email: p.owner.email },
  }) as any)

  const enriched = useMemo(() => examinations.map(e => ({
    ...e,
    pet: pets.find(p => p.id === e.petId),
    dateStr: e.createdAt ?? '',
  })).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()),
  [examinations, pets])

  const filtered = useMemo(() => {
    if (!query) return enriched
    const q = query.toLowerCase()
    return enriched.filter(e =>
      e.pet?.name?.toLowerCase().includes(q) ||
      e.pet?.owner?.fullName?.toLowerCase().includes(q) ||
      e.complaint.toLowerCase().includes(q) ||
      e.assessment.toLowerCase().includes(q)
    )
  }, [enriched, query])

  const isLoading = examinationsQuery.isLoading || petsQuery.isLoading

  return (
    <div>
      <Header
        title="Muayeneler"
        subtitle={isLoading ? 'Yükleniyor...' : `${enriched.length} kayıt`}
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <div className="p-6 space-y-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Hasta, sahip veya tanı ara..."
            className="pl-9"
          />
        </div>

        {examinationsQuery.isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            API bağlantısı kurulamadı — örnek veriler gösteriliyor.
          </div>
        )}

        {query && !isLoading && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> sonuç
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <Stethoscope className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Muayene bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(exam => (
              <Link key={exam.id} href={`/patients/${exam.petId}`}>
                <Card className="border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-start gap-4">
                    {/* Pet avatar */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {speciesEmoji((exam.pet?.species?.toLowerCase() ?? 'other') as any)}
                    </div>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {exam.pet?.name ?? 'Hasta bilgisi yok'}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {exam.pet?.owner?.fullName ?? '—'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{exam.complaint}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        <span className="font-medium text-foreground/60">Tanı:</span> {exam.assessment}
                      </p>
                    </div>

                    {/* Tarih + takip */}
                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                        <Calendar className="w-3 h-3" />
                        {exam.dateStr ? formatDate(exam.dateStr) : '—'}
                      </div>
                      {exam.followUpDate && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 bg-amber-50">
                          Takip: {formatDate(exam.followUpDate)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

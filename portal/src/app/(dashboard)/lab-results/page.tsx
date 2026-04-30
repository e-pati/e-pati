'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { useState, useMemo, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLabResults } from '@/hooks/use-lab-results'
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { mockLabResults } from '@/lib/mock-data'
import { formatDate, speciesEmoji } from '@/lib/utils'
import { Search, FlaskConical, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { labResultsService } from '@/services/lab-results.service'
import { Pagination } from '@/components/shared/pagination'

const PAGE_SIZE = 15

export default function LabResultsPage() {
  return <Suspense><LabResultsContent /></Suspense>
}

function LabResultsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query)
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [debouncedQuery]) // eslint-disable-line

  const labQuery = useLabResults()
  const petsQuery = useAllClinicPatients()

  const labResults = labQuery.data ?? (
    labQuery.isError
      ? mockLabResults.map(l => ({
          id: l.id, petId: l.petId, testType: l.testType,
          comment: l.comment, createdAt: l.date, fileUrl: l.fileUrl,
        }))
      : []
  )

  const pets = petsQuery.data?.items ?? []

  const enriched = useMemo(() => labResults.map(l => ({
    ...l,
    pet: pets.find(p => p.id === l.petId),
    dateStr: l.createdAt ?? '',
  })).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()),
  [labResults, pets])

  const filtered = useMemo(() => {
    if (!debouncedQuery) return enriched
    const q = debouncedQuery.toLowerCase()
    return enriched.filter(l =>
      l.pet?.name?.toLowerCase().includes(q) ||
      l.pet?.owner?.fullName?.toLowerCase().includes(q) ||
      l.testType.toLowerCase().includes(q) ||
      l.comment?.toLowerCase().includes(q)
    )
  }, [enriched, debouncedQuery])

  const isLoading = labQuery.isLoading || petsQuery.isLoading
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <Header
        title="Lab Sonuçları"
        subtitle={isLoading ? 'Yükleniyor...' : `${enriched.length} kayıt`}
      />

      <div className="p-6 space-y-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Hasta, test türü ara..."
            className="pl-9"
          />
        </div>

        {labQuery.isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            API bağlantısı kurulamadı — örnek veriler gösteriliyor.
          </div>
        )}

        {debouncedQuery && !isLoading && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> sonuç
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <FlaskConical className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Lab sonucu bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map(lab => (
              <Card key={lab.id} className="border-border/50 hover:shadow-sm transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* İkon */}
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-5 h-5 text-rose-500" />
                  </div>

                  {/* Hasta */}
                  <div className="w-36 flex-shrink-0">
                    {lab.pet ? (
                      <Link href={`/patients/${lab.pet.id}`} className="flex items-center gap-1.5 group">
                        <span>{speciesEmoji((lab.pet.species?.toLowerCase() ?? 'other') as import('@/types').PetSpecies)}</span>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {lab.pet.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {lab.pet.owner?.fullName ?? '—'}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">Hasta bilgisi yok</span>
                    )}
                  </div>

                  {/* Test bilgisi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{lab.testType}</span>
                    </div>
                    {lab.comment && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{lab.comment}</p>
                    )}
                  </div>

                  {/* Tarih + dosya */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {lab.dateStr ? formatDate(lab.dateStr) : '—'}
                    </div>
                    {lab.fileUrl ? (
                      <a
                        href={labResultsService.getFileUrl(lab.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Download className="w-3 h-3" />
                          Dosya
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <FileText className="w-3 h-3" /> Dosya yok
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}

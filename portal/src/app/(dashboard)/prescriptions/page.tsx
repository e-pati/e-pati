'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { useState, useMemo, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrescriptions } from '@/hooks/use-prescriptions'
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { prescriptionsService, type ApiMedication } from '@/services/prescriptions.service'
import { formatDate, speciesEmoji } from '@/lib/utils'
import { Search, Pill, Download } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '@/components/shared/pagination'

const PAGE_SIZE = 15

export default function PrescriptionsPage() {
  return <Suspense><PrescriptionsContent /></Suspense>
}

function PrescriptionsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query)
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [debouncedQuery]) // eslint-disable-line

  const prescriptionsQuery = usePrescriptions()
  const petsQuery = useAllClinicPatients()

  const prescriptions = useMemo(() => prescriptionsQuery.data ?? [], [prescriptionsQuery.data])
  const pets = useMemo(() => petsQuery.data?.items ?? [], [petsQuery.data?.items])

  const enriched = useMemo(() => prescriptions.map(rx => ({
    ...rx,
    pet: pets.find(p => p.id === rx.petId),
    dateStr: rx.createdAt ?? '',
  })).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()),
  [prescriptions, pets])

  const filtered = useMemo(() => {
    if (!debouncedQuery) return enriched
    const q = debouncedQuery.toLowerCase()
    return enriched.filter(rx =>
      rx.pet?.name?.toLowerCase().includes(q) ||
      rx.pet?.owner?.fullName?.toLowerCase().includes(q) ||
      rx.medications?.some(m => m.name?.toLowerCase().includes(q))
    )
  }, [enriched, debouncedQuery])

  const isLoading = prescriptionsQuery.isLoading || petsQuery.isLoading
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <Header
        title="Reçeteler"
        subtitle={isLoading ? 'Yükleniyor...' : `${enriched.length} kayıt`}
      />

      <div className="p-6 space-y-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Hasta, sahip veya ilaç ara..."
            className="pl-9"
          />
        </div>

        {prescriptionsQuery.isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Reçete kayıtları alınamadı. Lütfen API bağlantısını kontrol edip tekrar deneyin.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <Pill className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Reçete bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map(rx => (
              <Card key={rx.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-all rounded-2xl">
                <CardContent className="p-4 flex items-start gap-4">
                  {/* İkon */}
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 text-violet-500" />
                  </div>

                  {/* Hasta */}
                  <div className="w-36 flex-shrink-0">
                    {rx.pet ? (
                      <Link href={`/patients/${rx.pet.id}`} className="group">
                        <div className="flex items-center gap-1.5">
                          <span>{speciesEmoji((rx.pet.species?.toLowerCase() ?? 'other') as import('@/types').PetSpecies)}</span>
                          <div>
                            <div className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                              {rx.pet.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {rx.pet.owner?.fullName ?? '—'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">Hasta bilgisi yok</span>
                    )}
                  </div>

                  {/* İlaçlar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {rx.medications?.slice(0, 3).map((med: ApiMedication, i: number) => (
                        <span key={i} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5">
                          {med.name} {med.dose}
                        </span>
                      ))}
                      {rx.medications?.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{rx.medications.length - 3} ilaç daha</span>
                      )}
                    </div>
                    {rx.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 truncate">{rx.notes}</p>
                    )}
                  </div>

                  {/* Tarih + PDF */}
                  <div className="text-right flex-shrink-0 space-y-1.5">
                    <div className="text-xs text-muted-foreground">
                      {rx.dateStr ? formatDate(rx.dateStr) : '—'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => window.open(prescriptionsService.getPdfUrl(rx.id), '_blank', 'noreferrer')}
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
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

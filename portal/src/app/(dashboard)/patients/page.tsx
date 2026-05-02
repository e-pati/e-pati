'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useClinicPatients } from '@/hooks/use-clinic'
import { formatDate, calculateAge, speciesEmoji, speciesLabel } from '@/lib/utils'
import type { PetSpecies } from '@/types'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const PAGE_SIZE = 12

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsContent />
    </Suspense>
  )
}

function PatientsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query)
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [page, setPage] = useState(1)

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setPage(1)
  }

  const handleSpeciesChange = (v: string | null) => {
    setSpeciesFilter(v ?? 'all')
    setPage(1)
  }

  const { data, isLoading, isFetching } = useClinicPatients({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    species: speciesFilter === 'all' ? undefined : speciesFilter,
  })

  const pets = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <Header
        title="Hastalar"
        subtitle={isLoading ? 'Yükleniyor...' : `${total} kayıtlı hasta`}
        action={{ label: 'Yeni Hasta', href: '/patients/new' }}
      />

      <div className="p-6 space-y-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={handleQueryChange}
              placeholder="Ad, sahip, mikro çip no..."
              className="pl-9 rounded-full bg-gray-50 border-gray-100 focus-visible:bg-white focus-visible:border-primary/30"
            />
          </div>
          <Select value={speciesFilter} onValueChange={handleSpeciesChange}>
            <SelectTrigger className="w-40 gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="Dog">🐕 Köpek</SelectItem>
              <SelectItem value="Cat">🐈 Kedi</SelectItem>
              <SelectItem value="Bird">🐦 Kuş</SelectItem>
              <SelectItem value="Rabbit">🐇 Tavşan</SelectItem>
              <SelectItem value="Other">🐾 Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {debouncedQuery && !isLoading && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{total}</span> sonuç bulundu
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {total === 0 && !debouncedQuery ? (
              <>
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl mb-6">🐾</div>
                <p className="text-xl font-semibold text-foreground mb-2">Henüz hasta kaydı yok</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Hayvan sahipleri VetCep mobil uygulamasından kayıt olduğunda hastalar burada görünür.
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-medium text-foreground">Hasta bulunamadı</p>
                <p className="text-sm text-muted-foreground mt-1">Farklı bir arama deneyin</p>
              </>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            {pets.map(pet => {
              const species = pet.species.toLowerCase() as PetSpecies
              const ownerName = pet.owner?.fullName ?? '—'
              return (
                <Link href={`/patients/${pet.id}`} key={pet.id}>
                  <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                          {pet.photoUrl
                            ? <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                            : speciesEmoji(species)
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground text-base leading-tight">{pet.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{pet.breed ?? '—'}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] flex-shrink-0 bg-primary/10 text-primary border-0">
                              {speciesLabel(species)}
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">Sahip:</span>
                              {ownerName}
                            </div>
                            {pet.birthDate && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/70">Yaş:</span>
                                {calculateAge(pet.birthDate)}
                              </div>
                            )}
                            {pet.microchipNo && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/70">Çip:</span>
                                <span className="font-mono text-[10px]">{pet.microchipNo}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                            Kayıt: {formatDate(pet.createdAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} hasta
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className="gap-1"
              >
                Sonraki
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

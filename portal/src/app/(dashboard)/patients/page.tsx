'use client'

import { useState, useMemo, Suspense } from 'react'
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
import { usePets } from '@/hooks/use-pets'
import { mockPets } from '@/lib/mock-data'
import { formatDate, calculateAge, speciesEmoji, speciesLabel } from '@/lib/utils'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ApiPet } from '@/services/pets.service'

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
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: apiPets, isLoading, isError } = usePets()

  // API'den veri gelmezse mock data göster
  const pets = apiPets ?? mockPets.map(p => ({
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    species: p.species,
    breed: p.breed ?? '',
    sex: p.gender,
    birthDate: p.birthDate,
    microchipNo: p.microchipNo,
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
    owner: {
      id: p.ownerId,
      fullName: `${p.owner.firstName} ${p.owner.lastName}`,
      email: p.owner.email,
      phone: p.owner.phone,
    },
  } as ApiPet))

  const filtered = useMemo(() => {
    return pets.filter(pet => {
      const q = query.toLowerCase()
      const ownerName = pet.owner?.fullName?.toLowerCase() ?? ''
      const matchQuery = !q ||
        pet.name.toLowerCase().includes(q) ||
        ownerName.includes(q) ||
        pet.microchipNo?.includes(q) ||
        (pet.breed?.toLowerCase() ?? '').includes(q)
      const matchSpecies = speciesFilter === 'all' || pet.species.toLowerCase() === speciesFilter
      return matchQuery && matchSpecies
    })
  }, [pets, query, speciesFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <Header
        title="Hastalar"
        subtitle={isLoading ? 'Yükleniyor...' : `${pets.length} kayıtlı hasta`}
        action={{ label: 'Yeni Hasta', href: '/patients/new' }}
      />

      <div className="p-6 space-y-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ad, sahip, mikro çip no..."
              className="pl-9"
            />
          </div>
          <Select value={speciesFilter} onValueChange={v => setSpeciesFilter(v ?? 'all')}>
            <SelectTrigger className="w-40 gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="dog">🐕 Köpek</SelectItem>
              <SelectItem value="cat">🐈 Kedi</SelectItem>
              <SelectItem value="bird">🐦 Kuş</SelectItem>
              <SelectItem value="rabbit">🐇 Tavşan</SelectItem>
              <SelectItem value="other">🐾 Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query && !isLoading && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> sonuç bulundu
          </p>
        )}

        {isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            API bağlantısı kurulamadı — örnek veriler gösteriliyor.
          </div>
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-foreground">Hasta bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map(pet => {
              const species = pet.species.toLowerCase()
              const ownerName = pet.owner?.fullName ?? '—'
              return (
                <Link href={`/patients/${pet.id}`} key={pet.id}>
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
                          {speciesEmoji(species as any)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground text-base leading-tight">{pet.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{pet.breed ?? '—'}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] flex-shrink-0 bg-primary/10 text-primary border-0">
                              {speciesLabel(species as any)}
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

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} hasta
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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

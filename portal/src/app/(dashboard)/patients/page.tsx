'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { mockPets } from '@/lib/mock-data'
import { formatDate, calculateAge, speciesEmoji, speciesLabel } from '@/lib/utils'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { PetSpecies } from '@/types'
import Link from 'next/link'

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
  const [speciesFilter, setSpeciesFilter] = useState<PetSpecies | 'all'>('all')

  const filtered = useMemo(() => {
    return mockPets.filter(pet => {
      const q = query.toLowerCase()
      const matchQuery = !q ||
        pet.name.toLowerCase().includes(q) ||
        pet.owner.firstName.toLowerCase().includes(q) ||
        pet.owner.lastName.toLowerCase().includes(q) ||
        pet.microchipNo?.includes(q) ||
        pet.breed.toLowerCase().includes(q)
      const matchSpecies = speciesFilter === 'all' || pet.species === speciesFilter
      return matchQuery && matchSpecies
    })
  }, [query, speciesFilter])

  return (
    <div>
      <Header title="Hastalar" subtitle={`${mockPets.length} kayıtlı hasta`} action={{ label: 'Yeni Hasta', href: '/patients/new' }} />

      <div className="p-6 space-y-5">
        {/* Filtreler */}
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
          <Select value={speciesFilter} onValueChange={v => setSpeciesFilter(v as PetSpecies | 'all')}>
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

        {/* Sonuç sayısı */}
        {query && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> sonuç bulundu
          </p>
        )}

        {/* Hasta kartları */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-foreground">Hasta bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(pet => (
              <Link href={`/patients/${pet.id}`} key={pet.id}>
                <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
                        {speciesEmoji(pet.species)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground text-base leading-tight">{pet.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{pet.breed}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0 bg-primary/10 text-primary border-0">
                            {speciesLabel(pet.species)}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">Sahip:</span>
                            {pet.owner.firstName} {pet.owner.lastName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">Yaş:</span>
                            {calculateAge(pet.birthDate)}
                          </div>
                          {pet.weight && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">Ağırlık:</span>
                              {pet.weight} kg
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useVaccinations, useUpcomingVaccinations } from '@/hooks/use-vaccinations'
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { mockVaccinations } from '@/lib/mock-data'
import { formatDateShort, isVaccinationOverdue, isVaccinationDueSoon, speciesEmoji } from '@/lib/utils'
import { AlertTriangle, Clock, CheckCircle2, Syringe, Filter } from 'lucide-react'
import type { PetSpecies } from '@/types'
import Link from 'next/link'
import type { ApiVaccination } from '@/services/vaccinations.service'
import { Pagination } from '@/components/shared/pagination'

const PAGE_SIZE = 15

type FilterMode = 'all' | 'overdue' | 'upcoming'

export default function VaccinationsPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [filter]) // eslint-disable-line

  const vaccinationsQuery = useVaccinations()
  const petsQuery = useAllClinicPatients()

  const vaccinations: ApiVaccination[] = vaccinationsQuery.data ?? (
    vaccinationsQuery.isError
      ? mockVaccinations.map(v => ({
          id: v.id, petId: v.petId, name: v.vaccineName,
          appliedAt: v.appliedDate, dueAt: v.nextDate,
          notes: v.manufacturer,
        }))
      : []
  )

  const pets = petsQuery.data?.items ?? []

  const enriched = useMemo(() => vaccinations.map(v => {
    const dueAt = v.dueAt ?? v.appliedAt
    const pet = pets.find(p => p.id === v.petId)
    return {
      ...v,
      dueAt,
      pet,
      overdue: isVaccinationOverdue(dueAt),
      soon: isVaccinationDueSoon(dueAt, 30),
    }
  }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
  [vaccinations, pets])

  const filtered = enriched.filter(v => {
    if (filter === 'overdue') return v.overdue
    if (filter === 'upcoming') return v.soon && !v.overdue
    return true
  })

  const overdueCount = enriched.filter(v => v.overdue).length
  const upcomingCount = enriched.filter(v => v.soon && !v.overdue).length

  const isLoading = vaccinationsQuery.isLoading
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <Header title="Aşılar" subtitle={`${enriched.length} kayıt`} />

      <div className="p-6 space-y-5">
        {/* Özet kartları */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Gecikmiş', value: overdueCount, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: AlertTriangle, mode: 'overdue' as FilterMode },
            { label: 'Yaklaşan (30 gün)', value: upcomingCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, mode: 'upcoming' as FilterMode },
            { label: 'Toplam', value: enriched.length, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: Syringe, mode: 'all' as FilterMode },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setFilter(s.mode)}
              className={`text-left p-4 rounded-xl border transition-all ${s.bg} ${s.border} ${filter === s.mode ? 'ring-2 ring-offset-1 ring-primary/40' : 'hover:opacity-80'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </button>
          ))}
        </div>

        {/* Filtre butonları */}
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Tümü' },
            { key: 'overdue', label: `Gecikmiş (${overdueCount})` },
            { key: 'upcoming', label: `Yaklaşan (${upcomingCount})` },
          ] as const).map(f => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {vaccinationsQuery.isError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            API bağlantısı kurulamadı — örnek veriler gösteriliyor.
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
            <p className="text-lg font-medium">
              {filter === 'overdue' ? 'Gecikmiş aşı yok' : filter === 'upcoming' ? 'Yaklaşan aşı yok' : 'Henüz aşı kaydı yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map(v => (
              <Card key={v.id} className={`border-border/50 transition-colors ${v.overdue ? 'border-destructive/30 bg-destructive/[0.02]' : v.soon ? 'border-amber-300/50 bg-amber-50/30' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Durum ikonu */}
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${v.overdue ? 'bg-destructive/10' : v.soon ? 'bg-amber-100' : 'bg-primary/10'}`}>
                    {v.overdue
                      ? <AlertTriangle className="w-4 h-4 text-destructive" />
                      : v.soon
                        ? <Clock className="w-4 h-4 text-amber-600" />
                        : <CheckCircle2 className="w-4 h-4 text-primary" />
                    }
                  </div>

                  {/* Hasta */}
                  <div className="flex items-center gap-2 w-36 flex-shrink-0">
                    <span className="text-xl">{speciesEmoji((v.pet?.species?.toLowerCase() ?? 'other') as PetSpecies)}</span>
                    <div className="min-w-0">
                      {v.pet ? (
                        <Link href={`/patients/${v.pet.id}`} className="text-sm font-medium text-foreground hover:text-primary truncate block">
                          {v.pet.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Hasta bilgisi yok</span>
                      )}
                      <div className="text-xs text-muted-foreground truncate">
                        {v.pet?.owner?.fullName ?? '—'}
                      </div>
                    </div>
                  </div>

                  {/* Aşı adı */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{v.name}</div>
                    {v.notes && <div className="text-xs text-muted-foreground mt-0.5">{v.notes}</div>}
                    {v.lotNumber && <div className="text-xs text-muted-foreground">Lot: {v.lotNumber}</div>}
                  </div>

                  {/* Tarihler */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground">Uygulandı</div>
                    <div className="text-sm font-medium">{formatDateShort(v.appliedAt)}</div>
                    {v.dueAt && (
                      <div className={`text-xs font-medium mt-1 ${v.overdue ? 'text-destructive' : v.soon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {v.overdue ? '⚠️ ' : v.soon ? '⏰ ' : ''}
                        Sonraki: {formatDateShort(v.dueAt)}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 text-[10px] ${v.overdue ? 'border-destructive/40 text-destructive bg-destructive/5' : v.soon ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-primary/20 text-primary bg-primary/5'}`}
                  >
                    {v.overdue ? 'Gecikmiş' : v.soon ? 'Yaklaşan' : 'Güncel'}
                  </Badge>
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

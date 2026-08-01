'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClinicPatients } from '@/hooks/use-clinic'
import { useDebounce } from '@/hooks/use-debounce'
import { calculateAge, formatDate, speciesLabel } from '@/lib/utils'
import type { PetSpecies } from '@/types'

const PAGE_SIZE = 12

const SPECIES_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tüm türler' },
  { value: 'Dog', label: 'Köpek' },
  { value: 'Cat', label: 'Kedi' },
  { value: 'Bird', label: 'Kuş' },
  { value: 'Rabbit', label: 'Tavşan' },
  { value: 'Other', label: 'Diğer' },
]

function normalizeSpecies(value: string): PetSpecies {
  const normalized = value.toLocaleLowerCase('tr-TR')
  return ['dog', 'cat', 'bird', 'rabbit'].includes(normalized)
    ? normalized as PetSpecies
    : 'other'
}

function sexLabel(value: string): string {
  const normalized = value.toLocaleLowerCase('tr-TR')
  if (['male', 'erkek'].includes(normalized)) return 'Erkek'
  if (['female', 'dişi', 'disi'].includes(normalized)) return 'Dişi'
  return 'Belirtilmemiş'
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<PatientsPageFallback />}>
      <PatientsContent />
    </Suspense>
  )
}

function PatientsPageFallback() {
  return (
    <div className="min-h-full">
      <Header title="Hastalar" subtitle="Klinik hasta kayıtları" action={{ label: 'Yeni Hasta', href: '/patients/new' }} />
      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </main>
    </div>
  )
}

function PatientsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query)
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [page, setPage] = useState(1)

  const patientsQuery = useClinicPatients({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    species: speciesFilter === 'all' ? undefined : speciesFilter,
  })

  const pets = patientsQuery.data?.items ?? []
  const total = patientsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasActiveFilters = Boolean(debouncedQuery) || speciesFilter !== 'all'
  const firstRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastRecord = Math.min(page * PAGE_SIZE, total)

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setPage(1)
  }

  const handleSpeciesChange = (value: string | null) => {
    setSpeciesFilter(value ?? 'all')
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setSpeciesFilter('all')
    setPage(1)
  }

  return (
    <div data-testid="patients-page" className="min-h-full">
      <Header
        title="Hastalar"
        subtitle="Klinik hasta kayıtları"
        action={{ label: 'Yeni Hasta', href: '/patients/new' }}
      />

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <UsersRound className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Hasta kayıtları</h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Hasta kimliği, sahip bilgisi ve temel sağlık verilerini düzenli bir çalışma listesinden yönetin.
                </p>
              </div>
            </div>

            <div className="flex min-w-40 items-center justify-between gap-5 border-t border-slate-100 pt-4 sm:justify-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="text-xs font-medium text-slate-500">Kayıtlı hasta</p>
              {patientsQuery.isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : patientsQuery.isError ? (
                <p className="text-2xl font-semibold text-slate-400">—</p>
              ) : (
                <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 tabular-nums">{total.toLocaleString('tr-TR')}</p>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Hasta arama ve filtreleme" className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Hasta ara"
                value={query}
                onChange={handleQueryChange}
                placeholder="Hasta adı, sahip adı veya mikroçip numarası"
                className="h-11 rounded-lg border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm focus-visible:bg-white"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Aramayı temizle"
                  onClick={() => { setQuery(''); setPage(1) }}
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Select value={speciesFilter} onValueChange={handleSpeciesChange}>
              <SelectTrigger aria-label="Türe göre filtrele" className="h-11 w-full gap-2 rounded-lg border-slate-200 bg-white px-3 lg:w-48">
                <SlidersHorizontal className="size-4 text-slate-400" />
                <SelectValue placeholder="Tür seçin">
                  {SPECIES_OPTIONS.find(option => option.value === speciesFilter)?.label ?? 'Tüm türler'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {SPECIES_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-11 justify-center rounded-xl px-4 text-xs text-slate-600 lg:justify-start">
                Filtreleri temizle
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p aria-live="polite">
              {patientsQuery.isLoading
                ? 'Hasta kayıtları getiriliyor'
                : patientsQuery.isError
                  ? 'Kayıt sayısı alınamadı'
                  : hasActiveFilters
                    ? `${total.toLocaleString('tr-TR')} eşleşen kayıt`
                    : `${total.toLocaleString('tr-TR')} toplam kayıt`}
            </p>
            {patientsQuery.isFetching && !patientsQuery.isLoading && (
              <span className="inline-flex items-center gap-2 text-slate-400">
                <RefreshCw className="size-3 animate-spin" /> Liste güncelleniyor
              </span>
            )}
          </div>
        </section>

        {patientsQuery.isError ? (
          <section role="alert" className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-amber-950">Hasta kayıtları alınamadı</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-amber-800">
              Klinik kayıt servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.
            </p>
            <Button variant="outline" onClick={() => patientsQuery.refetch()} className="mt-5 h-11 gap-2 rounded-xl border-amber-300 bg-white px-4 text-amber-900 hover:bg-amber-100">
              <RefreshCw className="size-4" /> Yeniden dene
            </Button>
          </section>
        ) : patientsQuery.isLoading ? (
          <PatientsListSkeleton />
        ) : pets.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              {hasActiveFilters ? <Search className="size-6" /> : <PawPrint className="size-6" />}
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">
              {hasActiveFilters ? 'Eşleşen hasta kaydı bulunamadı' : 'Henüz hasta kaydı yok'}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {hasActiveFilters
                ? 'Arama ifadenizi veya tür filtresini değiştirerek yeniden deneyin.'
                : 'Kliniğe eklenen ilk hasta, sahip ve kimlik bilgileriyle birlikte burada görünecek.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters} className="mt-5 h-11 rounded-xl px-4">Filtreleri temizle</Button>
            ) : (
              <Link href="/patients/new" className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                İlk hastayı ekle
              </Link>
            )}
          </section>
        ) : (
          <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-opacity ${patientsQuery.isFetching ? 'opacity-60' : 'opacity-100'}`}>
            <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(180px,1fr)_minmax(150px,0.8fr)_140px_36px] items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:grid">
              <span>Hasta</span>
              <span>Sahip</span>
              <span>Kimlik</span>
              <span>Kayıt tarihi</span>
              <span className="sr-only">Detay</span>
            </div>

            <div className="divide-y divide-slate-100">
              {pets.map(pet => {
                const species = normalizeSpecies(pet.species)
                return (
                  <Link
                    href={`/patients/${pet.id}`}
                    key={pet.id}
                    aria-label={`${pet.name} hasta kaydını görüntüle`}
                    className="group grid min-h-[112px] gap-4 px-4 py-5 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 sm:px-5 lg:min-h-[88px] lg:grid-cols-[minmax(220px,1.35fr)_minmax(180px,1fr)_minmax(150px,0.8fr)_140px_36px] lg:items-center lg:px-6 lg:py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-2xl ring-1 ring-slate-200/80 transition group-hover:ring-slate-300">
                        <PatientAvatar name={pet.name} photoUrl={pet.photoUrl} species={species} size={48} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{pet.name}</h3>
                          <Badge variant="secondary" className="h-5 border-0 bg-slate-100 px-2 text-[10px] font-medium text-slate-600 shadow-none">
                            {speciesLabel(species)}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {pet.breed || 'Irk bilgisi yok'} · {sexLabel(pet.sex)}{pet.birthDate ? ` · ${calculateAge(pet.birthDate)}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-2 text-xs lg:block">
                      <span className="font-medium text-slate-400 lg:hidden">Sahip</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-700">{pet.owner?.fullName || 'Sahip bilgisi yok'}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">{pet.owner?.phone || pet.owner?.email || 'İletişim bilgisi yok'}</p>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-2 text-xs lg:block">
                      <span className="font-medium text-slate-400 lg:hidden">Kimlik</span>
                      {pet.microchipNo ? (
                        <span className="truncate font-mono text-[11px] font-medium text-slate-600">{pet.microchipNo}</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Mikroçip kaydı yok</span>
                      )}
                    </div>

                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 text-xs lg:block">
                      <span className="font-medium text-slate-400 lg:hidden">Kayıt</span>
                      <span className="text-slate-500">{formatDate(pet.createdAt)}</span>
                    </div>

                    <div className="hidden size-9 items-center justify-center justify-self-end rounded-xl text-slate-300 transition group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm lg:flex">
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {!patientsQuery.isLoading && !patientsQuery.isError && totalPages > 1 && (
          <nav aria-label="Hasta listesi sayfalama" className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 tabular-nums">{firstRecord}–{lastRecord}</span> arası gösteriliyor · {total.toLocaleString('tr-TR')} hasta
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
              <Button
                variant="outline"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={page === 1 || patientsQuery.isFetching}
                className="h-11 justify-center gap-1.5 rounded-xl px-3 text-xs"
              >
                <ChevronLeft className="size-4" /> Önceki
              </Button>
              <span className="min-w-16 text-center text-xs font-medium text-slate-500 tabular-nums">{page} / {totalPages}</span>
              <Button
                variant="outline"
                onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                disabled={page === totalPages || patientsQuery.isFetching}
                className="h-11 justify-center gap-1.5 rounded-xl px-3 text-xs"
              >
                Sonraki <ChevronRight className="size-4" />
              </Button>
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}

function PatientsListSkeleton() {
  return (
    <section aria-label="Hasta kayıtları yükleniyor" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(180px,1fr)_minmax(150px,0.8fr)_140px_36px] gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-3 lg:grid">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-3 w-20" />)}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex min-h-[96px] items-center gap-4 px-4 py-4 sm:px-6">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
            <Skeleton className="hidden h-4 w-32 lg:block" />
            <Skeleton className="hidden h-4 w-28 lg:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

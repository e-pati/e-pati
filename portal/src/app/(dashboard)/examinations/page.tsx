'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  PawPrint,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Pagination } from '@/components/shared/pagination'
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
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { useDebounce } from '@/hooks/use-debounce'
import { useExaminations } from '@/hooks/use-examinations'
import { cn, formatDate, speciesLabel } from '@/lib/utils'
import type { ClinicPatient } from '@/services/clinics.service'
import type { ApiExamination } from '@/services/examinations.service'
import type { PetSpecies } from '@/types'

const PAGE_SIZE = 12

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tüm tarihler' },
  { value: '7', label: 'Son 7 gün' },
  { value: '30', label: 'Son 30 gün' },
] as const

type EnrichedExamination = ApiExamination & { pet?: ClinicPatient }

export default function ExaminationsPage() {
  return (
    <Suspense fallback={<ExaminationsPageFallback />}>
      <ExaminationsContent />
    </Suspense>
  )
}

function ExaminationsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query)
  const [patientFilter, setPatientFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [page, setPage] = useState(1)
  const examinationsQuery = useExaminations({ limit: 200 })
  const patientsQuery = useAllClinicPatients()

  const examinations = useMemo(() => examinationsQuery.data ?? [], [examinationsQuery.data])
  const patients = useMemo(() => patientsQuery.data?.items ?? [], [patientsQuery.data?.items])
  const patientMap = useMemo(() => new Map(patients.map(patient => [patient.id, patient])), [patients])

  const enriched = useMemo<EnrichedExamination[]>(() => examinations
    .map(examination => ({
      ...examination,
      pet: patientMap.get(examination.petId),
    }))
    .sort((a, b) => examinationTimestamp(b) - examinationTimestamp(a)),
  [examinations, patientMap])

  const filtered = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase('tr-TR')

    return enriched.filter(examination => {
      const matchesPatient = patientFilter === 'all' || examination.petId === patientFilter
      const matchesPeriod = isInPeriod(examination.createdAt ?? examination.date, periodFilter)
      const matchesSearch = !normalizedQuery || [
        examination.pet?.name,
        examination.pet?.owner?.fullName,
        examination.complaint,
        examination.assessment,
        veterinarianName(examination),
      ]
        .filter(Boolean)
        .some(value => value?.toLocaleLowerCase('tr-TR').includes(normalizedQuery))

      return matchesPatient && matchesPeriod && matchesSearch
    })
  }, [debouncedQuery, enriched, patientFilter, periodFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const activePage = Math.min(page, totalPages)
  const paginated = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)
  const isLoading = examinationsQuery.isLoading || patientsQuery.isLoading
  const hasActiveFilters = Boolean(debouncedQuery) || patientFilter !== 'all' || periodFilter !== 'all'
  const lastSevenDays = examinations.filter(examination => isInPeriod(examination.createdAt ?? examination.date, '7')).length
  const upcomingFollowUps = examinations.filter(examination => isUpcoming(examination.followUpDate)).length

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setPage(1)
  }

  const handlePatientChange = (value: string | null) => {
    setPatientFilter(value ?? 'all')
    setPage(1)
  }

  const handlePeriodChange = (value: string | null) => {
    setPeriodFilter(value ?? 'all')
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setPatientFilter('all')
    setPeriodFilter('all')
    setPage(1)
  }

  return (
    <div data-testid="examinations-page" className="min-h-full">
      <Header
        title="Muayeneler"
        subtitle="Klinik muayene kayıtları"
        action={{ label: 'Yeni Muayene', href: '/examinations/new' }}
      />

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Stethoscope className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Klinik muayene kayıtları</h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Klinik değerlendirmeleri hasta, sahip, veteriner ve tarih bilgileriyle tek çalışma listesinden izleyin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4 xl:min-w-[430px] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              <SummaryMetric label="Toplam kayıt" value={examinations.length} loading={examinationsQuery.isLoading} />
              <SummaryMetric label="Son 7 gün" value={lastSevenDays} loading={examinationsQuery.isLoading} />
              <SummaryMetric label="Takip tarihi" value={upcomingFollowUps} loading={examinationsQuery.isLoading} />
            </div>
          </div>
        </section>

        <section aria-label="Muayene arama ve filtreleme" className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Muayene ara"
                value={query}
                onChange={handleQueryChange}
                placeholder="Hasta, sahip, şikayet, değerlendirme veya veteriner ara"
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

            <Select value={patientFilter} onValueChange={handlePatientChange}>
              <SelectTrigger aria-label="Hastaya göre filtrele" className="h-11 w-full gap-2 rounded-lg border-slate-200 bg-white px-3 xl:w-52">
                <UserRound className="size-4 text-slate-400" />
                <SelectValue placeholder="Hasta seçin">
                  {patientFilter === 'all' ? 'Tüm hastalar' : patients.find(patient => patient.id === patientFilter)?.name ?? 'Tüm hastalar'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">Tüm hastalar</SelectItem>
                {patients.map(patient => <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={handlePeriodChange}>
              <SelectTrigger aria-label="Tarihe göre filtrele" className="h-11 w-full gap-2 rounded-lg border-slate-200 bg-white px-3 xl:w-44">
                <CalendarDays className="size-4 text-slate-400" />
                <SelectValue placeholder="Tarih seçin">
                  {PERIOD_OPTIONS.find(option => option.value === periodFilter)?.label ?? 'Tüm tarihler'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {PERIOD_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-11 justify-center px-4 text-xs text-slate-600 xl:justify-start">
                Filtreleri temizle
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p aria-live="polite">
              {isLoading
                ? 'Muayene kayıtları getiriliyor'
                : examinationsQuery.isError
                  ? 'Kayıt sayısı alınamadı'
                  : hasActiveFilters
                    ? `${filtered.length.toLocaleString('tr-TR')} eşleşen kayıt`
                    : `${examinations.length.toLocaleString('tr-TR')} toplam kayıt`}
            </p>
            {(examinationsQuery.isFetching || patientsQuery.isFetching) && !isLoading && (
              <span className="inline-flex items-center gap-2 text-slate-400"><RefreshCw className="size-3 animate-spin" /> Liste güncelleniyor</span>
            )}
          </div>
        </section>

        {patientsQuery.isError && !examinationsQuery.isError && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <p className="text-xs leading-5">Hasta bilgileri şu anda alınamadı. Muayene kayıtları klinik notları ve tarihleriyle gösterilmeye devam ediyor.</p>
          </div>
        )}

        {examinationsQuery.isError ? (
          <ExaminationsError onRetry={() => examinationsQuery.refetch()} />
        ) : isLoading ? (
          <ExaminationsListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyExaminations filtered={hasActiveFilters} onClear={clearFilters} />
        ) : (
          <section className={cn(
            'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-opacity',
            (examinationsQuery.isFetching || patientsQuery.isFetching) && 'opacity-60',
          )}>
            <div className="hidden grid-cols-[minmax(190px,1.05fr)_minmax(320px,1.7fr)_minmax(150px,0.75fr)_130px_32px] items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:grid">
              <span>Hasta ve sahip</span>
              <span>Klinik kayıt</span>
              <span>Veteriner</span>
              <span>Tarih</span>
              <span className="sr-only">Detay</span>
            </div>

            <div className="divide-y divide-slate-100">
              {paginated.map(examination => <ExaminationRow key={examination.id} examination={examination} />)}
            </div>
          </section>
        )}

        {!examinationsQuery.isError && !isLoading && filtered.length > 0 && (
          <Pagination
            page={activePage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </main>
    </div>
  )
}

function ExaminationRow({ examination }: { examination: EnrichedExamination }) {
  const date = examination.createdAt ?? examination.date
  const vet = veterinarianName(examination)

  return (
    <Link
      href={`/patients/${examination.petId}`}
      data-testid={`examination-row-${examination.id}`}
      aria-label={`${examination.pet?.name ?? 'Hasta'} muayene kaydını aç`}
      className="group grid min-h-[148px] gap-4 px-4 py-5 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 sm:px-5 lg:min-h-[104px] lg:grid-cols-[minmax(190px,1.05fr)_minmax(320px,1.7fr)_minmax(150px,0.75fr)_130px_32px] lg:items-center lg:px-6 lg:py-4"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <PatientMark patient={examination.pet} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{examination.pet?.name ?? 'Hasta bilgisi alınamadı'}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">{examination.pet?.owner?.fullName ?? 'Sahip bilgisi yok'}</p>
          {examination.pet && (
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {speciesLabel(normalizeSpecies(examination.pet.species))} · {examination.pet.breed ?? 'Irk belirtilmemiş'}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
        <div className="flex items-start gap-2.5">
          <FileText className="mt-0.5 size-4 shrink-0 text-teal-700" />
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-medium text-slate-800">{examination.complaint || 'Şikayet bilgisi yok'}</p>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500"><span className="font-medium text-slate-600">Değerlendirme:</span> {examination.assessment || 'Belirtilmemiş'}</p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-2 text-xs lg:block">
        <span className="font-medium text-slate-400 lg:hidden">Veteriner</span>
        <p className="truncate font-medium text-slate-700">{vet || 'Bilgi yok'}</p>
      </div>

      <div className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-2 text-xs lg:block">
        <span className="font-medium text-slate-400 lg:hidden">Tarih</span>
        <div>
          <p className="font-medium text-slate-700">{date ? formatDate(date) : 'Tarih yok'}</p>
          {examination.followUpDate && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-700"><Clock3 className="size-3" /> Takip {formatDate(examination.followUpDate)}</p>
          )}
        </div>
      </div>

      <ChevronRight className="hidden size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700 lg:block" />
    </Link>
  )
}

function PatientMark({ patient }: { patient?: ClinicPatient }) {
  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
      {patient?.photoUrl ? (
        <Image src={patient.photoUrl} alt={patient.name} fill sizes="48px" className="object-cover" unoptimized />
      ) : (
        <PawPrint className="size-5" />
      )}
    </div>
  )
}

function SummaryMetric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="px-3 text-center first:pl-0 last:pr-0 sm:px-5">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      {loading ? <Skeleton className="mx-auto mt-2 h-7 w-12" /> : <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 tabular-nums">{value.toLocaleString('tr-TR')}</p>}
    </div>
  )
}

function ExaminationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-amber-950">Muayene kayıtları alınamadı</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-amber-800">Klinik kayıt servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.</p>
      <Button variant="outline" onClick={onRetry} className="mt-5 h-11 gap-2 border-amber-300 bg-white px-4 text-amber-900 hover:bg-amber-100">
        <RefreshCw className="size-4" /> Yeniden dene
      </Button>
    </section>
  )
}

function EmptyExaminations({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        {filtered ? <Filter className="size-6" /> : <Stethoscope className="size-6" />}
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-900">{filtered ? 'Eşleşen muayene kaydı bulunamadı' : 'Henüz muayene kaydı yok'}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered ? 'Arama ifadenizi, hasta seçimini veya tarih filtresini değiştirerek yeniden deneyin.' : 'Tamamlanan ilk klinik değerlendirme hasta ve veteriner bilgileriyle burada görünecek.'}
      </p>
      {filtered ? (
        <Button variant="outline" onClick={onClear} className="mt-5 h-11 px-4">Filtreleri temizle</Button>
      ) : (
        <Link href="/examinations/new" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          Yeni muayene oluştur <ArrowRight className="size-4" />
        </Link>
      )}
    </section>
  )
}

function ExaminationsListSkeleton() {
  return (
    <section aria-label="Muayene kayıtları yükleniyor" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden h-11 border-b border-slate-100 bg-slate-50/60 lg:block" />
      {[0, 1, 2, 3, 4].map(item => (
        <div key={item} className="flex min-h-24 items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-64 max-w-full" /></div>
          <Skeleton className="hidden h-3 w-28 lg:block" />
          <Skeleton className="hidden h-3 w-24 lg:block" />
        </div>
      ))}
    </section>
  )
}

function ExaminationsPageFallback() {
  return (
    <div className="min-h-full">
      <Header title="Muayeneler" subtitle="Klinik muayene kayıtları" action={{ label: 'Yeni Muayene', href: '/examinations/new' }} />
      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-[34rem] rounded-xl" />
      </main>
    </div>
  )
}

function veterinarianName(examination: ApiExamination): string {
  if (examination.vet?.fullName) return examination.vet.fullName
  return [examination.vet?.title, examination.vet?.firstName, examination.vet?.lastName].filter(Boolean).join(' ')
}

function examinationTimestamp(examination: ApiExamination): number {
  const value = examination.createdAt ?? examination.date
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function isInPeriod(date: string | undefined, period: string): boolean {
  if (period === 'all') return true
  if (!date) return false
  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) return false
  const days = Number(period)
  return timestamp >= Date.now() - days * 24 * 60 * 60 * 1000
}

function isUpcoming(date: string | undefined): boolean {
  if (!date) return false
  const timestamp = new Date(date).getTime()
  if (Number.isNaN(timestamp)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return timestamp >= today.getTime()
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLocaleLowerCase('tr-TR')
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') return normalized
  return 'other'
}

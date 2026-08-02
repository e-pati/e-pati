'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Info,
  LoaderCircle,
  MessageCircle,
  PawPrint,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllClinicPatients } from '@/hooks/use-clinic'
import { useCreateExamination } from '@/hooks/use-examinations'
import { calculateAge, cn, speciesLabel } from '@/lib/utils'
import type { ClinicPatient } from '@/services/clinics.service'
import { whatsappService } from '@/services/whatsapp.service'
import type { PetSpecies } from '@/types'

const examinationSchema = z.object({
  petId: z.string().min(1, 'Muayene kaydı için bir hasta seçin'),
  complaint: z.string().trim().min(5, 'Şikayet en az 5 karakter olmalı'),
  findings: z.string().trim().min(5, 'Klinik bulgular en az 5 karakter olmalı'),
  assessment: z.string().trim().min(5, 'Değerlendirme en az 5 karakter olmalı'),
  plan: z.string().trim().min(5, 'Tedavi ve takip planı en az 5 karakter olmalı'),
  sendWhatsappSummary: z.boolean(),
})

type ExaminationForm = z.infer<typeof examinationSchema>
type NoteField = 'complaint' | 'findings' | 'assessment' | 'plan'

const NOTE_FIELDS: Array<{
  key: NoteField
  soap: string
  label: string
  description: string
  placeholder: string
}> = [
  {
    key: 'complaint',
    soap: 'S',
    label: 'Şikayet',
    description: 'Hayvan sahibinin aktardığı belirtiler ve gözlemler',
    placeholder: 'Örn. İki gündür iştahsız, su tüketimi azaldı ve daha sakin davranıyor.',
  },
  {
    key: 'findings',
    soap: 'O',
    label: 'Klinik bulgular',
    description: 'Fiziksel muayene bulguları, ölçümler ve gözlenen durum',
    placeholder: 'Örn. Ateş 39,8 °C. Karın palpasyonunda hafif hassasiyet gözlendi.',
  },
  {
    key: 'assessment',
    soap: 'A',
    label: 'Değerlendirme',
    description: 'Klinik değerlendirme, olası tanı ve ayırıcı tanılar',
    placeholder: 'Örn. Gastroenterit ön tanısı. Beslenme değişikliğine bağlı hassasiyet değerlendiriliyor.',
  },
  {
    key: 'plan',
    soap: 'P',
    label: 'Tedavi ve takip planı',
    description: 'Uygulanan tedavi, öneriler ve kontrol planı',
    placeholder: 'Örn. Destek tedavisi başlandı. Beslenme takibi ve üç gün içinde kontrol önerildi.',
  },
]

export default function NewExaminationPage() {
  return (
    <Suspense fallback={<NewExaminationFallback />}>
      <NewExaminationForm />
    </Suspense>
  )
}

function NewExaminationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPetId = searchParams.get('petId') ?? ''
  const [petSearch, setPetSearch] = useState('')
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId)
  const [submitted, setSubmitted] = useState(false)
  const [summaryQueued, setSummaryQueued] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const petsQuery = useAllClinicPatients()
  const createExamination = useCreateExamination()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExaminationForm>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      petId: preselectedPetId,
      complaint: '',
      findings: '',
      assessment: '',
      plan: '',
      sendWhatsappSummary: true,
    },
  })

  const sendWhatsappSummary = useWatch({ control, name: 'sendWhatsappSummary' })
  const noteValues = useWatch({
    control,
    name: ['complaint', 'findings', 'assessment', 'plan'],
  })
  const completedNotes = noteValues.filter(value => value?.trim().length >= 5).length
  const pets = petsQuery.data?.items ?? []
  const selectedPet = pets.find(pet => pet.id === selectedPetId)
  const busy = isSubmitting || createExamination.isPending

  const filteredPets = pets.filter(pet => {
    const query = petSearch.trim().toLocaleLowerCase('tr-TR')
    if (!query) return true

    return [pet.name, pet.owner?.fullName, pet.breed, pet.microchipNo]
      .filter(Boolean)
      .some(value => value?.toLocaleLowerCase('tr-TR').includes(query))
  })

  const handlePetSelect = (pet: ClinicPatient) => {
    setSelectedPetId(pet.id)
    setValue('petId', pet.id, { shouldValidate: true })
    setValue('sendWhatsappSummary', Boolean(pet.owner?.phone))
    setPetSearch('')
  }

  const clearPatient = () => {
    setSelectedPetId('')
    setValue('petId', '', { shouldValidate: true })
    setValue('sendWhatsappSummary', false)
  }

  const onSubmit = async (data: ExaminationForm) => {
    setSubmitError(null)

    try {
      await createExamination.mutateAsync({
        petId: data.petId,
        complaint: data.complaint,
        findings: data.findings,
        assessment: data.assessment,
        plan: data.plan,
      })

      if (data.sendWhatsappSummary && selectedPet?.owner?.phone) {
        try {
          await whatsappService.send({
            petId: data.petId,
            ownerPhone: selectedPet.owner.phone,
            type: 'exam_summary',
            message: [
              `Merhaba ${selectedPet.owner.fullName}`,
              `${selectedPet.name} için muayene özeti:`,
              `Şikayet: ${data.complaint}`,
              `Değerlendirme: ${data.assessment}`,
              `Plan: ${data.plan}`,
            ].join('\n'),
          })
          setSummaryQueued(true)
        } catch {
          toast.warning('Muayene kaydedildi, bilgilendirme gönderilemedi.', {
            description: 'Hasta kaydı hazır. Özeti daha sonra yeniden gönderebilirsiniz.',
          })
        }
      }

      setSubmitted(true)
      toast.success('Muayene kaydı oluşturuldu')
      window.setTimeout(() => router.push(`/patients/${data.petId}`), 1400)
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message
      const resolvedMessage = Array.isArray(message) ? message.join(' ') : message
      const fallback = 'Muayene kaydedilemedi. Bilgileri kontrol edip yeniden deneyin.'
      setSubmitError(resolvedMessage ?? fallback)
      toast.error(resolvedMessage ?? fallback)
    }
  }

  if (submitted) {
    return (
      <div data-testid="examination-create-success" className="min-h-full">
        <Header title="Yeni Muayene" subtitle="Klinik muayene kaydı" />
        <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1400px] items-center justify-center p-4 sm:p-6 lg:p-8">
          <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-950">Muayene kaydı oluşturuldu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {selectedPet?.name ?? 'Hasta'} için klinik notlar hasta dosyasına işlendi.
              {summaryQueued ? ' Hasta sahibi bilgilendirme özeti sıraya alındı.' : ''}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-teal-700">
              <LoaderCircle className="size-4 animate-spin" /> Hasta dosyası açılıyor
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div data-testid="examination-create-page" className="min-h-full">
      <Header title="Yeni Muayene" subtitle="Klinik değerlendirme kaydı oluşturun" />

      <main className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/examinations"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="size-4" /> Muayene kayıtlarına dön
          </Link>
          <p className="text-xs text-slate-500"><span className="font-semibold text-red-600">*</span> Zorunlu alan</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Yeni muayene kaydı</h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                Hastayı seçin, klinik değerlendirmenizi yapılandırılmış biçimde kaydedin ve gerekli bilgilendirmeyi tek akışta tamamlayın.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section aria-labelledby="patient-selection-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="patient-selection-title"
                  icon={UserRound}
                  title="Hasta seçimi"
                  description="Muayenenin işleneceği klinik dosyasını belirleyin"
                  required
                />

                <div className="space-y-4 p-5 sm:p-6">
                  {petsQuery.isLoading ? (
                    <PatientListSkeleton />
                  ) : petsQuery.isError ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-amber-950">Hasta listesi alınamadı</p>
                          <p className="mt-1 text-xs leading-5 text-amber-800">Bağlantıyı kontrol edip hasta listesini yeniden yükleyin.</p>
                          <Button type="button" variant="outline" onClick={() => petsQuery.refetch()} className="mt-3 h-9 border-amber-300 bg-white px-3 text-xs text-amber-950">
                            Yeniden dene
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : selectedPet ? (
                    <SelectedPatient patient={selectedPet} onClear={clearPatient} />
                  ) : pets.length === 0 ? (
                    <EmptyPatientList />
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={petSearch}
                          onChange={event => setPetSearch(event.target.value)}
                          placeholder="Hasta, sahip, ırk veya kimlik numarası ara"
                          aria-label="Hasta ara"
                          className="h-11 rounded-lg border-slate-200 bg-slate-50/60 pl-10 text-sm shadow-none focus-visible:bg-white"
                        />
                      </div>

                      <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200">
                        {filteredPets.length > 0 ? filteredPets.map(pet => (
                          <PatientOption key={pet.id} patient={pet} onSelect={() => handlePetSelect(pet)} />
                        )) : (
                          <div className="px-5 py-10 text-center">
                            <Search className="mx-auto size-5 text-slate-400" />
                            <p className="mt-3 text-sm font-semibold text-slate-800">Aramayla eşleşen hasta bulunamadı</p>
                            <p className="mt-1 text-xs text-slate-500">Farklı bir ad veya kimlik numarası deneyin.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.petId && (
                    <p id="petId-error" role="alert" className="flex items-center gap-2 text-xs font-medium text-red-600">
                      <AlertTriangle className="size-4" /> {errors.petId.message}
                    </p>
                  )}
                </div>
              </section>

              <section aria-labelledby="clinical-notes-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="clinical-notes-title"
                  icon={FileText}
                  title="Klinik değerlendirme"
                  description="Muayene notları standart SOAP düzeninde saklanır"
                  required
                />

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
                  {NOTE_FIELDS.map(field => (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Label htmlFor={field.key} className="text-sm font-semibold text-slate-900">
                            {field.label} <span className="text-red-600">*</span>
                          </Label>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold tracking-[0.14em] text-slate-400">SOAP · {field.soap}</span>
                      </div>
                      <textarea
                        id={field.key}
                        rows={5}
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(errors[field.key])}
                        aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                        {...register(field.key)}
                        className={cn(
                          'min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-none outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-3 focus:ring-teal-500/10',
                          errors[field.key] && 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10',
                        )}
                      />
                      {errors[field.key] && (
                        <p id={`${field.key}-error`} role="alert" className="text-xs font-medium text-red-600">{errors[field.key]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="notification-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="notification-title"
                  icon={MessageCircle}
                  title="Hasta sahibi bilgilendirmesi"
                  description="Muayene sonrasında kısa klinik özet gönderimi"
                />
                <div className="p-5 sm:p-6">
                  <label className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 transition',
                    selectedPet?.owner?.phone ? 'cursor-pointer border-slate-200 bg-slate-50/60 hover:border-teal-200' : 'border-slate-200 bg-slate-50 opacity-75',
                  )}>
                    <input
                      type="checkbox"
                      {...register('sendWhatsappSummary')}
                      disabled={!selectedPet?.owner?.phone}
                      className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-teal-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">Muayene özetini WhatsApp ile gönder</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {selectedPet?.owner?.phone
                          ? `Kısa muayene özeti ${selectedPet.owner.fullName} için ${selectedPet.owner.phone} numarasına gönderilir.`
                          : 'Gönderimi etkinleştirmek için telefon bilgisi bulunan bir hasta seçin.'}
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              {submitError && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold">Muayene kaydedilemedi</p>
                    <p className="mt-1 text-xs leading-5 text-red-800">{submitError}</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <ClipboardCheck className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">Muayene özeti</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Kaydetmeden önce kontrol edin</p>
                  </div>
                </div>

                <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                  <SummaryRow label="Hasta" value={selectedPet?.name ?? 'Seçilmedi'} ready={Boolean(selectedPet)} />
                  <SummaryRow label="Klinik notlar" value={`${completedNotes}/4 hazır`} ready={completedNotes === 4} />
                  <SummaryRow
                    label="Bilgilendirme"
                    value={sendWhatsappSummary && selectedPet?.owner?.phone ? 'WhatsApp açık' : 'Gönderilmeyecek'}
                    ready={Boolean(selectedPet)}
                  />
                </dl>

                <Button type="submit" disabled={busy} className="mt-5 h-11 w-full gap-2 bg-teal-700 text-white hover:bg-teal-800">
                  {busy ? <><LoaderCircle className="size-4 animate-spin" /> Kaydediliyor</> : <><ShieldCheck className="size-4" /> Muayeneyi kaydet</>}
                </Button>
                <Link href="/examinations" className={cn(buttonVariants({ variant: 'ghost' }), 'mt-2 h-10 w-full text-slate-600')}>
                  İptal
                </Link>
              </section>

              <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-teal-700" />
                  <p className="text-xs leading-5 text-teal-950">
                    Muayene notları klinik kayıt bütünlüğü için hasta dosyasına tarih ve veteriner bilgisiyle işlenir.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  )
}

function SectionHeader({
  id,
  icon: Icon,
  title,
  description,
  required = false,
}: {
  id: string
  icon: typeof Stethoscope
  title: string
  description: string
  required?: boolean
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/55 px-5 py-4 sm:px-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-teal-700">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h2 id={id} className="text-sm font-semibold text-slate-950">
          {title}{required && <span className="ml-1 text-red-600">*</span>}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function PatientOption({ patient, onSelect }: { patient: ClinicPatient; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${patient.name} adlı hastayı seç`}
      className="group flex min-h-16 w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-teal-50/55 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
    >
      <PatientMark patient={patient} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-slate-900">{patient.name}</span>
          <span className="text-[11px] text-slate-400">{speciesLabel(normalizeSpecies(patient.species))}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {patient.owner?.fullName ?? 'Sahip bilgisi yok'} · {patient.breed ?? 'Irk belirtilmemiş'}
        </p>
      </div>
      {patient.microchipNo && <span className="hidden shrink-0 text-[11px] tabular-nums text-slate-400 sm:block">{patient.microchipNo}</span>}
      <ChevronRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
    </button>
  )
}

function SelectedPatient({ patient, onClear }: { patient: ClinicPatient; onClear: () => void }) {
  return (
    <div data-testid="selected-patient" className="rounded-lg border border-teal-200 bg-teal-50/55 p-4">
      <div className="flex items-start gap-3 sm:items-center">
        <PatientMark patient={patient} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-950">{patient.name}</p>
            <span className="text-[11px] font-medium text-teal-700">Seçili hasta</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {speciesLabel(normalizeSpecies(patient.species))} · {patient.breed ?? 'Irk belirtilmemiş'}
            {patient.birthDate ? ` · ${calculateAge(patient.birthDate)}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Sahip: {patient.owner?.fullName ?? 'Sahip bilgisi yok'}
            {patient.microchipNo ? ` · Kimlik: ${patient.microchipNo}` : ''}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClear} className="h-9 border-slate-200 bg-white px-3 text-xs text-slate-700">
          Değiştir
        </Button>
      </div>
    </div>
  )
}

function PatientMark({ patient, size }: { patient: ClinicPatient; size: 'md' | 'lg' }) {
  const dimensions = size === 'lg' ? 'size-12' : 'size-10'

  return (
    <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-500', dimensions)}>
      {patient.photoUrl ? (
        <Image src={patient.photoUrl} alt={patient.name} fill sizes={size === 'lg' ? '48px' : '40px'} className="object-cover" unoptimized />
      ) : (
        <PawPrint className={size === 'lg' ? 'size-5' : 'size-4'} />
      )}
    </div>
  )
}

function EmptyPatientList() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
      <PawPrint className="mx-auto size-6 text-slate-400" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900">Kayıtlı hasta bulunamadı</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Muayene oluşturabilmek için önce klinik hasta kaydı açın.</p>
      <Link href="/patients/new" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 h-9 border-slate-200 bg-white px-3 text-xs')}>
        Yeni hasta kaydı
      </Link>
    </div>
  )
}

function SummaryRow({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-xs">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('flex items-center gap-1.5 text-right font-semibold', ready ? 'text-slate-800' : 'text-slate-400')}>
        <span className={cn('size-1.5 rounded-full', ready ? 'bg-emerald-500' : 'bg-slate-300')} />
        {value}
      </dd>
    </div>
  )
}

function PatientListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Hasta listesi yükleniyor">
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {[0, 1, 2].map(item => (
          <div key={item} className="flex h-16 items-center gap-3 border-b border-slate-100 px-4 last:border-b-0">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-48 max-w-full" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewExaminationFallback() {
  return (
    <div className="min-h-full">
      <Header title="Yeni Muayene" subtitle="Klinik değerlendirme kaydı oluşturun" />
      <main className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-11 w-44 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-[34rem] rounded-xl" /></div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </main>
    </div>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLowerCase()
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') return normalized
  return 'other'
}

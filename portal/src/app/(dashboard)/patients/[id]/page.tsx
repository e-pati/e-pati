'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Pill,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Trash2,
  UserRound,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AddLabResultDialog } from '@/components/patients/add-lab-result-dialog'
import { AddPrescriptionDialog } from '@/components/patients/add-prescription-dialog'
import { AddVaccinationDialog } from '@/components/patients/add-vaccination-dialog'
import { EditPatientDialog } from '@/components/patients/edit-patient-dialog'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { SendWhatsAppDialog } from '@/components/patients/send-whatsapp-dialog'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExaminations } from '@/hooks/use-examinations'
import { useLabResults } from '@/hooks/use-lab-results'
import { usePet, useDeletePet } from '@/hooks/use-pets'
import { usePrescriptions } from '@/hooks/use-prescriptions'
import { useVaccinations } from '@/hooks/use-vaccinations'
import { openPrescriptionPdf } from '@/lib/open-prescription-pdf'
import {
  calculateAge,
  formatDate,
  formatDateShort,
  isVaccinationDueSoon,
  isVaccinationOverdue,
  speciesLabel,
  cn,
} from '@/lib/utils'
import { labResultsService, type ApiLabResult } from '@/services/lab-results.service'
import type { ApiExamination } from '@/services/examinations.service'
import type { ApiPrescription } from '@/services/prescriptions.service'
import { useAuthStore } from '@/stores/auth.store'
import type { PetSpecies } from '@/types'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const currentUser = useAuthStore(state => state.user)
  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [labDialogOpen, setLabDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const petQuery = usePet(id)
  const deletePet = useDeletePet()
  const examinationsQuery = useExaminations({ petId: id, limit: 100 })
  const vaccinationsQuery = useVaccinations({ petId: id, limit: 100 })
  const prescriptionsQuery = usePrescriptions({ petId: id })
  const labResultsQuery = useLabResults({ petId: id })

  const handleDelete = async () => {
    const petName = petQuery.data?.name ?? 'Hasta'
    try {
      await deletePet.mutateAsync(id)
      toast.success(`${petName} silindi`)
      router.push('/patients')
    } catch {
      toast.error('Hasta kaydı silinemedi. Lütfen yeniden deneyin.')
    }
  }

  if (petQuery.isLoading) return <PatientDetailSkeleton />
  if (petQuery.isError) {
    return <PatientDetailError onRetry={() => void petQuery.refetch()} />
  }

  const pet = petQuery.data
  if (!pet) notFound()

  const petSpecies = normalizeSpecies(pet.species)
  const ownerName = pet.owner?.fullName ?? 'Sahip bilgisi yok'
  const ownerPhone = pet.owner?.phone
  const ownerEmail = pet.owner?.email

  const examinations = [...(examinationsQuery.data ?? [])]
    .sort((a, b) => new Date(examinationDate(b)).getTime() - new Date(examinationDate(a)).getTime())
  const vaccinations = [...(vaccinationsQuery.data ?? [])]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  const prescriptions = prescriptionsQuery.data ?? []
  const labResults = [...(labResultsQuery.data ?? [])]
    .sort((a, b) => new Date(labDate(b)).getTime() - new Date(labDate(a)).getTime())

  const hasApiError = examinationsQuery.isError || vaccinationsQuery.isError ||
    prescriptionsQuery.isError || labResultsQuery.isError

  return (
    <div data-testid="patient-detail-page" className="min-h-full">
      <Header
        title={pet.name}
        subtitle={`${speciesLabel(petSpecies)} · ${pet.breed ?? 'Irk belirtilmemiş'}`}
        action={{ label: 'Yeni Muayene', href: `/examinations/new?petId=${pet.id}` }}
      />

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/patients"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="size-4" /> Hasta dizinine dön
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="h-11 gap-2 rounded-xl border-slate-200 px-4 text-xs"
            >
              <Pencil className="size-4" /> Kaydı düzenle
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="Hasta kaydını sil"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deletePet.isPending}
              className="size-11 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 px-5 py-6 text-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.9)] sm:px-7 sm:py-7 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_right,black,transparent_82%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full border border-cyan-300/10 bg-cyan-300/5" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-center">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/10 text-4xl shadow-[0_16px_35px_-24px_rgba(0,0,0,0.8)] sm:size-24">
                <PatientAvatar name={pet.name} photoUrl={pet.photoUrl} species={petSpecies} size={96} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-slate-200 shadow-none hover:bg-white/10">
                    HASTA KİMLİK KAYDI
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                    <ShieldCheck className="size-3.5" /> Klinik kaydı
                  </span>
                </div>
                <h2 className="mt-4 truncate text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{pet.name}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {speciesLabel(petSpecies)} · {pet.breed || 'Irk bilgisi belirtilmemiş'} · {sexLabel(pet.sex)}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <IdentityField label="Mikroçip" value={pet.microchipNo || 'Kayıt yok'} mono={Boolean(pet.microchipNo)} />
              <IdentityField label="Doğum tarihi" value={pet.birthDate ? formatDateShort(pet.birthDate) : 'Belirtilmemiş'} />
              <IdentityField label="Yaş" value={pet.birthDate ? calculateAge(pet.birthDate) : 'Belirtilmemiş'} />
              <IdentityField label="Kayıt tarihi" value={formatDateShort(pet.createdAt)} />
            </dl>
          </div>
        </section>

        {hasApiError && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="leading-5">Bazı klinik kayıtları şu anda alınamadı. Erişilebilen hasta bilgileri gösterilmeye devam ediyor.</p>
          </div>
        )}

        <section aria-label="Hasta sağlık özeti" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <RecordMetric
            label="Muayene"
            description="Klinik değerlendirme"
            icon={Stethoscope}
            value={examinations.length}
            isLoading={examinationsQuery.isLoading}
            isError={examinationsQuery.isError}
          />
          <RecordMetric
            label="Aşı"
            description="Uygulama ve takip"
            icon={Syringe}
            value={vaccinations.length}
            isLoading={vaccinationsQuery.isLoading}
            isError={vaccinationsQuery.isError}
          />
          <RecordMetric
            label="Reçete"
            description="Tedavi kayıtları"
            icon={Pill}
            value={prescriptions.length}
            isLoading={prescriptionsQuery.isLoading}
            isError={prescriptionsQuery.isError}
          />
          <RecordMetric
            label="Laboratuvar"
            description="Sonuç ve belgeler"
            icon={FlaskConical}
            value={labResults.length}
            isLoading={labResultsQuery.isLoading}
            isError={labResultsQuery.isError}
          />
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <Tabs defaultValue="examinations" className="gap-0">
              <div className="overflow-x-auto border-b border-slate-100 px-4 pt-3 sm:px-6">
                <TabsList variant="line" className="h-12 min-w-max gap-5 p-0 sm:gap-7">
                  <TabsTrigger value="examinations" className="h-12 gap-2 px-0 text-xs">
                    <Stethoscope className="size-4" /> Muayeneler
                  </TabsTrigger>
                  <TabsTrigger value="vaccinations" className="h-12 gap-2 px-0 text-xs">
                    <Syringe className="size-4" /> Aşılar
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="h-12 gap-2 px-0 text-xs">
                    <Pill className="size-4" /> Reçeteler
                  </TabsTrigger>
                  <TabsTrigger value="lab" className="h-12 gap-2 px-0 text-xs">
                    <FlaskConical className="size-4" /> Laboratuvar
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="examinations">
                <PanelHeader
                  eyebrow="Klinik geçmiş"
                  title="Muayene kayıtları"
                  description="Şikayet, bulgu, değerlendirme ve tedavi planları"
                  action={<Link href={`/examinations/new?petId=${pet.id}`} className={cn(buttonVariants(), 'h-11 gap-2 rounded-xl px-4 text-xs')}><Plus className="size-4" /> Yeni muayene</Link>}
                />
                {examinationsQuery.isLoading ? (
                  <RecordListSkeleton />
                ) : examinationsQuery.isError ? (
                  <ModuleError label="Muayene kayıtları" onRetry={() => void examinationsQuery.refetch()} />
                ) : examinations.length === 0 ? (
                  <EmptyState icon={Stethoscope} title="Henüz muayene kaydı yok" description="İlk klinik değerlendirme kaydedildiğinde burada görünecek." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {examinations.map(exam => (
                      <article key={exam.id} className="px-5 py-5 sm:px-6 sm:py-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                              <Stethoscope className="size-[18px]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{formatDate(examinationDate(exam))}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatVetName(exam.vet, exam.veterinarianId === currentUser?.id ? currentUser?.fullName : undefined)}
                              </p>
                            </div>
                          </div>
                          {exam.followUpDate && (
                            <Badge variant="outline" className="w-fit border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 shadow-none">
                              Takip · {formatDateShort(exam.followUpDate)}
                            </Badge>
                          )}
                        </div>

                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                          {[
                            { label: 'Şikayet', value: exam.complaint },
                            { label: 'Bulgular', value: exam.findings },
                            { label: 'Değerlendirme', value: exam.assessment },
                            { label: 'Plan', value: exam.plan },
                          ].map(field => (
                            <div key={field.label} className="rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100">
                              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{field.label}</dt>
                              <dd className="mt-1.5 text-sm leading-6 text-slate-700">{field.value || 'Kayıt girilmemiş'}</dd>
                            </div>
                          ))}
                        </dl>
                      </article>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vaccinations">
                <PanelHeader
                  eyebrow="Koruyucu sağlık"
                  title="Aşı kayıtları"
                  description="Uygulanan aşılar, lot bilgisi ve sonraki takip tarihi"
                  action={<Button variant="outline" onClick={() => setVaccinationDialogOpen(true)} className="h-11 gap-2 rounded-xl px-4 text-xs"><Plus className="size-4" /> Aşı ekle</Button>}
                />
                {vaccinationsQuery.isLoading ? (
                  <RecordListSkeleton />
                ) : vaccinationsQuery.isError ? (
                  <ModuleError label="Aşı kayıtları" onRetry={() => void vaccinationsQuery.refetch()} />
                ) : vaccinations.length === 0 ? (
                  <EmptyState icon={Syringe} title="Henüz aşı kaydı yok" description="İlk aşı uygulaması kaydedildiğinde burada görünecek." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {vaccinations.map(vaccination => {
                      const overdue = vaccination.dueAt ? isVaccinationOverdue(vaccination.dueAt) : false
                      const dueSoon = vaccination.dueAt ? isVaccinationDueSoon(vaccination.dueAt) : false
                      return (
                        <article key={vaccination.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6">
                          <div className={`flex size-10 items-center justify-center rounded-xl ring-1 ${overdue ? 'bg-red-50 text-red-700 ring-red-100' : dueSoon ? 'bg-amber-50 text-amber-700 ring-amber-100' : 'bg-emerald-50 text-emerald-700 ring-emerald-100'}`}>
                            {overdue ? <AlertTriangle className="size-[18px]" /> : dueSoon ? <Clock3 className="size-[18px]" /> : <CheckCircle2 className="size-[18px]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">{vaccination.name}</h4>
                              <span className={`text-[10px] font-semibold ${overdue ? 'text-red-700' : dueSoon ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {overdue ? 'Takip tarihi geçti' : dueSoon ? 'Takip yaklaşıyor' : 'Uygulandı'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {vaccination.notes || 'Not eklenmemiş'}{vaccination.lotNumber ? ` · Lot ${vaccination.lotNumber}` : ''}
                            </p>
                          </div>
                          <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-xs sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Uygulama</dt>
                              <dd className="mt-1 font-medium text-slate-700">{formatDateShort(vaccination.appliedAt)}</dd>
                            </div>
                            <div className="sm:mt-2">
                              <dt className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Sonraki</dt>
                              <dd className="mt-1 font-medium text-slate-700">{vaccination.dueAt ? formatDateShort(vaccination.dueAt) : 'Belirtilmemiş'}</dd>
                            </div>
                          </dl>
                        </article>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prescriptions">
                <PanelHeader
                  eyebrow="Tedavi planı"
                  title="Reçete kayıtları"
                  description="İlaç, doz, kullanım sıklığı ve uygulama talimatları"
                  action={<Button variant="outline" onClick={() => setPrescriptionDialogOpen(true)} className="h-11 gap-2 rounded-xl px-4 text-xs"><Plus className="size-4" /> Reçete yaz</Button>}
                />
                {prescriptionsQuery.isLoading ? (
                  <RecordListSkeleton />
                ) : prescriptionsQuery.isError ? (
                  <ModuleError label="Reçete kayıtları" onRetry={() => void prescriptionsQuery.refetch()} />
                ) : prescriptions.length === 0 ? (
                  <EmptyState icon={FileText} title="Henüz reçete kaydı yok" description="İlk tedavi reçetesi oluşturulduğunda burada görünecek." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {prescriptions.map(prescription => (
                      <article key={prescription.id} className="px-5 py-5 sm:px-6 sm:py-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Reçete tarihi</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(prescriptionDate(prescription))}</p>
                          </div>
                          <Button type="button" variant="outline" onClick={() => void openPrescriptionPdf(prescription.id)} className="h-11 gap-2 rounded-xl px-4 text-xs">
                            <FileText className="size-4" /> PDF belgesi
                          </Button>
                        </div>
                        <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                          {prescription.medications.map((medication, index) => (
                            <div key={medication.id ?? `${prescription.id}-${index}`} className="flex items-start gap-3 bg-slate-50/60 px-4 py-3.5">
                              <Pill className="mt-0.5 size-4 shrink-0 text-slate-500" />
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{medication.name}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {medication.dose} · {medication.frequency} · {medication.duration}{medication.instructions ? ` · ${medication.instructions}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {prescription.notes && <p className="mt-4 text-xs leading-5 text-slate-500">Not: {prescription.notes}</p>}
                      </article>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lab">
                <PanelHeader
                  eyebrow="Tetkik kayıtları"
                  title="Laboratuvar sonuçları"
                  description="Test türü, klinik açıklama ve sonuç belgeleri"
                  action={<Button variant="outline" onClick={() => setLabDialogOpen(true)} className="h-11 gap-2 rounded-xl px-4 text-xs"><Plus className="size-4" /> Sonuç yükle</Button>}
                />
                {labResultsQuery.isLoading ? (
                  <RecordListSkeleton />
                ) : labResultsQuery.isError ? (
                  <ModuleError label="Laboratuvar kayıtları" onRetry={() => void labResultsQuery.refetch()} />
                ) : labResults.length === 0 ? (
                  <EmptyState icon={FlaskConical} title="Henüz laboratuvar sonucu yok" description="İlk tetkik sonucu yüklendiğinde burada görünecek." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {labResults.map(lab => (
                      <article key={lab.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                          <FlaskConical className="size-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900">{lab.testType}</h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{lab.comment || 'Klinik açıklama eklenmemiş'}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                          <p className="text-xs font-medium text-slate-600">{formatDateShort(labDate(lab))}</p>
                          {lab.fileUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => window.open(lab.fileUrl ?? labResultsService.getFileUrl(lab.id), '_blank', 'noreferrer')}
                              className="mt-1 h-10 rounded-xl px-3 text-xs text-primary"
                            >
                              Dosyayı gör
                            </Button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Hasta yakını</p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">Sahip bilgileri</h3>

              <div className="mt-5 flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                  <UserRound className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{ownerName}</p>
                  <p className="mt-1 text-xs text-slate-500">Kayıtlı hayvan sahibi</p>
                </div>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {ownerPhone && (
                  <a href={`tel:${ownerPhone}`} className="flex min-h-14 items-center gap-3 py-3 text-sm text-slate-700 transition hover:text-slate-950">
                    <Phone className="size-4 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate">{ownerPhone}</span>
                  </a>
                )}
                {ownerEmail && (
                  <a href={`mailto:${ownerEmail}`} className="flex min-h-14 items-center gap-3 py-3 text-sm text-slate-700 transition hover:text-slate-950">
                    <Mail className="size-4 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate">{ownerEmail}</span>
                  </a>
                )}
                {!ownerPhone && !ownerEmail && (
                  <p className="py-4 text-sm leading-6 text-slate-500">İletişim bilgisi bulunmuyor.</p>
                )}
              </div>

              {ownerPhone && (
                <Button type="button" variant="outline" onClick={() => setWhatsappDialogOpen(true)} className="mt-4 h-11 w-full gap-2 rounded-xl border-slate-200 text-xs">
                  <MessageCircle className="size-4 text-emerald-600" /> WhatsApp mesajı
                </Button>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
                  <ShieldCheck className="size-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Klinik kayıt bütünlüğü</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Sağlık işlemleri hasta kimliği altında kronolojik olarak saklanır. Değişiklikler yalnız yetkili klinik kullanıcıları tarafından yapılır.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <AddVaccinationDialog
        petId={id}
        petName={pet.name}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
        petSpecies={pet.species}
        open={vaccinationDialogOpen}
        onClose={() => setVaccinationDialogOpen(false)}
      />
      <AddPrescriptionDialog
        petId={id}
        petName={pet.name}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
        open={prescriptionDialogOpen}
        onClose={() => setPrescriptionDialogOpen(false)}
      />
      <AddLabResultDialog
        petId={id}
        petName={pet.name}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
        open={labDialogOpen}
        onClose={() => setLabDialogOpen(false)}
      />
      {editDialogOpen && (
        <EditPatientDialog pet={pet} open={editDialogOpen} onClose={() => setEditDialogOpen(false)} />
      )}
      <SendWhatsAppDialog
        open={whatsappDialogOpen}
        onOpenChange={setWhatsappDialogOpen}
        petId={pet.id}
        petName={pet.name}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hastayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pet.name}</strong> adlı hasta ve tüm ilişkili klinik kayıtları silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletePet.isPending ? 'Siliniyor...' : 'Evet, sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function IdentityField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className={`mt-1.5 truncate text-xs font-medium text-slate-200 ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</dd>
    </div>
  )
}

function RecordMetric({
  label,
  description,
  icon: Icon,
  value,
  isLoading,
  isError,
}: {
  label: string
  description: string
  icon: React.ElementType
  value: number
  isLoading: boolean
  isError: boolean
}) {
  return (
    <div className="min-h-32 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
          <Icon className="size-4" />
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          <p className={`text-2xl font-semibold tracking-[-0.04em] tabular-nums ${isError ? 'text-slate-400' : 'text-slate-950'}`}>
            {isError ? '—' : value.toLocaleString('tr-TR')}
          </p>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{label}</p>
      <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{isError ? 'Kayıt alınamadı' : description}</p>
    </div>
  )
}

function PanelHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">{eyebrow}</p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

function RecordListSkeleton() {
  return (
    <div aria-label="Klinik kayıtları yükleniyor" className="space-y-3 p-5 sm:p-6">
      {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
    </div>
  )
}

function ModuleError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
        <AlertTriangle className="size-5" />
      </div>
      <h4 className="mt-4 text-sm font-semibold text-slate-900">{label} alınamadı</h4>
      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">Servis bağlantısını kontrol edip yeniden deneyebilirsiniz.</p>
      <Button type="button" variant="outline" onClick={onRetry} className="mt-4 h-11 gap-2 rounded-xl px-4 text-xs">
        <RefreshCw className="size-4" /> Yeniden dene
      </Button>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        <Icon className="size-5" />
      </div>
      <h4 className="mt-4 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}

function PatientDetailSkeleton() {
  return (
    <div className="min-h-full">
      <Header title="Hasta Detayı" subtitle="Klinik kayıtları yükleniyor" />
      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-11 w-40 rounded-xl" />
        <Skeleton className="h-56 rounded-[28px]" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </main>
    </div>
  )
}

function PatientDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-full">
      <Header title="Hasta Detayı" subtitle="Klinik kayıtları" />
      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <section role="alert" className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 px-5 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-amber-950">Hasta kaydı alınamadı</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-amber-800">Klinik hasta servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/patients" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 gap-2 rounded-xl border-amber-300 bg-white px-4 text-xs')}><ArrowLeft className="size-4" /> Hasta dizini</Link>
            <Button onClick={onRetry} className="h-11 gap-2 rounded-xl px-4 text-xs"><RefreshCw className="size-4" /> Yeniden dene</Button>
          </div>
        </section>
      </main>
    </div>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLocaleLowerCase('tr-TR')
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') return normalized
  return 'other'
}

function sexLabel(value: string): string {
  const normalized = value.toLocaleLowerCase('tr-TR')
  if (['male', 'erkek'].includes(normalized)) return 'Erkek'
  if (['female', 'dişi', 'disi'].includes(normalized)) return 'Dişi'
  return 'Cinsiyet belirtilmemiş'
}

function examinationDate(exam: ApiExamination): string {
  return exam.date ?? exam.createdAt
}

function prescriptionDate(prescription: ApiPrescription): string {
  return prescription.date ?? prescription.createdAt ?? new Date().toISOString()
}

function labDate(lab: ApiLabResult): string {
  return lab.date ?? lab.createdAt ?? new Date().toISOString()
}

function formatVetName(vet: ApiExamination['vet'], fallbackName?: string): string {
  if (!vet) return fallbackName ?? 'Veteriner bilgisi yok'
  if (vet.fullName) return `${vet.title ?? ''} ${vet.fullName}`.trim()
  return `${vet.title ?? ''} ${vet.firstName ?? ''} ${vet.lastName ?? ''}`.trim() || fallbackName || 'Veteriner bilgisi yok'
}

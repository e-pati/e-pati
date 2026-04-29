'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePet } from '@/hooks/use-pets'
import { useExaminations } from '@/hooks/use-examinations'
import { useVaccinations } from '@/hooks/use-vaccinations'
import { usePrescriptions } from '@/hooks/use-prescriptions'
import { useLabResults } from '@/hooks/use-lab-results'
import type { ApiPet } from '@/services/pets.service'
import type { ApiExamination } from '@/services/examinations.service'
import type { ApiVaccination } from '@/services/vaccinations.service'
import { prescriptionsService, type ApiPrescription } from '@/services/prescriptions.service'
import { labResultsService, type ApiLabResult } from '@/services/lab-results.service'
import { AddVaccinationDialog } from '@/components/patients/add-vaccination-dialog'
import { AddPrescriptionDialog } from '@/components/patients/add-prescription-dialog'
import { AddLabResultDialog } from '@/components/patients/add-lab-result-dialog'
import type { PetSpecies } from '@/types'
import {
  mockPets, mockExaminations, mockVaccinations, mockPrescriptions, mockLabResults,
} from '@/lib/mock-data'
import {
  formatDate, formatDateShort, calculateAge, speciesEmoji, speciesLabel,
  isVaccinationDueSoon, isVaccinationOverdue,
} from '@/lib/utils'
import {
  Phone, Mail, MapPin, Calendar, Cpu, Plus,
  AlertTriangle, CheckCircle2, Clock, FileText, FlaskConical,
  Stethoscope, Syringe, Pill,
} from 'lucide-react'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [labDialogOpen, setLabDialogOpen] = useState(false)
  const petQuery = usePet(id)
  const examinationsQuery = useExaminations({ petId: id, limit: 100 })
  const vaccinationsQuery = useVaccinations({ petId: id, limit: 100 })
  const prescriptionsQuery = usePrescriptions({ petId: id })
  const labResultsQuery = useLabResults({ petId: id })

  const fallbackPet = mockPets.find(p => p.id === id)
  const pet = petQuery.data ?? (petQuery.isError && fallbackPet ? mapMockPet(fallbackPet) : undefined)

  if (petQuery.isLoading) return <PatientDetailSkeleton />
  if (!pet) notFound()

  const petSpecies = normalizeSpecies(pet.species)
  const ownerName = pet.owner?.fullName ?? 'Sahip bilgisi yok'
  const ownerPhone = pet.owner?.phone
  const ownerEmail = pet.owner?.email

  const examinations = (examinationsQuery.data ?? (
    examinationsQuery.isError ? mockExaminations.filter(e => e.petId === id).map(mapMockExamination) : []
  )).sort((a, b) => new Date(examinationDate(b)).getTime() - new Date(examinationDate(a)).getTime())

  const vaccinations = (vaccinationsQuery.data ?? (
    vaccinationsQuery.isError ? mockVaccinations.filter(v => v.petId === id).map(mapMockVaccination) : []
  )).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

  const prescriptions = (prescriptionsQuery.data ?? (
    prescriptionsQuery.isError
      ? mockPrescriptions
        .filter(p => examinations.some(e => e.id === p.examinationId))
        .map(mapMockPrescription)
      : []
  ))

  const labResults = (labResultsQuery.data ?? (
    labResultsQuery.isError ? mockLabResults.filter(l => l.petId === id).map(mapMockLabResult) : []
  )).sort((a, b) => new Date(labDate(b)).getTime() - new Date(labDate(a)).getTime())

  const hasFallbackData = petQuery.isError || examinationsQuery.isError || vaccinationsQuery.isError ||
    prescriptionsQuery.isError || labResultsQuery.isError

  return (
    <div>
      <Header
        title={pet.name}
        subtitle={`${speciesLabel(petSpecies)} · ${pet.breed ?? 'Irk belirtilmemiş'}`}
        action={{ label: 'Yeni Muayene', href: `/examinations/new?petId=${pet.id}` }}
      />

      <div className="p-6 space-y-6">
        {hasFallbackData && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Bazı API kayıtları alınamadı; ilgili alanlarda örnek veriler gösteriliyor.
          </div>
        )}

        {/* Üst bilgi kartı */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hayvan profili */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl mb-3">
                  {speciesEmoji(petSpecies)}
                </div>
                <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{pet.breed ?? 'Irk belirtilmemiş'}</p>
                <Badge className="mt-2 bg-primary/10 text-primary border-0 hover:bg-primary/20">
                  {speciesLabel(petSpecies)}
                </Badge>
              </div>

              <div className="space-y-3">
                {pet.birthDate && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Doğum:</span>
                      <span className="font-medium ml-auto">{formatDate(pet.birthDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Yaş:</span>
                      <span className="font-medium ml-auto">{calculateAge(pet.birthDate)}</span>
                    </div>
                  </>
                )}
                {pet.microchipNo && (
                  <div className="flex items-center gap-3 text-sm">
                    <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Mikro Çip:</span>
                    <span className="font-mono text-xs font-medium ml-auto">{pet.microchipNo}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sahip bilgisi */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sahip Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-base font-semibold text-foreground">
                  {ownerName}
                </div>
              </div>
              <div className="space-y-2.5">
                {ownerPhone && (
                  <a href={`tel:${ownerPhone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{ownerPhone}</span>
                  </a>
                )}
                {ownerEmail && (
                  <a href={`mailto:${ownerEmail}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{ownerEmail}</span>
                  </a>
                )}
                {!ownerPhone && !ownerEmail && (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>İletişim bilgisi bulunmuyor</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Özet */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sağlık Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Muayene', value: examinations.length, icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Aşı', value: vaccinations.length, icon: Syringe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Reçete', value: prescriptions.length, icon: Pill, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                  { label: 'Lab Sonucu', value: labResults.length, icon: FlaskConical, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                ].map(s => (
                  <div key={s.label} className={`p-3 rounded-xl ${s.bg} flex flex-col gap-1`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sekmeli detay */}
        <Tabs defaultValue="examinations">
          <TabsList className="border border-border/50 bg-muted/50 p-1">
            <TabsTrigger value="examinations" className="gap-2 text-xs">
              <Stethoscope className="w-3.5 h-3.5" />
              Muayeneler ({examinations.length})
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="gap-2 text-xs">
              <Syringe className="w-3.5 h-3.5" />
              Aşılar ({vaccinations.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2 text-xs">
              <Pill className="w-3.5 h-3.5" />
              Reçeteler ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-2 text-xs">
              <FlaskConical className="w-3.5 h-3.5" />
              Lab ({labResults.length})
            </TabsTrigger>
          </TabsList>

          {/* Muayeneler */}
          <TabsContent value="examinations" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Link href={`/examinations/new?petId=${pet.id}`}>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Yeni Muayene
                </Button>
              </Link>
            </div>
            {examinations.length === 0 ? (
              <EmptyState icon={Stethoscope} message="Henüz muayene kaydı yok" />
            ) : (
              examinations.map(exam => (
                <Card key={exam.id} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{formatDate(examinationDate(exam))}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatVetName(exam.vet)}
                        </div>
                      </div>
                      {exam.followUpDate && (
                        <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-50">
                          Takip: {formatDateShort(exam.followUpDate)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Şikayet', value: exam.complaint },
                        { label: 'Bulgular', value: exam.findings },
                        { label: 'Değerlendirme', value: exam.assessment },
                        { label: 'Plan', value: exam.plan },
                      ].map(field => (
                        <div key={field.label}>
                          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                            {field.label}
                          </div>
                          <p className="text-sm text-foreground">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Aşılar */}
          <TabsContent value="vaccinations" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setVaccinationDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Aşı Ekle
              </Button>
            </div>
            {vaccinations.length === 0 ? (
              <EmptyState icon={Syringe} message="Henüz aşı kaydı yok" />
            ) : (
              <div className="space-y-3">
                {vaccinations.map(vac => {
                  const overdue = vac.dueAt ? isVaccinationOverdue(vac.dueAt) : false
                  const soon = vac.dueAt ? isVaccinationDueSoon(vac.dueAt) : false
                  return (
                    <Card key={vac.id} className="border-border/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${overdue ? 'bg-destructive/10' : soon ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                          {overdue
                            ? <AlertTriangle className="w-4 h-4 text-destructive" />
                            : soon
                              ? <Clock className="w-4 h-4 text-amber-500" />
                              : <CheckCircle2 className="w-4 h-4 text-primary" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">{vac.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {vac.notes ?? 'Not eklenmemiş'} {vac.lotNumber && `· Lot: ${vac.lotNumber}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Uygulandı</div>
                          <div className="text-sm font-medium">{formatDateShort(vac.appliedAt)}</div>
                          <div className={`text-xs mt-1 font-medium ${overdue ? 'text-destructive' : soon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            Sonraki: {vac.dueAt ? formatDateShort(vac.dueAt) : 'Belirtilmemiş'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Reçeteler */}
          <TabsContent value="prescriptions" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPrescriptionDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Reçete Yaz
              </Button>
            </div>
            {prescriptions.length === 0 ? (
              <EmptyState icon={FileText} message="Henüz reçete yok" />
            ) : (
              prescriptions.map(rx => (
                <Card key={rx.id} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold">{formatDate(prescriptionDate(rx))}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => window.open(prescriptionsService.getPdfUrl(rx.id), '_blank', 'noreferrer')}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        PDF İndir
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {rx.medications.map((med, index) => (
                        <div key={med.id ?? `${rx.id}-${index}`} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <Pill className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-foreground">{med.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {med.dose} · {med.frequency} · {med.duration}
                              {med.instructions && ` · ${med.instructions}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rx.notes && <p className="text-xs text-muted-foreground mt-3 italic">{rx.notes}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Lab */}
          <TabsContent value="lab" className="mt-4 space-y-3">
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setLabDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Sonuç Yükle
              </Button>
            </div>
            {labResults.length === 0 ? (
              <EmptyState icon={FlaskConical} message="Henüz lab sonucu yok" />
            ) : (
              labResults.map(lab => (
                <Card key={lab.id} className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-rose-500/10">
                      <FlaskConical className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{lab.testType}</div>
                      {lab.comment && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{lab.comment}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDateShort(labDate(lab))}</div>
                      {lab.fileUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary mt-1 h-auto p-0"
                          onClick={() => window.open(lab.fileUrl ?? labResultsService.getFileUrl(lab.id), '_blank', 'noreferrer')}
                        >
                          Dosyayı Gör
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddVaccinationDialog
        petId={id}
        open={vaccinationDialogOpen}
        onClose={() => setVaccinationDialogOpen(false)}
      />
      <AddPrescriptionDialog
        petId={id}
        open={prescriptionDialogOpen}
        onClose={() => setPrescriptionDialogOpen(false)}
      />
      <AddLabResultDialog
        petId={id}
        open={labDialogOpen}
        onClose={() => setLabDialogOpen(false)}
      />
    </div>
  )
}

function normalizeSpecies(species: string): PetSpecies {
  const normalized = species.toLowerCase()
  if (normalized === 'dog' || normalized === 'cat' || normalized === 'bird' || normalized === 'rabbit') {
    return normalized
  }
  return 'other'
}

function mapMockPet(pet: (typeof mockPets)[number]): ApiPet {
  return {
    id: pet.id,
    ownerId: pet.ownerId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.gender,
    birthDate: pet.birthDate,
    microchipNo: pet.microchipNo,
    createdAt: pet.createdAt,
    updatedAt: pet.createdAt,
    owner: {
      id: pet.ownerId,
      fullName: `${pet.owner.firstName} ${pet.owner.lastName}`,
      email: pet.owner.email,
      phone: pet.owner.phone,
    },
  }
}

function mapMockExamination(exam: (typeof mockExaminations)[number]): ApiExamination {
  return {
    id: exam.id,
    petId: exam.petId,
    vetId: exam.vetId,
    complaint: exam.complaint,
    findings: exam.findings,
    assessment: exam.assessment,
    plan: exam.plan,
    followUpDate: exam.followUpDate,
    createdAt: exam.createdAt,
    date: exam.date,
    vet: exam.vet,
  }
}

function mapMockVaccination(vac: (typeof mockVaccinations)[number]): ApiVaccination {
  return {
    id: vac.id,
    petId: vac.petId,
    vetId: vac.vetId,
    name: vac.vaccineName,
    lotNumber: vac.serialNo,
    appliedAt: vac.appliedDate,
    dueAt: vac.nextDate,
    notes: vac.manufacturer,
  }
}

function mapMockPrescription(rx: (typeof mockPrescriptions)[number]): ApiPrescription {
  return {
    id: rx.id,
    examinationId: rx.examinationId,
    vetId: rx.vetId,
    medications: rx.medications.map(med => ({
      id: med.id,
      name: med.drugName,
      dose: med.dose,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
    })),
    notes: rx.notes,
    date: rx.date,
  }
}

function mapMockLabResult(lab: (typeof mockLabResults)[number]): ApiLabResult {
  return {
    id: lab.id,
    petId: lab.petId,
    vetId: lab.vetId,
    testType: lab.testType,
    date: lab.date,
    fileUrl: lab.fileUrl,
    comment: lab.comment,
  }
}

function examinationDate(exam: ApiExamination): string {
  return exam.date ?? exam.createdAt
}

function prescriptionDate(rx: ApiPrescription): string {
  return rx.date ?? rx.createdAt ?? new Date().toISOString()
}

function labDate(lab: ApiLabResult): string {
  return lab.date ?? lab.createdAt ?? new Date().toISOString()
}

function formatVetName(vet: ApiExamination['vet']): string {
  if (!vet) return 'Veteriner bilgisi yok'
  if (vet.fullName) return `${vet.title ?? ''} ${vet.fullName}`.trim()
  return `${vet.title ?? ''} ${vet.firstName ?? ''} ${vet.lastName ?? ''}`.trim() || 'Veteriner bilgisi yok'
}

function PatientDetailSkeleton() {
  return (
    <div>
      <Header title="Hasta Detayı" subtitle="Yükleniyor..." />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-2xl bg-muted mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePet, useDeletePet } from '@/hooks/use-pets'
import { useExaminations } from '@/hooks/use-examinations'
import { useVaccinations } from '@/hooks/use-vaccinations'
import { usePrescriptions } from '@/hooks/use-prescriptions'
import { useLabResults } from '@/hooks/use-lab-results'
import type { ApiExamination } from '@/services/examinations.service'
import { prescriptionsService, type ApiPrescription } from '@/services/prescriptions.service'
import { labResultsService, type ApiLabResult } from '@/services/lab-results.service'
import { AddVaccinationDialog } from '@/components/patients/add-vaccination-dialog'
import { AddPrescriptionDialog } from '@/components/patients/add-prescription-dialog'
import { AddLabResultDialog } from '@/components/patients/add-lab-result-dialog'
import { EditPatientDialog } from '@/components/patients/edit-patient-dialog'
import { SendWhatsAppDialog } from '@/components/patients/send-whatsapp-dialog'
import type { PetSpecies } from '@/types'
import {
  formatDate, formatDateShort, calculateAge, speciesEmoji, speciesLabel,
  isVaccinationDueSoon, isVaccinationOverdue,
} from '@/lib/utils'
import {
  Phone, Mail, MapPin, Plus, Pencil, Trash2, MessageCircle,
  AlertTriangle, CheckCircle2, Clock, FileText, FlaskConical,
  Stethoscope, Syringe, Pill,
} from 'lucide-react'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [labDialogOpen, setLabDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deletePet = useDeletePet()

  const handleDelete = async () => {
    const petName = petQuery.data?.name ?? 'Hasta'
    await deletePet.mutateAsync(id)
    toast.success(`${petName} silindi`)
    router.push('/patients')
  }
  const petQuery = usePet(id)
  const examinationsQuery = useExaminations({ petId: id, limit: 100 })
  const vaccinationsQuery = useVaccinations({ petId: id, limit: 100 })
  const prescriptionsQuery = usePrescriptions({ petId: id })
  const labResultsQuery = useLabResults({ petId: id })

  const pet = petQuery.data

  if (petQuery.isLoading) return <PatientDetailSkeleton />
  if (!pet) notFound()

  const petSpecies = normalizeSpecies(pet.species)
  const ownerName = pet.owner?.fullName ?? 'Sahip bilgisi yok'
  const ownerPhone = pet.owner?.phone
  const ownerEmail = pet.owner?.email

  const examinations = (examinationsQuery.data ?? [])
    .sort((a, b) => new Date(examinationDate(b)).getTime() - new Date(examinationDate(a)).getTime())

  const vaccinations = (vaccinationsQuery.data ?? [])
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

  const prescriptions = prescriptionsQuery.data ?? []

  const labResults = (labResultsQuery.data ?? [])
    .sort((a, b) => new Date(labDate(b)).getTime() - new Date(labDate(a)).getTime())

  const hasApiError = examinationsQuery.isError || vaccinationsQuery.isError ||
    prescriptionsQuery.isError || labResultsQuery.isError

  return (
    <div>
      <Header
        title={pet.name}
        subtitle={`${speciesLabel(petSpecies)} · ${pet.breed ?? 'Irk belirtilmemiş'}`}
        action={{ label: 'Yeni Muayene', href: `/examinations/new?petId=${pet.id}` }}
      />
      {/* Düzenle + Sil butonları */}
      <div className="px-6 pt-2 flex justify-end gap-4">
        <button
          onClick={() => setEditDialogOpen(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Düzenle
        </button>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deletePet.isPending}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3" />
          {deletePet.isPending ? 'Siliniyor...' : 'Hastayı Sil'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {hasApiError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Bazı hasta kayıtları alınamadı. Lütfen API bağlantısını kontrol edip tekrar deneyin.
          </div>
        )}

        {/* Hero profil kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
          {/* Üst bant */}
          <div className="h-20 bg-gradient-to-r from-primary/80 to-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-8 h-8 rounded-full bg-white" style={{ top: `${(i * 37) % 80}%`, left: `${(i * 53 + 10) % 100}%` }} />
              ))}
            </div>
          </div>
          <div className="px-6 pb-6">
            {/* Avatar + ad */}
            <div className="flex items-end gap-5 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md border-4 border-white flex items-center justify-center text-5xl overflow-hidden flex-shrink-0">
                {pet.photoUrl
                  ? <Image src={pet.photoUrl} alt={pet.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                  : speciesEmoji(petSpecies)
                }
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
                <p className="text-sm text-muted-foreground">{pet.breed ?? 'Irk belirtilmemiş'}</p>
              </div>
              <div className="ml-auto pb-1 flex gap-2">
                <Badge className="bg-primary/10 text-primary border-0">{speciesLabel(petSpecies)}</Badge>
              </div>
            </div>

            {/* Info satırları */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pet.birthDate && (
                <>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Doğum Tarihi</div>
                    <div className="text-sm font-semibold text-foreground">{formatDate(pet.birthDate)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Yaş</div>
                    <div className="text-sm font-semibold text-foreground">{calculateAge(pet.birthDate)}</div>
                  </div>
                </>
              )}
              {pet.microchipNo && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-1">Mikro Çip</div>
                  <div className="text-xs font-mono font-semibold text-foreground truncate">{pet.microchipNo}</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-1">Kayıt Tarihi</div>
                <div className="text-sm font-semibold text-foreground">{formatDate(pet.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sahip + özet kartları */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sahip bilgisi */}
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sahip Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {ownerName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">{ownerName}</div>
              </div>
              <div className="space-y-2">
                {ownerPhone && (
                  <a href={`tel:${ownerPhone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{ownerPhone}</span>
                  </a>
                )}
                {ownerPhone && (
                  <button
                    type="button"
                    onClick={() => setWhatsappDialogOpen(true)}
                    className="flex w-full items-center gap-3 text-sm text-left hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>WhatsApp Gönder</span>
                  </button>
                )}
                {ownerEmail && (
                  <a href={`mailto:${ownerEmail}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{ownerEmail}</span>
                  </a>
                )}
                {!ownerPhone && !ownerEmail && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground p-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>İletişim bilgisi bulunmuyor</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Özet */}
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
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
          <TabsList className="bg-white border border-gray-100 shadow-sm p-1 rounded-xl">
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
                <Card key={exam.id} className="bg-white border-0 shadow-sm rounded-2xl">
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
                    <Card key={vac.id} className="bg-white border-0 shadow-sm rounded-2xl">
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
                <Card key={rx.id} className="bg-white border-0 shadow-sm rounded-2xl">
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
                <Card key={lab.id} className="bg-white border-0 shadow-sm rounded-2xl">
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
        petName={pet.name}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
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
        <EditPatientDialog
          pet={pet}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
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
              <strong>{pet.name}</strong> adlı hasta ve tüm kayıtları (muayene, aşı, reçete, lab) silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePet.isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <Card key={index} className="bg-white border-0 shadow-sm rounded-2xl">
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

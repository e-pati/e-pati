'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  mockPets, mockExaminations, mockVaccinations, mockPrescriptions, mockLabResults,
} from '@/lib/mock-data'
import {
  formatDate, formatDateShort, calculateAge, speciesEmoji, speciesLabel,
  isVaccinationDueSoon, isVaccinationOverdue,
} from '@/lib/utils'
import {
  Phone, Mail, MapPin, Calendar, Weight, Cpu, Plus,
  AlertTriangle, CheckCircle2, Clock, FileText, FlaskConical,
  Stethoscope, Syringe, Pill,
} from 'lucide-react'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const pet = mockPets.find(p => p.id === id)
  if (!pet) notFound()

  const examinations = mockExaminations.filter(e => e.petId === id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const vaccinations = mockVaccinations.filter(v => v.petId === id).sort(
    (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  )
  const prescriptions = mockPrescriptions.filter(p =>
    examinations.some(e => e.id === p.examinationId)
  )
  const labResults = mockLabResults.filter(l => l.petId === id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <Header
        title={pet.name}
        subtitle={`${speciesLabel(pet.species)} · ${pet.breed}`}
        action={{ label: 'Yeni Muayene', href: `/examinations/new?petId=${pet.id}` }}
      />

      <div className="p-6 space-y-6">
        {/* Üst bilgi kartı */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hayvan profili */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl mb-3">
                  {speciesEmoji(pet.species)}
                </div>
                <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{pet.breed}</p>
                <Badge className="mt-2 bg-primary/10 text-primary border-0 hover:bg-primary/20">
                  {speciesLabel(pet.species)}
                </Badge>
              </div>

              <div className="space-y-3">
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
                {pet.weight && (
                  <div className="flex items-center gap-3 text-sm">
                    <Weight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Ağırlık:</span>
                    <span className="font-medium ml-auto">{pet.weight} kg</span>
                  </div>
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
                  {pet.owner.firstName} {pet.owner.lastName}
                </div>
              </div>
              <div className="space-y-2.5">
                <a href={`tel:${pet.owner.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{pet.owner.phone}</span>
                </a>
                <a href={`mailto:${pet.owner.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{pet.owner.email}</span>
                </a>
                {pet.owner.address && (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{pet.owner.address}</span>
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
                        <div className="text-sm font-semibold text-foreground">{formatDate(exam.date)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {exam.vet?.title} {exam.vet?.firstName} {exam.vet?.lastName}
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
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Aşı Ekle
              </Button>
            </div>
            {vaccinations.length === 0 ? (
              <EmptyState icon={Syringe} message="Henüz aşı kaydı yok" />
            ) : (
              <div className="space-y-3">
                {vaccinations.map(vac => {
                  const overdue = isVaccinationOverdue(vac.nextDate)
                  const soon = isVaccinationDueSoon(vac.nextDate)
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
                          <div className="font-medium text-sm text-foreground">{vac.vaccineName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {vac.manufacturer} {vac.serialNo && `· Seri: ${vac.serialNo}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Uygulandı</div>
                          <div className="text-sm font-medium">{formatDateShort(vac.appliedDate)}</div>
                          <div className={`text-xs mt-1 font-medium ${overdue ? 'text-destructive' : soon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            Sonraki: {formatDateShort(vac.nextDate)}
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
            {prescriptions.length === 0 ? (
              <EmptyState icon={FileText} message="Henüz reçete yok" />
            ) : (
              prescriptions.map(rx => (
                <Card key={rx.id} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold">{formatDate(rx.date)}</div>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        PDF İndir
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {rx.medications.map(med => (
                        <div key={med.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <Pill className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-foreground">{med.drugName}</div>
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
              <Button size="sm" variant="outline" className="gap-1.5">
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
                      <div className="text-sm font-medium">{formatDateShort(lab.date)}</div>
                      {lab.fileUrl && (
                        <Button variant="ghost" size="sm" className="text-xs text-primary mt-1 h-auto p-0">
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

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRegistryAnimal } from '@/hooks/use-registry'
import type { AnimalClass, AnimalStatus, MovementReason, PremiseType } from '@/services/registry.service'
import { ArrowLeft, Fingerprint, MapPin, PawPrint, Route, Tag } from 'lucide-react'

const animalClassLabels: Record<AnimalClass, string> = {
  PET: 'Evcil',
  CATTLE: 'Buyukbas',
  SMALL_RUMINANT: 'Kucukbas',
  STRAY: 'Sokak',
  SERVICE: 'Gorev',
}

const animalStatusLabels: Record<AnimalStatus, string> = {
  ACTIVE: 'Aktif',
  LOST: 'Kayip',
  ADOPTED: 'Sahiplenildi',
  SOLD: 'Satildi',
  TRANSFERRED: 'Transfer',
  DECEASED: 'Vefat',
  ARCHIVED: 'Arsiv',
}

const premiseTypeLabels: Record<PremiseType, string> = {
  FARM: 'Isletme',
  SHELTER: 'Barinak',
  CLINIC: 'Klinik',
  OWNER_HOME: 'Sahip Adresi',
  MUNICIPAL_FEEDING_POINT: 'Beslenme Noktasi',
  PUBLIC_INSTITUTION: 'Kamu Kurumu',
}

const movementReasonLabels: Record<MovementReason, string> = {
  BIRTH: 'Dogum',
  SALE: 'Satis',
  TRANSFER: 'Transfer',
  SHELTER_INTAKE: 'Barinak Girisi',
  ADOPTION: 'Sahiplendirme',
  TREATMENT: 'Tedavi',
  RETURN_TO_AREA: 'Bolgeye Donus',
  DEATH: 'Olum',
  OTHER: 'Diger',
}

export default function RegistryAnimalDetailPage() {
  const params = useParams<{ id: string }>()
  const animalQuery = useRegistryAnimal(params.id)
  const animal = animalQuery.data

  return (
    <div>
      <Header
        title={animal?.name ?? animal?.hkn ?? 'Hayvan Kaydı'}
        subtitle={animal ? `${animal.hkn} · ${animal.species}${animal.breed ? ` / ${animal.breed}` : ''}` : 'Ulusal kayıt detayı'}
      />

      <div className="p-6 space-y-6">
        <Link href="/registry" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Ulusal kayda dön
        </Link>

        {animalQuery.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : !animal ? (
          <div className="bg-white rounded-2xl border border-gray-100/70 shadow-sm p-8 text-sm text-muted-foreground">
            Hayvan kaydı bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
                <div className="p-6 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <PawPrint className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-foreground">{animal.name ?? animal.hkn}</h2>
                      <Badge variant="secondary">{animalClassLabels[animal.class]}</Badge>
                      <Badge variant={animal.status === 'ACTIVE' ? 'outline' : 'destructive'}>
                        {animalStatusLabels[animal.status]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <Info label="HKN" value={animal.hkn} />
                      <Info label="Tür" value={animal.species} />
                      <Info label="Irk" value={animal.breed ?? '-'} />
                      <Info label="Kayıt Tarihi" value={formatDate(animal.createdAt)} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Hareket Zaman Çizelgesi</h2>
                </div>
                <div className="p-6">
                  {animal.movements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Hareket kaydı yok.</p>
                  ) : (
                    <div className="space-y-4">
                      {animal.movements.map((movement, index) => (
                        <div key={movement.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Route className="w-4 h-4 text-primary" />
                            </div>
                            {index < animal.movements.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{movementReasonLabels[movement.reason]}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(movement.occurredAt)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {movement.fromPremise?.name ?? 'Başlangıç yok'} → {movement.toPremise?.name ?? 'Varış yok'}
                            </div>
                            {movement.notes && <p className="text-xs text-muted-foreground mt-1">{movement.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </main>

            <aside className="space-y-6">
              <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Mevcut Konum</h2>
                </div>
                <div className="p-5">
                  {animal.currentPremise ? (
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">{animal.currentPremise.name}</div>
                      <Badge variant="secondary">{premiseTypeLabels[animal.currentPremise.type]}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {animal.currentPremise.province} / {animal.currentPremise.district}
                      </div>
                      {animal.currentPremise.ministryCode && (
                        <div className="text-xs text-muted-foreground">{animal.currentPremise.ministryCode}</div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Konum bilgisi yok.</p>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Kimlikler</h2>
                </div>
                <div className="p-5 space-y-3">
                  {animal.identifiers.map(identifier => (
                    <div key={identifier.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{identifier.type}</span>
                          {identifier.isPrimary && <Badge variant="outline">Birincil</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground break-all">{identifier.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground font-semibold">{label}</div>
      <div className="text-sm text-foreground truncate">{value}</div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

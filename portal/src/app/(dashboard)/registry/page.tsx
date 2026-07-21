'use client'

import { FormEvent, ReactNode, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreateRegistryAnimal,
  useCreateRegistryPremise,
  useRecordRegistryMovement,
  useRegistryAnimals,
  useRegistryOverview,
  useRegistryPremises,
} from '@/hooks/use-registry'
import type {
  AnimalClass,
  AnimalStatus,
  MovementReason,
  PremiseType,
  RegistryAnimal,
  RegistryPremise,
} from '@/services/registry.service'
import { Activity, Building2, Database, MapPin, PawPrint, Plus } from 'lucide-react'
import { toast } from 'sonner'

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

export default function RegistryPage() {
  const overviewQuery = useRegistryOverview()
  const animalsQuery = useRegistryAnimals()
  const premisesQuery = useRegistryPremises()

  const totalAnimals = overviewQuery.data?.animalsByClass.reduce((sum, item) => sum + item.count, 0) ?? 0
  const activeAnimals = overviewQuery.data?.animalsByStatus.find(item => item.status === 'ACTIVE')?.count ?? 0
  const premiseCount = overviewQuery.data?.premiseCount ?? 0
  const animals = animalsQuery.data ?? []
  const premises = premisesQuery.data ?? []
  const isLoading = overviewQuery.isLoading || animalsQuery.isLoading || premisesQuery.isLoading

  return (
    <div>
      <Header
        title="Ulusal Kayıt"
        subtitle="Hayvan kimlikleri, işletmeler ve hareket kayıtları"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Toplam Hayvan"
            value={totalAnimals}
            icon={PawPrint}
            loading={isLoading}
          />
          <MetricCard
            title="Aktif Kayıt"
            value={activeAnimals}
            icon={Activity}
            loading={isLoading}
          />
          <MetricCard
            title="İşletme / Barınak"
            value={premiseCount}
            icon={Building2}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100/70 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Son Kayıtlar</h2>
                <p className="text-xs text-muted-foreground mt-1">HKN, kimlik ve mevcut konum özeti</p>
              </div>
              <Database className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4">
                    <Skeleton className="h-14 rounded-xl" />
                  </div>
                ))
              ) : animals.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Kayıtlı hayvan bulunamadı</div>
              ) : (
                animals.slice(0, 8).map(animal => (
                  <Link key={animal.id} href={`/registry/animals/${animal.id}`} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{animal.name ?? animal.hkn}</span>
                        <Badge variant="secondary">{animalClassLabels[animal.class]}</Badge>
                        <Badge variant={animal.status === 'ACTIVE' ? 'outline' : 'destructive'}>
                          {animalStatusLabels[animal.status]}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {animal.hkn} · {animal.species}{animal.breed ? ` / ${animal.breed}` : ''}
                      </div>
                    </div>
                    <div className="hidden md:block text-right text-xs text-muted-foreground max-w-48">
                      {animal.currentPremise ? (
                        <>
                          <div className="font-medium text-foreground truncate">{animal.currentPremise.name}</div>
                          <div>{animal.currentPremise.province} / {animal.currentPremise.district}</div>
                        </>
                      ) : (
                        'Konum yok'
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <PremiseForm />
            <AnimalForm premises={premises} />
            <MovementForm animals={animals} premises={premises} />

            <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-foreground">Sınıf Dağılımı</h2>
              </div>
              <div className="p-5 space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-8" />)
                ) : (
                  overviewQuery.data?.animalsByClass.map(item => (
                    <div key={item.class} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{animalClassLabels[item.class]}</span>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-foreground">İşletmeler</h2>
              </div>
              <div className="p-5 space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)
                ) : premises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Kayıtlı işletme yok</p>
                ) : (
                  premises.slice(0, 5).map(premise => (
                    <div key={premise.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mt-0.5">
                        <MapPin className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{premise.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {premiseTypeLabels[premise.type]} · {premise.province} / {premise.district}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

function PremiseForm() {
  const createPremise = useCreateRegistryPremise()
  const [form, setForm] = useState({
    type: 'FARM' as PremiseType,
    name: '',
    province: 'Ankara',
    district: 'Cankaya',
    ministryCode: '',
    capacity: '',
  })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createPremise.mutateAsync({
        type: form.type,
        name: form.name,
        province: form.province,
        district: form.district,
        ministryCode: form.ministryCode || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      })
      toast.success('İşletme kaydı oluşturuldu')
      setForm(current => ({ ...current, name: '', ministryCode: '', capacity: '' }))
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'İşletme kaydı oluşturulamadı')
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-foreground">İşletme / Barınak Ekle</h2>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tip">
            <select
              value={form.type}
              onChange={event => setForm({ ...form, type: event.target.value as PremiseType })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="FARM">İşletme</option>
              <option value="SHELTER">Barınak</option>
              <option value="CLINIC">Klinik</option>
              <option value="MUNICIPAL_FEEDING_POINT">Beslenme Noktası</option>
            </select>
          </Field>
          <Field label="Kapasite">
            <Input
              type="number"
              min="0"
              value={form.capacity}
              onChange={event => setForm({ ...form, capacity: event.target.value })}
              placeholder="120"
            />
          </Field>
        </div>

        <Field label="Ad">
          <Input
            required
            value={form.name}
            onChange={event => setForm({ ...form, name: event.target.value })}
            placeholder="Çankaya Demo İşletmesi"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="İl">
            <Input
              required
              value={form.province}
              onChange={event => setForm({ ...form, province: event.target.value })}
            />
          </Field>
          <Field label="İlçe">
            <Input
              required
              value={form.district}
              onChange={event => setForm({ ...form, district: event.target.value })}
            />
          </Field>
        </div>

        <Field label="Bakanlık Kodu">
          <Input
            value={form.ministryCode}
            onChange={event => setForm({ ...form, ministryCode: event.target.value })}
            placeholder="TR-06-CNK-0002"
          />
        </Field>

        <Button type="submit" className="w-full" disabled={createPremise.isPending}>
          <Plus className="w-4 h-4" />
          Kaydet
        </Button>
      </form>
    </section>
  )
}

function AnimalForm({ premises }: { premises: Array<{ id: string; name: string }> }) {
  const createAnimal = useCreateRegistryAnimal()
  const [form, setForm] = useState({
    class: 'CATTLE' as AnimalClass,
    name: '',
    species: 'Cattle',
    breed: '',
    sex: 'UNKNOWN' as 'MALE' | 'FEMALE' | 'UNKNOWN',
    hkn: '',
    identifierType: 'EAR_TAG' as 'MICROCHIP' | 'EAR_TAG' | 'PASSPORT' | 'QR_TAG',
    identifierValue: '',
    currentPremiseId: '',
  })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createAnimal.mutateAsync({
        hkn: form.hkn || undefined,
        class: form.class,
        name: form.name || undefined,
        species: form.species,
        breed: form.breed || undefined,
        sex: form.sex,
        currentPremiseId: form.currentPremiseId || undefined,
        identifiers: form.identifierValue
          ? [{ type: form.identifierType, value: form.identifierValue }]
          : undefined,
      })
      toast.success('Hayvan kaydı oluşturuldu')
      setForm(current => ({
        ...current,
        name: '',
        hkn: '',
        identifierValue: '',
      }))
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Hayvan kaydı oluşturulamadı')
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-foreground">Hayvan Kaydı Ekle</h2>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sınıf">
            <select
              value={form.class}
              onChange={event => setForm({ ...form, class: event.target.value as AnimalClass })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="CATTLE">Büyükbaş</option>
              <option value="SMALL_RUMINANT">Küçükbaş</option>
              <option value="STRAY">Sokak</option>
              <option value="PET">Evcil</option>
              <option value="SERVICE">Görev</option>
            </select>
          </Field>
          <Field label="Cinsiyet">
            <select
              value={form.sex}
              onChange={event => setForm({ ...form, sex: event.target.value as 'MALE' | 'FEMALE' | 'UNKNOWN' })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="UNKNOWN">Bilinmiyor</option>
              <option value="FEMALE">Dişi</option>
              <option value="MALE">Erkek</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad">
            <Input
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              placeholder="Anka-002"
            />
          </Field>
          <Field label="Tür">
            <Input
              required
              value={form.species}
              onChange={event => setForm({ ...form, species: event.target.value })}
              placeholder="Cattle"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Irk">
            <Input
              value={form.breed}
              onChange={event => setForm({ ...form, breed: event.target.value })}
              placeholder="Holstein"
            />
          </Field>
          <Field label="HKN">
            <Input
              value={form.hkn}
              onChange={event => setForm({ ...form, hkn: event.target.value })}
              placeholder="Boşsa otomatik"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kimlik Tipi">
            <select
              value={form.identifierType}
              onChange={event => setForm({ ...form, identifierType: event.target.value as 'MICROCHIP' | 'EAR_TAG' | 'PASSPORT' | 'QR_TAG' })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="EAR_TAG">Küpe</option>
              <option value="MICROCHIP">Mikroçip</option>
              <option value="PASSPORT">Pasaport</option>
              <option value="QR_TAG">QR Etiket</option>
            </select>
          </Field>
          <Field label="Kimlik No">
            <Input
              value={form.identifierValue}
              onChange={event => setForm({ ...form, identifierValue: event.target.value })}
              placeholder="TR060000000002"
            />
          </Field>
        </div>

        <Field label="Konum">
          <select
            value={form.currentPremiseId}
            onChange={event => setForm({ ...form, currentPremiseId: event.target.value })}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Konum yok</option>
            {premises.map(premise => (
              <option key={premise.id} value={premise.id}>{premise.name}</option>
            ))}
          </select>
        </Field>

        <Button type="submit" className="w-full" disabled={createAnimal.isPending}>
          <Plus className="w-4 h-4" />
          Kaydet
        </Button>
      </form>
    </section>
  )
}

function MovementForm({
  animals,
  premises,
}: {
  animals: RegistryAnimal[]
  premises: RegistryPremise[]
}) {
  const recordMovement = useRecordRegistryMovement()
  const [form, setForm] = useState({
    animalId: '',
    reason: 'TRANSFER' as MovementReason,
    fromPremiseId: '',
    toPremiseId: '',
    occurredAt: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await recordMovement.mutateAsync({
        animalId: form.animalId,
        reason: form.reason,
        occurredAt: new Date(form.occurredAt).toISOString(),
        fromPremiseId: form.fromPremiseId || undefined,
        toPremiseId: form.toPremiseId || undefined,
        notes: form.notes || undefined,
      })
      toast.success('Hareket kaydı oluşturuldu')
      setForm(current => ({ ...current, notes: '' }))
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Hareket kaydı oluşturulamadı')
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100/70 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-foreground">Hareket Kaydı</h2>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <Field label="Hayvan">
          <select
            required
            value={form.animalId}
            onChange={event => setForm({ ...form, animalId: event.target.value })}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Seçin</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.name ?? animal.hkn} · {animal.hkn}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Neden">
            <select
              value={form.reason}
              onChange={event => setForm({ ...form, reason: event.target.value as MovementReason })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="TRANSFER">Transfer</option>
              <option value="SALE">Satış</option>
              <option value="SHELTER_INTAKE">Barınak Girişi</option>
              <option value="ADOPTION">Sahiplendirme</option>
              <option value="TREATMENT">Tedavi</option>
              <option value="RETURN_TO_AREA">Bölgeye Dönüş</option>
              <option value="BIRTH">Doğum</option>
              <option value="DEATH">Ölüm</option>
              <option value="OTHER">Diğer</option>
            </select>
          </Field>
          <Field label="Tarih">
            <Input
              type="date"
              required
              value={form.occurredAt}
              onChange={event => setForm({ ...form, occurredAt: event.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Çıkış">
            <select
              value={form.fromPremiseId}
              onChange={event => setForm({ ...form, fromPremiseId: event.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Yok</option>
              {premises.map(premise => (
                <option key={premise.id} value={premise.id}>{premise.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Varış">
            <select
              value={form.toPremiseId}
              onChange={event => setForm({ ...form, toPremiseId: event.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Yok</option>
              {premises.map(premise => (
                <option key={premise.id} value={premise.id}>{premise.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Not">
          <Input
            value={form.notes}
            onChange={event => setForm({ ...form, notes: event.target.value })}
            placeholder="Nakil, tedavi veya sahiplendirme notu"
          />
        </Field>

        <Button type="submit" className="w-full" disabled={recordMovement.isPending || animals.length === 0}>
          <Plus className="w-4 h-4" />
          Kaydet
        </Button>
      </form>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string
  value: number
  icon: typeof PawPrint
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/70 shadow-sm p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-foreground">{value}</div>}
      <div className="text-xs text-muted-foreground mt-1">{title}</div>
    </div>
  )
}

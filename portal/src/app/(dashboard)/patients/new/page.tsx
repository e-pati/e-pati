'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowLeft,
  CheckCircle2,
  CircleUserRound,
  Fingerprint,
  ImagePlus,
  Info,
  LoaderCircle,
  Mail,
  PawPrint,
  Phone,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreatePet } from '@/hooks/use-pets'
import { cn } from '@/lib/utils'
import { uploadsService } from '@/services/uploads.service'

const schema = z.object({
  name: z.string().trim().min(2, 'Hayvan adı en az 2 karakter olmalı'),
  species: z.string().min(1, 'Lütfen bir tür seçin'),
  breed: z.string().trim().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  birthDate: z.string().optional(),
  microchipNo: z.string().trim().optional(),
  photoUrl: z.string().url('Geçerli bir görsel bağlantısı girin').optional().or(z.literal('')),
  ownerFullName: z.string().trim().optional(),
  ownerEmail: z.string().email('Geçerli bir e-posta adresi girin').optional().or(z.literal('')),
  ownerPhone: z.string().trim().optional(),
})

type FormData = z.infer<typeof schema>

const SPECIES = [
  { value: 'Cat', label: 'Kedi' },
  { value: 'Dog', label: 'Köpek' },
  { value: 'Bird', label: 'Kuş' },
  { value: 'Rabbit', label: 'Tavşan' },
  { value: 'Other', label: 'Diğer' },
]

const SEX_OPTIONS = [
  { value: 'FEMALE', label: 'Dişi' },
  { value: 'MALE', label: 'Erkek' },
  { value: 'UNKNOWN', label: 'Belirtilmemiş' },
] as const

export default function NewPatientPage() {
  const router = useRouter()
  const createPet = useCreatePet()
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      species: '',
      sex: 'UNKNOWN',
      breed: '',
      birthDate: '',
      microchipNo: '',
      photoUrl: '',
      ownerFullName: '',
      ownerEmail: '',
      ownerPhone: '',
    },
  })

  const patientName = useWatch({ control, name: 'name' }) ?? ''
  const selectedSpecies = useWatch({ control, name: 'species' }) ?? ''
  const selectedSex = useWatch({ control, name: 'sex' }) ?? 'UNKNOWN'
  const ownerName = useWatch({ control, name: 'ownerFullName' }) ?? ''
  const speciesLabel = SPECIES.find(item => item.value === selectedSpecies)?.label
  const busy = isSubmitting || createPet.isPending
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    try {
      const uploadedPhotoUrl = photoFile
        ? await uploadsService.uploadFile(photoFile, 'pets')
        : undefined

      const pet = await createPet.mutateAsync({
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        sex: data.sex,
        birthDate: data.birthDate || undefined,
        microchipNo: data.microchipNo || undefined,
        photoUrl: uploadedPhotoUrl ?? (data.photoUrl || undefined),
        ownerFullName: data.ownerFullName || undefined,
        ownerEmail: data.ownerEmail || undefined,
        ownerPhone: data.ownerPhone || undefined,
      })

      setDone(true)
      toast.success(`${pet.name} başarıyla kaydedildi`)
      window.setTimeout(() => router.push(`/patients/${pet.id}`), 1000)
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message
      const resolvedMessage = Array.isArray(message) ? message.join(' ') : message
      const fallback = 'Hasta kaydı oluşturulamadı. Bilgileri kontrol edip yeniden deneyin.'
      setSubmitError(resolvedMessage ?? fallback)
      toast.error(resolvedMessage ?? fallback)
    }
  }

  const selectPhoto = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin.')
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setValue('photoUrl', '')
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  if (done) {
    return (
      <div data-testid="patient-create-success" className="min-h-full">
        <Header title="Yeni Hasta" subtitle="Klinik hasta kaydı" />
        <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1600px] items-center justify-center p-4 sm:p-6 lg:p-8">
          <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-950">Hasta kaydı oluşturuldu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {patientName || 'Yeni hasta'} için klinik dosyası hazırlandı. Hasta detayına yönlendiriliyorsunuz.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-teal-700">
              <LoaderCircle className="size-4 animate-spin" /> Klinik dosyası açılıyor
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div data-testid="patient-create-page" className="min-h-full">
      <Header title="Yeni Hasta" subtitle="Klinik hasta kaydı oluşturun" />

      <main className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/patients"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="size-4" /> Hasta dizinine dön
          </Link>
          <p className="text-xs text-slate-500"><span className="font-semibold text-red-600">*</span> Zorunlu alan</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <PawPrint className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">Yeni klinik dosyası</h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                Hayvanın temel kimlik bilgilerini kaydedin. Sahip ve fotoğraf bilgilerini şimdi ekleyebilir veya daha sonra hasta dosyasından tamamlayabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section aria-labelledby="patient-identity-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="patient-identity-title"
                  icon={Fingerprint}
                  title="Hayvan kimliği"
                  description="Klinik dosyasının temel tanımlama bilgileri"
                  required
                />

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <Field label="Hayvan adı" required error={errors.name?.message} htmlFor="name">
                    <Input
                      id="name"
                      autoComplete="off"
                      placeholder="Örn. Pamuk"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      {...register('name')}
                      className={fieldClass(Boolean(errors.name))}
                    />
                  </Field>

                  <Field label="Tür" required error={errors.species?.message} htmlFor="species">
                    <Select
                      value={selectedSpecies}
                      onValueChange={value => {
                        if (value) setValue('species', value, { shouldValidate: true })
                      }}
                    >
                      <SelectTrigger
                        id="species"
                        aria-invalid={Boolean(errors.species)}
                        aria-describedby={errors.species ? 'species-error' : undefined}
                        className={fieldClass(Boolean(errors.species))}
                      >
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIES.map(item => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Irk" hint="Bilinmiyorsa boş bırakabilirsiniz." htmlFor="breed">
                    <Input id="breed" placeholder="Örn. British Shorthair" {...register('breed')} className={fieldClass()} />
                  </Field>

                  <Field label="Cinsiyet" htmlFor="sex">
                    <Select
                      value={selectedSex}
                      onValueChange={value => {
                        if (value) setValue('sex', value as FormData['sex'])
                      }}
                    >
                      <SelectTrigger id="sex" className={fieldClass()}>
                        <SelectValue>
                          {SEX_OPTIONS.find(item => item.value === selectedSex)?.label ?? 'Belirtilmemiş'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SEX_OPTIONS.map(item => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Doğum tarihi" htmlFor="birthDate">
                    <Input id="birthDate" type="date" max={today} {...register('birthDate')} className={fieldClass()} />
                  </Field>

                  <Field label="Mikroçip numarası" hint="Varsa resmî mikroçip numarasını girin." htmlFor="microchipNo">
                    <Input
                      id="microchipNo"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="15 haneli numara"
                      {...register('microchipNo')}
                      className={cn(fieldClass(), 'font-mono')}
                    />
                  </Field>
                </div>
              </section>

              <section aria-labelledby="owner-information-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="owner-information-title"
                  icon={CircleUserRound}
                  title="Sahip bilgileri"
                  description="İletişim ve mobil hesap eşleştirme bilgileri"
                />

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <Field label="Ad soyad" htmlFor="ownerFullName" className="sm:col-span-2">
                    <div className="relative">
                      <CircleUserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input id="ownerFullName" autoComplete="name" placeholder="Örn. Ayşe Yılmaz" {...register('ownerFullName')} className={cn(fieldClass(), 'pl-10')} />
                    </div>
                  </Field>

                  <Field label="Telefon" htmlFor="ownerPhone">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input id="ownerPhone" type="tel" autoComplete="tel" placeholder="05xx xxx xx xx" {...register('ownerPhone')} className={cn(fieldClass(), 'pl-10')} />
                    </div>
                  </Field>

                  <Field label="E-posta" error={errors.ownerEmail?.message} htmlFor="ownerEmail">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="ownerEmail"
                        type="email"
                        autoComplete="email"
                        placeholder="sahip@example.com"
                        aria-invalid={Boolean(errors.ownerEmail)}
                        aria-describedby={errors.ownerEmail ? 'ownerEmail-error' : undefined}
                        {...register('ownerEmail')}
                        className={cn(fieldClass(Boolean(errors.ownerEmail)), 'pl-10')}
                      />
                    </div>
                  </Field>

                  <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3.5 sm:col-span-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-blue-700" />
                    <p className="text-xs leading-5 text-blue-900">
                      E-posta bilgisi, sahibin mobil hesabıyla kayıt eşleştirmesinde kullanılabilir. Sahip bilgileri bilinmiyorsa bu bölüm boş bırakılabilir.
                    </p>
                  </div>
                </div>
              </section>

              <section aria-labelledby="patient-photo-title" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SectionHeader
                  id="patient-photo-title"
                  icon={ImagePlus}
                  title="Hasta fotoğrafı"
                  description="Hasta dosyasında kullanılacak güncel görsel"
                />

                <div className="p-5 sm:p-6">
                  <div
                    onDragEnter={event => { event.preventDefault(); setIsDragging(true) }}
                    onDragOver={event => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={event => {
                      event.preventDefault()
                      setIsDragging(false)
                      selectPhoto(event.dataTransfer.files?.[0])
                    }}
                    className={cn(
                      'flex flex-col gap-5 rounded-xl border border-dashed p-4 transition-colors sm:flex-row sm:items-center sm:p-5',
                      isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-300 bg-slate-50/70',
                    )}
                  >
                    <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="Seçilen hasta fotoğrafı" className="size-full object-cover" />
                      ) : (
                        <PawPrint className="size-8" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {photoFile ? photoFile.name : 'Görseli sürükleyin veya bilgisayarınızdan seçin'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG veya desteklenen bir görsel dosyası kullanabilirsiniz.</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <label className={cn(buttonVariants({ variant: 'outline' }), 'h-11 cursor-pointer gap-2 rounded-lg border-slate-200 px-4 text-xs')}>
                          <UploadCloud className="size-4" /> Görsel seç
                          <input type="file" accept="image/*" className="sr-only" onChange={event => selectPhoto(event.target.files?.[0])} />
                        </label>
                        {photoFile && (
                          <Button type="button" variant="ghost" onClick={clearPhoto} className="h-11 gap-2 rounded-lg px-4 text-xs text-slate-600">
                            <X className="size-4" /> Kaldır
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!photoFile && (
                    <details className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-600">Harici görsel bağlantısı kullan</summary>
                      <div className="mt-4">
                        <Field label="Fotoğraf URL" error={errors.photoUrl?.message} htmlFor="photoUrl">
                          <Input
                            id="photoUrl"
                            type="url"
                            inputMode="url"
                            placeholder="https://..."
                            aria-invalid={Boolean(errors.photoUrl)}
                            aria-describedby={errors.photoUrl ? 'photoUrl-error' : undefined}
                            {...register('photoUrl')}
                            className={fieldClass(Boolean(errors.photoUrl))}
                          />
                        </Field>
                      </div>
                    </details>
                  )}
                </div>
              </section>

              {submitError && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <p className="leading-5">{submitError}</p>
                </div>
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <p className="text-xs font-medium text-slate-500">Kayıt özeti</p>
                <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                  {patientName.trim() || 'Yeni hasta'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{speciesLabel || 'Tür henüz seçilmedi'}</p>

                <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                  <SummaryRow icon={Fingerprint} label="Kimlik bilgileri" value="Zorunlu" />
                  <SummaryRow icon={CircleUserRound} label="Sahip bilgisi" value={ownerName?.trim() ? 'Eklendi' : 'Opsiyonel'} />
                  <SummaryRow icon={ImagePlus} label="Hasta fotoğrafı" value={photoFile ? 'Seçildi' : 'Opsiyonel'} />
                </div>

                <Button type="submit" disabled={busy} className="mt-5 h-11 w-full gap-2 rounded-lg text-sm font-semibold">
                  {busy ? <><LoaderCircle className="size-4 animate-spin" /> Kaydediliyor</> : <><CheckCircle2 className="size-4" /> Hastayı kaydet</>}
                </Button>
                <Link href="/patients" className="mt-2 flex min-h-11 items-center justify-center rounded-lg text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                  İptal
                </Link>
              </section>

              <section className="rounded-xl border border-teal-100 bg-teal-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-teal-100">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Klinik kayıt bütünlüğü</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-600">
                      Kaydın ardından muayene, aşı, reçete ve laboratuvar işlemleri aynı hasta dosyasında tutulur.
                    </p>
                  </div>
                </div>
              </section>
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
  icon: React.ElementType
  title: string
  description: string
  required?: boolean
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={id} className="text-sm font-semibold text-slate-900">{title}</h3>
          {!required && <span className="text-[11px] font-medium text-slate-400">Opsiyonel</span>}
        </div>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
  required = false,
  hint,
  error,
  className,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  required?: boolean
  hint?: string
  error?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red-600">*</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] leading-4 text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex min-h-14 items-center gap-3 py-3">
      <Icon className="size-4 shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1 text-xs font-medium text-slate-700">{label}</span>
      <span className="text-[11px] font-medium text-slate-500">{value}</span>
    </div>
  )
}

function fieldClass(hasError = false): string {
  return cn(
    'h-11 rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:border-teal-400 focus-visible:ring-teal-100',
    hasError && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10',
  )
}

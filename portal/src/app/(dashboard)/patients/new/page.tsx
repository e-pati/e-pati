"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePet } from "@/hooks/use-pets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { uploadsService } from "@/services/uploads.service";

const schema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  species: z.string().min(1, "Tür seçiniz"),
  breed: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  birthDate: z.string().optional(),
  microchipNo: z.string().optional(),
  photoUrl: z.string().url("Geçerli URL giriniz").optional().or(z.literal("")),
  ownerFullName: z.string().optional(),
  ownerEmail: z
    .string()
    .email("Geçerli e-posta giriniz")
    .optional()
    .or(z.literal("")),
  ownerPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SPECIES = [
  { value: "Cat", label: "🐈 Kedi" },
  { value: "Dog", label: "🐕 Köpek" },
  { value: "Bird", label: "🐦 Kuş" },
  { value: "Rabbit", label: "🐇 Tavşan" },
  { value: "Other", label: "🐾 Diğer" },
];

export default function NewPatientPage() {
  const router = useRouter();
  const createPet = useCreatePet();
  const [done, setDone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sex: "UNKNOWN" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const uploadedPhotoUrl = photoFile
        ? await uploadsService.uploadFile(photoFile, "pets")
        : undefined;
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
      });
      setDone(true);
      toast.success(`${pet.name} başarıyla eklendi!`);
      setTimeout(() => router.push(`/patients/${pet.id}`), 1200);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message ?? "Hasta eklenemedi.");
    }
  };

  const selectPhoto = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen görsel dosyası seçin.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setValue("photoUrl", "");
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Hasta Eklendi!</h2>
          <p className="text-muted-foreground text-sm">
            Hasta profiline yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Yeni Hasta" subtitle="Yeni evcil hayvan kaydı oluşturun" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Hayvan Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Hayvan Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="örn. Pamuk"
                  {...register("name")}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Tür <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v: string | null) => {
                    if (v) setValue("species", v);
                  }}
                >
                  <SelectTrigger
                    className={cn(errors.species && "border-destructive")}
                  >
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.species && (
                  <p className="text-xs text-destructive">
                    {errors.species.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cins / Irk</Label>
                <Input placeholder="örn. Van Kedisi" {...register("breed")} />
              </div>

              <div className="space-y-2">
                <Label>Cinsiyet</Label>
                <Select
                  defaultValue="UNKNOWN"
                  onValueChange={(v: string | null) => {
                    if (v) setValue("sex", v as "MALE" | "FEMALE" | "UNKNOWN");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">Dişi</SelectItem>
                    <SelectItem value="MALE">Erkek</SelectItem>
                    <SelectItem value="UNKNOWN">Bilinmiyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doğum Tarihi</Label>
                <Input type="date" {...register("birthDate")} />
              </div>

              <div className="space-y-2">
                <Label>Mikro Çip No</Label>
                <Input
                  placeholder="15 haneli numara"
                  {...register("microchipNo")}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Sahip Bilgileri
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (opsiyonel)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Ad Soyad</Label>
                <Input
                  placeholder="örn. Ahmet Yılmaz"
                  {...register("ownerFullName")}
                />
              </div>

              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  placeholder="sahip@example.com"
                  {...register("ownerEmail")}
                  className={cn(errors.ownerEmail && "border-destructive")}
                />
                {errors.ownerEmail && (
                  <p className="text-xs text-destructive">
                    {errors.ownerEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  placeholder="+90 555 000 0000"
                  {...register("ownerPhone")}
                />
              </div>

              <p className="text-xs text-muted-foreground sm:col-span-2">
                E-posta girilirse sahip mobil uygulamada hesabını bağlayabilir.
                Girilmezse anonim kayıt oluşturulur.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Fotoğraf
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (opsiyonel)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Hasta fotoğrafı"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={buttonVariants({
                        variant: "outline",
                        className: "cursor-pointer",
                      })}
                    >
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      Görsel Seç
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) =>
                          selectPhoto(event.target.files?.[0])
                        }
                      />
                    </label>
                    {photoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearPhoto}
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        Kaldır
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fotoğraf seçerseniz R2&apos;ye yüklenir ve hasta profiline
                    eklenir.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Fotoğraf URL</Label>
                <Input
                  placeholder="https://..."
                  {...register("photoUrl")}
                  disabled={Boolean(photoFile)}
                  className={cn(errors.photoUrl && "border-destructive")}
                />
                {errors.photoUrl && (
                  <p className="text-xs text-destructive">
                    {errors.photoUrl.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-36">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Kaydediliyor...
                </span>
              ) : (
                "Hastayı Kaydet"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

# e-Pati Projesi — AI Devir Teslim Promptu

> **Son güncelleme:** 1 Mayıs 2026 — Render backend bağlandı, web uyumluluğu tamamlandı

## Sen Kimsin, Ne Yapacaksın?

Burak ile birlikte **e-Pati** adlı evcil hayvan sağlık uygulaması geliştiriyorsun. Kod yazıyorsun, push yapıyorsun, sorun çözüyorsun — tam bir geliştirici gibi.

---

## Ekip

- **Burak (kullanıcı):** Frontend + Mobil
- **Erol:** Backend (NestJS API) — `dev/backend` branch'inde
- **AI (sen):** Burak'ın pair programmer'ı

---

## GitHub

**Repo:** `https://github.com/e-pati/e-pati`
**Çalışma branch'i:** `feature/portal` ← sadece buraya push et

---

## Proje Yapısı

```
/Users/gemici/Documents/e-pati/
├── portal/       ← Next.js 16 web portalı (BİZİM)
├── mobile/       ← React Native + Expo mobil (BİZİM)
├── e-pati-api/   ← NestJS backend (EROL'UN — dokunma)
```

---

## Stack

### Portal
- Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui
- Zustand (`src/stores/auth.store.ts`), TanStack Query (`src/hooks/`)
- Axios (`src/lib/api.ts`), React Hook Form + Zod, Sonner
- Deploy: `https://e-pati.vercel.app`

### Mobile
- React Native 0.81 + Expo SDK 54, Expo Router
- TanStack Query, Axios (`lib/api.ts`) + SecureStore
- Zustand (`stores/auth.store.ts`), React Hook Form + Zod/v4

---

## Tamamlanan Özellikler

### Portal ✅
| Sayfa/Bileşen | Durum |
|---|---|
| `/login` | API bağlı |
| `/dashboard` | Gerçek API (pets, examinations, aşı uyarıları, haftalık chart) |
| `/patients` | API bağlı, pagination (12/sayfa), tür filtresi |
| `/patients/[id]` | API bağlı, 4 sekme (muayene/aşı/reçete/lab) |
| `/patients/new` | API bağlı |
| `/examinations` | API bağlı, arama |
| `/examinations/new` | API bağlı, hasta arama, SOAP |
| `/vaccinations` | API bağlı, filtreler |
| `/lab-results` | API bağlı |
| `/notifications` | API bağlı, okundu işareti |
| `/settings` | Kullanıcı profili, logout |
| Modallar | Aşı ekle ✅, Reçete yaz ✅, Lab sonucu ✅, Hasta düzenle ✅ |
| Auth koruması | `proxy.ts` (cookie tabanlı) |
| Error boundary | `error.tsx`, `not-found.tsx` |

### Mobile ✅
| Ekran | Durum |
|---|---|
| Onboarding (3 slide) | ✅ |
| Login | API bağlı |
| Register | API bağlı |
| OTP | Mock (SMS backend gerekli) |
| Pets listesi | API bağlı, pull-to-refresh, boş durum CTA |
| Pet detay | API bağlı, 5 sekme, QR modal + Paylaş |
| Yeni hayvan | API bağlı |
| Takvim | API bağlı (vaccinations/upcoming) |
| Bildirimler | API bağlı, okundu işareti |
| Profil | Gerçek kullanıcı bilgisi, logout |
| Tab bar badge | Gerçek okunmamış sayısı |
| Push notifications | Expo token → backend'e kaydediliyor |

---

## Backend API — TÜMÜ HAZIR

**Base URL:** `http://localhost:3000`

```
POST /auth/register, /auth/login, /auth/refresh, /auth/logout
GET/POST/PATCH/DELETE /pets, GET /pets/:id/qr
GET/POST/PATCH /examinations
GET/POST/PATCH /vaccinations, GET /vaccinations/upcoming
POST /prescriptions, GET /prescriptions/:id, GET /prescriptions/:id/pdf
POST /lab-results, GET /lab-results, GET /lab-results/:id/file
GET /notifications, PATCH /notifications/:id/read, POST /notifications/preferences
```

---

## Yapılabilecek Sonraki İşler

1. **SMS/OTP gerçek entegrasyon** — OTP ekranı mock, backend'de SMS servisi (Netgsm) gerekli
2. **Erol'dan beklenenler** — Resend API key, Firebase (push notif), R2 (dosya upload)
3. **Erol'un ileride ekleyebilecekleri** — randevu sistemi, AI semptom yönlendirme

## Tamamlanan (1 Mayıs 2026)

- Render backend bağlandı (`https://e-pati.onrender.com`), Redis + CORS düzeltildi
- Vercel portal deploy güncellendi (NEXT_PUBLIC_API_URL=Render URL)
- Mobile web uyumluluğu: Alert.alert → inline hata mesajları (4 modal + logout + register)
- Telefon numarası otomatik +90 formatına normalize ediliyor
- Vaccinations + examinations/new sayfaları useAllClinicPatients() ile owner bilgisi gösteriyor

## Tamamlanan (30 Nisan 2026)

- Dashboard → `GET /clinics/:id/dashboard` (tek call, gerçek klinik statsları)
- Patients → `GET /clinics/:id/patients` (server-side pagination, owner bilgisi dahil)
- Klinik staff artık hasta ekleyip düzenleyebiliyor (Erol backend'i güncelledi)
- Mobile artık dosyaları temizlendi (9 dosya)

---

## Önemli Kurallar

1. **Sadece `feature/portal` branch'ine push et** — main veya dev/backend'e dokunma
2. **`e-pati-api/` klasörüne dokunma** — Erol'un kodu
3. **Push öncesi build:** `cd /Users/gemici/Documents/e-pati/portal && npm run build`
4. **Mobilde Zod:** `import { z } from 'zod/v4'`
5. **`Notification` type çakışması:** `import type { Notification as AppNotification }`
6. **shadcn Select onValueChange:** `v => { if (v) setValue(...) }` pattern
7. **Vercel deploy:** `cd portal && vercel --yes`

---

## Git

```bash
# Başlamadan önce
git fetch origin && git pull origin feature/portal

# Push
git add portal/ mobile/
git commit -m "feat(portal): ..."
git push origin feature/portal
```

# VetCep Projesi — AI Devir Teslim Promptu

> **Son güncelleme:** 4 Mayıs 2026 — vetcep.com canlıya geçti, R2 + Firebase aktif, tasarım tamamen yenilendi

## Sen Kimsin, Ne Yapacaksın?

Burak ile birlikte **VetCep** adlı veteriner klinik yönetim + evcil hayvan sağlık uygulaması geliştiriyorsun. Kod yazıyorsun, push yapıyorsun, sorun çözüyorsun — tam bir geliştirici gibi. Burak ilk kez proje yapıyor, sana güveniyor — sabırlı ve açıklayıcı ol.

---

## Ekip

- **Burak (kullanıcı):** Frontend + Mobil geliştirme, ürün kararları
- **Erol:** Backend (NestJS API) — `dev/backend` branch'inde çalışır
- **AI (sen):** Burak'ın pair programmer'ı

---

## GitHub

**Repo:** `https://github.com/e-pati/e-pati`
**Çalışma branch'i:** `feature/portal` ← sadece buraya push et, main'e dokunma

---

## Proje Yapısı

```
/Users/gemici/Documents/e-pati/
├── portal/       ← Next.js 16 web portalı (BİZİM)
├── mobile/       ← React Native + Expo mobil (BİZİM)
├── e-pati-api/   ← NestJS backend (EROL'UN — dokunma)
```

---

## Canlı URL'ler

| Servis | URL |
|---|---|
| **Web Portal (production)** | `https://vetcep.com` |
| **Backend API** | `https://e-pati.onrender.com` |
| **Vercel dashboard** | burakgemicioglu33-1355s-projects |

---

## Stack

### Portal (Next.js)
- Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Zustand (`src/stores/auth.store.ts`), TanStack Query (`src/hooks/`)
- Axios (`src/lib/api.ts`), React Hook Form + Zod, Sonner (toast)
- Playwright E2E testler (`portal/tests/`)

### Mobile (React Native)
- React Native 0.81 + Expo SDK 54, Expo Router (file-based nav)
- TanStack Query, Axios (`lib/api.ts`) + SecureStore (token saklama)
- Zustand (`stores/auth.store.ts`), React Hook Form + Zod/v4
- `@expo-google-fonts/nunito`, `@expo/vector-icons` (Ionicons)
- Push: `expo-notifications` → Expo Push Token → `/notifications/preferences`

### Backend (Erol'un — bilgi amaçlı)
- NestJS, PostgreSQL (Supabase), Redis (Upstash), Render hosting
- Cloudflare R2 dosya depolama (aktif)
- Firebase Admin + Expo push notifications (aktif)
- Resend e-posta (OTP)

---

## Tamamlanan Özellikler

### Portal ✅
| Sayfa/Bileşen | Durum |
|---|---|
| `/` (landing page) | VetCep markası, özellikler, CTA |
| `/login` | API bağlı, split layout, emerald tema |
| `/dashboard` | Gerçek API, stat kartları, haftalık chart, aşı uyarıları |
| `/patients` | API bağlı, pagination (12/sayfa), tür filtresi, arama |
| `/patients/[id]` | 4 sekme: muayene/aşı/reçete/lab, owner bilgisi |
| `/patients/new` | API bağlı, **R2 fotoğraf yükleme** aktif |
| `/examinations` | API bağlı, arama, SOAP format |
| `/examinations/new` | Hasta arama, SOAP form |
| `/vaccinations` | Filtreler (gecikmiş/yaklaşan/tümü) |
| `/lab-results` | API bağlı |
| `/notifications` | API bağlı, okundu işareti |
| `/settings` | Kullanıcı profili, tema switcher, logout |
| Modallar | Aşı ekle ✅, Reçete yaz ✅, **Lab sonucu (R2 upload)** ✅, Hasta düzenle ✅ |
| Auth koruması | `middleware.ts` (cookie tabanlı) |
| QR scanner | Header'da, kamera ile hayvan QR okuma |

### Mobile ✅
| Ekran | Durum |
|---|---|
| Onboarding (3 slide) | ✅ |
| Login | API bağlı, emerald tema |
| Register | API bağlı, 4 alan (telefon yok) |
| OTP | Gerçek API, e-posta Zustand store'da (`pendingEmail`) |
| Pets listesi | API bağlı, pull-to-refresh |
| Pet detay | 5 sekme, QR modal, Paylaş |
| Yeni hayvan | **R2 fotoğraf yükleme** aktif |
| Hayvan düzenle | API bağlı, DatePickerField |
| Takvim | API bağlı (vaccinations/upcoming) |
| Bildirimler | API bağlı, okundu işareti |
| Profil | Gerçek kullanıcı bilgisi, logout |
| Tab bar badge | Gerçek okunmamış sayısı |
| Push notifications | Expo token backend'e kaydediliyor, Firebase aktif |

---

## Backend API Endpoint'leri

**Base URL (production):** `https://e-pati.onrender.com`

```
POST /auth/login                          ← Klinik girişi
POST /auth/clinic/login                   ← Alternatif klinik girişi
POST /auth/register, /auth/refresh, /auth/logout

GET/POST/PATCH/DELETE /pets
POST /pets/claim                          ← Mikro çip ile hayvan sahiplenme
GET  /pets/:id/qr

GET/POST/PATCH /examinations
GET/POST/PATCH /vaccinations
GET  /vaccinations/upcoming

POST /prescriptions
GET  /prescriptions/:id
GET  /prescriptions/:id/pdf

POST /lab-results
GET  /lab-results
GET  /lab-results/:id/file               ← Presigned download URL

POST /uploads/presign                    ← R2 presigned upload URL (aktif)

GET  /notifications
PATCH /notifications/:id/read
POST /notifications/preferences          ← Push token kayıt: { pushToken: "ExponentPushToken[...]" }

GET  /clinics/:id/dashboard
GET  /clinics/:id/patients
```

**Test hesabı (seed data):**
```
Veteriner:  vet@example.com / DemoPass123
Owner:      sahip@example.com / DemoPass123
```

---

## Dosya Yükleme (R2) Nasıl Çalışır

```
1. Frontend → POST /uploads/presign { fileName, mimeType, folder }
2. Backend  → { uploadUrl (presigned), fileUrl, key } döner
3. Frontend → PUT uploadUrl (direkt R2'ye, backend üzerinden geçmez)
4. Frontend → fileUrl'i kayıt ile birlikte gönderir
```

`portal/src/services/uploads.service.ts` — portal için
`mobile/services/uploads.service.ts` — mobil için
Her ikisi hazır, doğrudan import edilip kullanılabilir.

---

## Önemli Kurallar

1. **Sadece `feature/portal` branch'ine push et** — main veya dev/backend'e dokunma
2. **`e-pati-api/` klasörüne dokunma** — Erol'un kodu
3. **Push öncesi build kontrol:** `cd portal && npm run build`
4. **Mobilde Zod:** `import { z } from 'zod/v4'` (v4, standart değil)
5. **`Notification` type çakışması:** `import type { Notification as AppNotification }`
6. **shadcn Select onValueChange:** `v => { if (v) setValue(...) }` — null check şart
7. **Vercel deploy:** `cd portal && vercel --prod`
8. **Merge öncesi:** `git fetch origin && git merge origin/main` — Erol sık commit atıyor
9. **ESLint kuralı:** `@eslint-react/hooks-extra/no-direct-set-state-in-use-effect` — useEffect içinde setState yasak, event handler'a taşı
10. **Ürün adı:** Proje adı **VetCep** olarak değişti (eski: e-Pati) — yeni dosyalarda VetCep kullan

---

## Tasarım Sistemi

### Portal
- **Arka plan:** `bg-[#F8FAFC]` (slate-50) — sayfa arkaplanı
- **Kartlar:** `bg-white rounded-2xl shadow-sm border-0`
- **Primary renk:** teal `oklch(0.580 0.110 182)`
- **Sidebar:** beyaz, `border-r border-gray-100`, aktif item `bg-primary/10 rounded-xl`
- **Radius:** `0.75rem` (globals.css'de tanımlı)

### Mobile
- **Arka plan:** `#F0FDF4` (mint yeşil)
- **Primary:** `#10B981` (emerald-500)
- **Font:** Nunito (`@expo-google-fonts/nunito`)
- **İkonlar:** Ionicons (`@expo/vector-icons`)
- **Tema sabitleri:** `mobile/constants/theme.ts`

---

## Sonraki Öncelikler (Sıralı)

### 🔴 Kritik — Gelir için şart
1. **Abonelik/ödeme sistemi** — iyzico entegrasyonu, `/billing` sayfası, 14 gün deneme akışı
2. **Admin paneli** — `/admin/dashboard` MRR/klinik/churn takibi (Burak için)

### 🟠 Klinik satışı için kritik
3. **Randevu sistemi** — portal takvim görünümü + mobil randevu talebi (Erol'dan backend lazım)
4. **WhatsApp entegrasyonu** — Meta Business API, muayene/aşı bildirimi

### 🟡 Rekabet avantajı
5. **Klinik analitiği** — kayıp hasta, en çok kullanılan ilaç, yoğun saatler
6. **Kayıp hasta kampanyası** — toplu WhatsApp/SMS gönderimi
7. **Klinik keşif** (mobil) — yakınımdaki VetCep kullanan klinikler haritası
8. **Sahip premium** (mobil) — 29₺/ay, sınırsız hayvan, diyet takibi

### Erol'dan beklenecekler
- Resend özel domain kurulumu (OTP tüm kullanıcılara gitsin)
- Randevu modülü backend'i
- Admin endpoint'leri (`/admin/dashboard`, `/admin/clinics`)

---

## Git Komutları

```bash
# Başlamadan önce — Erol sık commit atıyor, önce çek
git fetch origin && git pull origin feature/portal --rebase

# Erol'un son değişikliklerini al
git merge origin/main

# Commit + push
git add portal/ mobile/
git commit -m "feat(portal): ..."
git push origin feature/portal

# Vercel deploy
cd portal && vercel --prod
```

---

## Referans Dosyalar

| Dosya | Ne İşe Yarar |
|---|---|
| `FRONTEND-IMPLEMENTATION.md` | Detaylı frontend yol haritası (P0→P3) |
| `BACKEND-IMPLEMENTATION.md` | Erol için detaylı backend yol haritası |
| `GELISTIRICI-2-FRONTEND-MOBIL.md` | Orijinal geliştirici planı |
| `epati-gelistirme-plani.md` | Kapsamlı proje planı (pazar analizi dahil) |

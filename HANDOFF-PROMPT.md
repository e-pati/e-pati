# e-Pati Projesi — AI Devir Teslim Promptu

> **Son güncelleme:** 29 Nisan 2026 — token yenileme öncesi handoff

## Sen Kimsin, Ne Yapacaksın?

Ben bu projenin frontend/mobil geliştiricisiyim. Seninle birlikte **e-Pati** adlı bir evcil hayvan sağlık uygulaması geliştiriyoruz. Kod yazıyorsun, push yapıyorsun, sorun çözüyorsun — tam bir geliştirici gibi davranıyorsun.

---

## Proje Nedir?

Türkiye'nin e-Nabız sisteminden ilham alınan, veteriner klinikleri ile evcil hayvan sahiplerini dijital olarak birleştiren bir platform.

- **Veteriner tarafı:** Web portalı — hasta kayıtları, muayene notları, aşı takibi
- **Sahip tarafı:** Mobil uygulama (iOS + Android) — sağlık geçmişi, bildirimler, aşı takvimi

---

## Ekip

- **Burak (kullanıcı):** Frontend + Mobil (Next.js portal, React Native mobil)
- **Erol:** Backend (NestJS API) — `dev/backend` branch'inde çalışıyor
- **AI (sen):** Burak'ın pair programmer'ı

---

## GitHub Repo

**Organizasyon:** `e-pati`
**Repo:** `https://github.com/e-pati/e-pati`
**Çalışma branch'i:** `feature/portal` ← buraya push et, başka yere değil

```
main
├── feature/portal   ← BİZİM BRANCH (buraya push et)
└── dev/backend      ← Erol'un branch'i (dokunma)
```

---

## Proje Klasör Yapısı

```
/Users/gemici/Documents/e-pati/
├── portal/          ← Next.js 16 klinik web portalı (BİZİM)
├── mobile/          ← React Native + Expo mobil uygulama (BİZİM)
├── e-pati-api/      ← NestJS backend (EROL'UN — dokunma)
├── GELISTIRICI-1-BACKEND.md
├── GELISTIRICI-2-FRONTEND-MOBIL.md
└── epati-gelistirme-plani.md
```

---

## Teknoloji Stack

### Portal (`portal/`)
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Stil:** Tailwind CSS + shadcn/ui
- **State:** Zustand (`src/stores/auth.store.ts`)
- **Data:** TanStack Query (`src/hooks/`)
- **HTTP:** Axios (`src/lib/api.ts`) — JWT interceptor var, otomatik token yenileme yapıyor
- **Form:** React Hook Form + Zod
- **Toast:** Sonner
- **Deploy:** Vercel → `https://e-pati.vercel.app`

### Mobile (`mobile/`)
- **Framework:** React Native 0.81 + Expo SDK 54
- **Navigation:** Expo Router (file-based)
- **State:** TanStack Query
- **HTTP:** Axios (`lib/api.ts`) — SecureStore token yönetimi
- **Form:** React Hook Form + Zod

---

## Mevcut Dosya Yapıları

### Portal
```
portal/src/
├── app/
│   ├── (auth)/login/         ← Giriş sayfası (API bağlı ✅)
│   ├── (dashboard)/
│   │   ├── dashboard/        ← Ana pano (mock data)
│   │   ├── patients/         ← Hasta listesi (API bağlı ✅)
│   │   │   ├── [id]/         ← Hasta detay (mock data — bağlanacak)
│   │   │   └── new/          ← Yeni hasta formu (API bağlı ✅)
│   │   ├── examinations/new/ ← Muayene formu (mock — bağlanacak)
│   │   └── notifications/    ← Bildirimler (mock — bağlanacak)
│   └── page.tsx              ← /login'e redirect
├── components/
│   ├── layout/sidebar.tsx    ← Sidebar + logout (çalışıyor ✅)
│   ├── layout/header.tsx
│   └── shared/
├── services/
│   ├── auth.service.ts       ← login, register, logout (API bağlı ✅)
│   └── pets.service.ts       ← CRUD (API bağlı ✅)
├── hooks/
│   └── use-pets.ts           ← TanStack Query hooks
├── stores/
│   └── auth.store.ts         ← Zustand auth state
├── lib/
│   ├── api.ts                ← Axios instance
│   ├── mock-data.ts          ← Geçici veriler (silme!)
│   └── utils.ts
├── types/index.ts
└── middleware.ts             ← Auth koruması (cookie tabanlı ✅)
```

### Mobile
```
mobile/app/
├── (auth)/
│   ├── onboarding.tsx        ← 3 slide tanıtım ✅
│   ├── login.tsx             ← API bağlı ✅
│   ├── register.tsx          ← Form hazır, API bağlanacak
│   └── otp.tsx               ← Mock
├── (tabs)/
│   ├── pets/
│   │   ├── index.tsx         ← Liste (API bağlı ✅, fallback var)
│   │   ├── [id].tsx          ← Detay (mock data — bağlanacak)
│   │   └── new.tsx           ← Yeni hayvan (API bağlı ✅)
│   ├── calendar/index.tsx    ← Aşı takvimi (mock — bağlanacak)
│   ├── notifications/index.tsx ← Mock — bağlanacak
│   └── profile/index.tsx
└── index.tsx                 ← Token kontrolü → yönlendirme ✅
```

---

## Backend API Durumu — TÜMÜ HAZIR ✅

Erol bugün tüm modülleri tamamladı. Şu an çalışan tüm endpoint'ler:

**Base URL:** `http://localhost:3000`
**Swagger:** `http://localhost:3000/api`

```
# AUTH
POST /auth/register    → { fullName, email, phone?, password }
POST /auth/login       → { email, password }
POST /auth/refresh
POST /auth/logout

# PETS
GET    /pets
POST   /pets           → { name, species, breed?, sex?, birthDate?, microchipNo? }
GET    /pets/:id
PATCH  /pets/:id
DELETE /pets/:id
GET    /pets/:id/qr    → { token }

# EXAMINATIONS
GET    /examinations?petId=&page=&limit=
POST   /examinations   → { petId, complaint, findings, assessment, plan }
GET    /examinations/:id
PATCH  /examinations/:id

# VACCINATIONS
GET    /vaccinations?petId=&page=&limit=
GET    /vaccinations/upcoming
POST   /vaccinations   → { petId, name, lotNumber?, appliedAt, dueAt?, notes? }
GET    /vaccinations/:id
PATCH  /vaccinations/:id

# PRESCRIPTIONS
POST   /prescriptions  → { petId, examinationId?, medications: [{name, dose, frequency, duration, instructions?}], notes? }
GET    /prescriptions/:id
GET    /prescriptions/:id/pdf

# LAB RESULTS
POST   /lab-results    → { petId, testType, fileUrl?, comment? }
GET    /lab-results?petId=
GET    /lab-results/:id/file

# NOTIFICATIONS
GET    /notifications
PATCH  /notifications/:id/read
POST   /notifications/preferences
```

### Auth Response Formatı
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "OWNER" }
}
```

---

## ⚡ YAPILACAKLAR — ÖNCELİK SIRASI

Erol tüm endpoint'leri yazdı. Şu an tek yapılması gereken bunları portal ve mobile'a bağlamak.

### 1. Portal — Servis dosyaları yaz (henüz yok)
Şu an sadece `portal/src/services/auth.service.ts` ve `portal/src/services/pets.service.ts` var.
Bunlar eksik, yazılacak:
- `portal/src/services/examinations.service.ts`
- `portal/src/services/vaccinations.service.ts`
- `portal/src/services/prescriptions.service.ts`
- `portal/src/services/lab-results.service.ts`
- `portal/src/services/notifications.service.ts`

### 2. Portal — Hook'lar yaz
`portal/src/hooks/` altında her modül için TanStack Query hook'ları.

### 3. Portal — Hasta detay sayfasını API'ye bağla
`portal/src/app/(dashboard)/patients/[id]/page.tsx` şu an tamamen mock data kullanıyor.
Sekmeleri (muayene, aşı, reçete, lab) gerçek API'ye bağla.

### 4. Portal — Muayene formunu API'ye bağla
`portal/src/app/(dashboard)/examinations/new/page.tsx` form var, submit mock.

### 5. Portal — Bildirimler sayfasını API'ye bağla
`portal/src/app/(dashboard)/notifications/page.tsx` şu an hardcode mock liste kullanıyor.

### 6. Mobile — Servis dosyaları yaz
`mobile/services/` altında examinations, vaccinations, prescriptions, lab-results, notifications servisleri yok. Yazılacak.

### 7. Mobile — Hayvan detay sayfasını API'ye bağla
`mobile/app/(tabs)/pets/[id].tsx` mock data kullanıyor. `petsService.getOne()` + yeni servisler bağlanacak.

### 8. Mobile — Register ekranını API'ye bağla
`mobile/app/(auth)/register.tsx` form var ama submit mock. `authService.register()` çağrısı eklenecek.

### 9. Mobile — Takvim sayfasını API'ye bağla
`mobile/app/(tabs)/calendar/index.tsx` mock vaccination data kullanıyor. Gerçek API'ye bağlanacak.

### 10. Mobile — QR Kod ekranı
`petsService.getQr()` hazır. Hayvan detay sayfasına QR paylaşım butonu + modal eklenecek.

---

## Önemli Kurallar

1. **Push:** Sadece `feature/portal` branch'ine push et. `main` veya `dev/backend`'e DOKUNMA.
2. **`e-pati-api/` klasörüne dokunma** — Erol'un kodu, çakışma yaratır.
3. **Mock data silme:** `portal/src/lib/mock-data.ts` ve `mobile/lib/mock-data.ts` — API bağlantısı başarısız olunca fallback olarak kullanılıyor.
4. **TypeScript:** Tip güvenli yaz, `any` kullanma.
5. **Build kontrolü:** Push öncesi `cd /Users/gemici/Documents/e-pati/portal && npm run build` çalıştır.
6. **Onay al:** Push yapmadan önce Burak'a sor — özellikle ilk push'ta.
7. **Commit formatı:**
   ```
   feat(portal): connect patient detail to real API
   feat(mobile): add examinations service and hook
   ```

---

## Git Komutları

```bash
# Başlamadan önce her zaman pull yap
cd /Users/gemici/Documents/e-pati
git fetch origin && git pull origin feature/portal

# Push
git add portal/ mobile/
git commit -m "feat(...): ..."
git push origin feature/portal
```

---

## Vercel Deploy

```bash
cd /Users/gemici/Documents/e-pati/portal
vercel --yes
```
Canlı URL: `https://e-pati.vercel.app`

---

## Dikkat Edilecek Tuzaklar

- `portal/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Portal middleware cookie-based: `epati-logged-in` cookie'si login/logout'ta set/clear ediliyor.
- Mobil token → `expo-secure-store` (AsyncStorage yasak).
- Mobilde Zod: `import { z } from 'zod/v4'` (zod/v4 kullan, normal zod değil)
- Portal'da `Notification` tipi browser global'i ile çakışıyor → import ederken `as AppNotification` kullan.
- shadcn Select `onValueChange` null gelebilir → `v => { if (v) setValue(...) }` pattern kullan.

---

## Hızlı Test

```bash
# Portal
cd /Users/gemici/Documents/e-pati/portal && npm run dev
# → http://localhost:3001

# Mobile
cd /Users/gemici/Documents/e-pati/mobile && npx expo start
# → QR kodu Expo Go ile tara
```

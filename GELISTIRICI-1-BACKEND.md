# e-Pati — Geliştirici 1: Backend & Altyapı

> **Rol:** Backend API, veritabanı, kimlik doğrulama, bildirim sistemi  
> **Branch stratejisi:** `dev/backend` → PR → `main`  
> **Yatırımcı öncesi kapsam:** Aşama 1 (mimari) + Aşama 2 (API) + Aşama 5 (güvenlik) + Aşama 6 (testler)

---

## Sıfır Bütçeyle Kullanılacak Araçlar

| İhtiyaç | Ücretli Alternatif (plan) | Ücretsiz Alternatif (şimdi kullan) |
|---|---|---|
| Veritabanı hosting | AWS RDS | Supabase (ücretsiz PostgreSQL) veya Railway (500h/ay ücretsiz) |
| Dosya depolama | AWS S3 | Cloudflare R2 (10 GB ücretsiz) veya Supabase Storage |
| E-posta | AWS SES | Resend (3.000 e-posta/ay ücretsiz) |
| SMS | Netgsm (ücretli) | Yatırım sonrasına ertele |
| Monitoring | Datadog | Sentry ücretsiz tier + Railway/Render dahili loglar |
| Sunucu | AWS/GCP | Railway, Render veya Fly.io (ücretsiz tier) |
| Anahtar yönetimi | AWS KMS / Vault | `.env` + GitHub Actions Secrets (başlangıç için yeterli) |
| SMS/Push | Firebase (ücretli planlar) | Firebase Spark (ücretsiz, push bildirim limitsiz) |

---

## Aşama 1 — Proje Temelleri (Hafta 1–2)

### 1.1 Repository Kurulumu
- [ ] GitHub'da `e-pati-backend` repo oluştur
- [ ] Branch koruması ayarla: `main` → sadece PR ile merge
- [ ] `.env.example` dosyası oluştur (gerçek değer olmadan şablon)
- [ ] `.gitignore` konfigüre et (`.env`, `node_modules`, `dist`)
- [ ] README.md: kurulum adımları yaz

### 1.2 NestJS Proje İskeleti
- [ ] `nest new e-pati-api` ile proje başlat (TypeScript, pnpm)
- [ ] Klasör yapısını oluştur:
  ```
  src/
  ├── auth/
  ├── pets/
  ├── examinations/
  ├── vaccinations/
  ├── prescriptions/
  ├── lab-results/
  ├── notifications/
  ├── clinics/
  ├── common/        ← guard, decorator, filter, interceptor
  └── prisma/        ← PrismaService
  ```
- [ ] ESLint + Prettier konfigürasyonu
- [ ] Husky + lint-staged (commit öncesi otomatik lint)

### 1.3 Veritabanı Kurulumu (Supabase — Ücretsiz)
- [ ] Supabase'de proje oluştur (ücretsiz plan)
- [ ] PostgreSQL bağlantı URL'sini `.env`'e al
- [ ] Prisma kurulumu: `pnpm add prisma @prisma/client`
- [ ] `prisma/schema.prisma` dosyasını geliştirme planındaki veri modeliyle doldur:
  - `Owner`, `Pet`, `Clinic`, `Veterinarian`
  - `Examination`, `Vaccination`, `Prescription`, `Medication`
  - `LabResult`, `Notification`, `AuditLog`
- [ ] İlk migration: `npx prisma migrate dev --name init`
- [ ] Prisma Studio ile veri modelini doğrula

### 1.4 Redis Kurulumu
- [ ] Upstash Redis (ücretsiz tier, 10.000 komut/gün) veya Railway Redis
- [ ] `ioredis` + `@nestjs/cache-manager` kurulumu
- [ ] Bağlantı testi yaz

---

## Aşama 2 — Auth Modülü (Hafta 3–4)

### 2.1 Temel Kimlik Doğrulama
- [ ] `pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt`
- [ ] Kayıt endpoint: `POST /auth/register`
  - Şifre bcrypt ile hash'lenir (salt rounds: 12)
  - E-posta formatı ve telefon doğrulaması (class-validator)
- [ ] Giriş endpoint: `POST /auth/login`
  - Access token: 15 dakika geçerli JWT
  - Refresh token: 7 gün geçerli, HTTP-only cookie içinde
- [ ] Token yenileme: `POST /auth/refresh`
- [ ] Çıkış: `POST /auth/logout` (refresh token Redis'te geçersizleştirilir)

### 2.2 Rol Sistemi
- [ ] `Role` enum tanımla: `OWNER | VETERINARIAN | CLINIC_ADMIN | SUPER_ADMIN`
- [ ] `@Roles(...)` dekoratörü yaz
- [ ] `RolesGuard` yaz (her endpoint'e uygulanabilir)
- [ ] `@CurrentUser()` dekoratörü (JWT payload'dan kullanıcı çıkar)

### 2.3 Klinik Personel Girişi
- [ ] `POST /auth/clinic/login` — ayrı endpoint, farklı JWT claim'leri
- [ ] Veteriner ve klinik admin için iki faktörlü doğrulama (TOTP — `speakeasy` kütüphanesi, ücretsiz)

### 2.4 Şifre Sıfırlama
- [ ] `POST /auth/forgot-password` — Resend üzerinden e-posta gönder
- [ ] 6 haneli OTP üret, Redis'e 10 dakika sakla
- [ ] `POST /auth/reset-password` — OTP doğrula, şifre güncelle

---

## Aşama 2 — Çekirdek API Modülleri (Hafta 5–10)

### 3.1 Pets Modülü
- [ ] `GET /pets` — sahibin hayvanları (JWT'den owner ID al)
- [ ] `POST /pets` — yeni hayvan ekle (fotoğraf URL opsiyonel)
- [ ] `GET /pets/:id` — tek hayvan (yetki kontrolü: sadece sahibi veya kliniği)
- [ ] `PATCH /pets/:id` — güncelle
- [ ] `DELETE /pets/:id` — soft delete (`deletedAt` alanı)
- [ ] `GET /pets/:id/summary` — son muayene, aktif ilaçlar, yaklaşan aşılar birleşik sorgu
- [ ] `GET /pets/:id/qr` — imzalı JWT token üret (24 saat geçerli, salt okunur)

### 3.2 Examinations Modülü
- [ ] `GET /examinations?petId=&page=&limit=` — sayfalandırmalı liste
- [ ] `POST /examinations` — yalnızca `VETERINARIAN` rolü
  - SOAP formatında alanlar: `complaint`, `findings`, `assessment`, `plan`
  - Kayıt tamamlandığında sahibe push bildirimi tetikle
- [ ] `GET /examinations/:id`
- [ ] `PATCH /examinations/:id` — yalnızca `VETERINARIAN`, düzenleme geçmişi logla

### 3.3 Vaccinations Modülü
- [ ] `GET /vaccinations?petId=`
- [ ] `POST /vaccinations` — yalnızca `VETERINARIAN`
  - Kayıt sonrası BullMQ ile hatırlatma işleri planla (30 gün, 7 gün, 1 gün önce)
- [ ] `GET /vaccinations/upcoming` — 7/30 gün içinde olanlar
- [ ] `PATCH /vaccinations/:id`

### 3.4 Prescriptions & Medications Modülü
- [ ] `POST /prescriptions` — reçete + ilaçlar tek seferde (transaction)
- [ ] `GET /prescriptions/:id`
- [ ] `GET /prescriptions/:id/pdf` — PDF oluştur, Cloudflare R2'ye yükle, imzalı URL döndür
  - PDF kütüphanesi: `@react-pdf/renderer` veya `puppeteer` (ücretsiz)

### 3.5 Lab Results Modülü
- [ ] `POST /lab-results` — multipart form, dosyayı Cloudflare R2'ye yükle
- [ ] `GET /lab-results?petId=`
- [ ] `GET /lab-results/:id/file` — 15 dakika geçerli imzalı URL üret

### 3.6 Notifications Modülü
- [ ] `GET /notifications` — kullanıcı bildirimleri (sayfalandırmalı)
- [ ] `PATCH /notifications/:id/read`
- [ ] `POST /notifications/preferences` — bildirim tercihleri güncelle
- [ ] Firebase Admin SDK kurulumu — push bildirimi gönder
- [ ] BullMQ worker: bildirim kuyruğunu işle

### 3.7 Clinics Modülü
- [ ] `GET /clinics/:id/patients` — klinik hasta listesi
- [ ] `GET /clinics/:id/dashboard` — günlük özet istatistikler
- [ ] Klinik onboarding akışı: kayıt formu → manuel onay → hesap aktivasyonu

---

## Aşama 2 — Dosya Yönetimi (Hafta 9)

### 4.1 Cloudflare R2 Kurulumu (Ücretsiz)
- [ ] Cloudflare hesabı aç, R2 bucket oluştur (10 GB ücretsiz)
- [ ] AWS SDK v3 `@aws-sdk/client-s3` ile bağlan (R2, S3 API uyumlu)
- [ ] Presigned upload URL endpoint: `POST /files/upload-url`
- [ ] Yükleme tamamlandı endpoint: `POST /files/confirm`
- [ ] Presigned download URL servisi (dahili kullanım)

---

## Aşama 5 — Güvenlik (Hafta 10–11, paralel)

### 5.1 Temel Güvenlik
- [ ] `helmet` middleware (HTTP güvenlik başlıkları)
- [ ] `@nestjs/throttler` — rate limiting (IP başına 100 istek/dakika)
- [ ] CORS konfigürasyonu (yalnızca izinli domainler)
- [ ] Tüm kullanıcı girdileri `class-validator` ile doğrula
- [ ] SQL injection: Prisma parametrik sorgular (otomatik, kontrol et)
- [ ] Dosya yüklemede: MIME type kontrolü, boyut sınırı (10 MB)

### 5.2 Audit Log
- [ ] Tüm yazma işlemlerinde `AuditLog` kaydı oluştur (interceptor ile)
- [ ] Loglanacaklar: `userId`, `action`, `resourceType`, `resourceId`, `timestamp`, `ipAddress`

### 5.3 Ücretsiz Güvenlik Araçları
- [ ] `npm audit` çalıştır, kritik açıkları kapat
- [ ] GitHub Dependabot aktifleştir (otomatik bağımlılık güncellemesi)
- [ ] OWASP ZAP ile temel tarama yap (açık kaynak, ücretsiz)

---

## Aşama 6 — Testler (Hafta 11–12)

### 6.1 Birim Testleri (Jest)
- [ ] Test kapsam hedefi: %70+
- [ ] Her servis için temel test dosyası oluştur
- [ ] Öncelikli test edilecekler:
  - `VaccinationReminderService.shouldSendReminder()`
  - `AuthService.validateUser()`
  - `PetsService.findOne()` yetki kontrolü
  - Şifre hash/doğrulama

### 6.2 Entegrasyon Testleri (Supertest)
- [ ] Ayrı test veritabanı: Supabase'de `e_pati_test` şeması
- [ ] Her modül için temel akış testi:
  - Auth: kayıt → giriş → korumalı endpoint erişimi
  - Pet: oluştur → oku → güncelle
  - Yetkisiz erişim reddi (403 kontrolü)

### 6.3 CI/CD (GitHub Actions — Ücretsiz)
- [ ] `.github/workflows/ci.yml` oluştur:
  ```
  - PR açıldığında: lint + test çalıştır
  - main'e merge: test + build + Railway'e otomatik deploy
  ```

---

## Teslim Kriteri (Yatırımcı Demo için Minimum)

- [ ] Tüm auth endpoint'leri çalışıyor
- [ ] Pet CRUD + muayene + aşı endpoint'leri çalışıyor
- [ ] Push bildirimi gönderilip alınabiliyor
- [ ] Postman/Swagger koleksiyonu ile demo yapılabiliyor
- [ ] Test coverage raporu oluşturuluyor
- [ ] Railway'de canlı backend URL'i var

---

## GitHub İş Akışı

```
main
  └── dev/backend              ← bu branch'te çalış
        ├── feature/auth       ← auth bitti → PR → dev/backend
        ├── feature/pets       ← pets bitti → PR → dev/backend
        ├── feature/exam       ← examinations → PR → dev/backend
        └── ...

dev/backend hazır → PR → main (Geliştirici 2 ile birlikte review)
```

**Commit mesaj formatı:**
```
feat(auth): add JWT refresh token rotation
fix(pets): prevent owner accessing other user's pets
test(vaccination): add reminder scheduling unit tests
```

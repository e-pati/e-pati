# e-Pati Frontend/Mobil Handoff

Bu not frontend/mobil geliştiricisi için güncel çalışma yönergesidir.

## Branch ve Senkron

Repo:

```text
https://github.com/e-pati/e-pati
```

Ana kaynak `main`. Çalışmaya başlamadan önce kendi branch'ini main ile güncelle:

```bash
git checkout feature/portal
git fetch origin
git merge origin/main
```

Branch yoksa:

```bash
git checkout main
git pull origin main
git checkout -b feature/portal
```

Push sadece frontend/mobil branch'ine:

```bash
git add portal/ mobile/
git commit -m "feat(portal): ..."
git push origin feature/portal
```

Backend koduna feature işi olarak dokunma. `e-pati-api/` sadece lokal demo backend'i çalıştırmak için kullanılacak.

## Backend Lokal Kurulum

Backend NestJS + Prisma + Supabase PostgreSQL ile çalışıyor.

```bash
cd e-pati-api
cp .env.example .env
```

`.env` içinde `DATABASE_URL` satırındaki `<DB_PASSWORD>` değerini ekipten alınan DB şifresiyle değiştir:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

Gerçek DB hostu, kullanıcı adı ve şifresi GitHub'a yazılmayacak.

Kurulum:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

Backend:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/docs
```

Demo loginleri:

```text
Owner: sahip@example.com / DemoPass123
Clinic staff: vet@example.com / DemoPass123
```

## Portal Lokal Kurulum

`portal/.env.local` oluştur:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Çalıştır:

```bash
cd portal
npm install
npm run dev -- -p 3001
```

Portal:

```text
http://localhost:3001
```

Production Vercel için canlı backend URL henüz yok. Backend deploy edilince Vercel'de `NEXT_PUBLIC_API_URL` güncellenecek.

## Mobil Lokal Kurulum

`mobile/.env` veya Expo env içine:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Çalıştır:

```bash
cd mobile
npm install
npm run start
```

Expo Go ile fiziksel cihazdan testte telefon ve bilgisayar aynı ağda olmalı. Gerekirse localhost yerine bilgisayarın LAN IP adresi kullanılmalı:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

## Tamamlanan Alanlar

Portal:

- `/login`
- `/dashboard`
- `/patients`
- `/patients/[id]`
- `/patients/new`
- `/examinations`
- `/examinations/new`
- `/vaccinations`
- `/lab-results`
- `/notifications`
- `/settings`
- aşı ekle, reçete yaz, lab sonucu, hasta düzenle modalları
- auth koruması
- error ve not-found ekranları

Mobil:

- onboarding
- login/register
- pets list
- pet detail
- new pet
- calendar
- notifications
- profile
- QR modal/paylaşım
- Expo token backend'e gönderme yapısı

## Sıradaki Öncelikli İşler

1. Portal gerçek API kontrolü

   Backend açıkken aşağıdaki sayfalar gerçek Supabase seed data ile çalışmalı. Sessizce mock data'ya düşen ekran varsa tespit edip düzelt:

   - `/dashboard`
   - `/patients`
   - `/patients/[id]`
   - `/examinations`
   - `/vaccinations`
   - `/lab-results`
   - `/notifications`

2. Portal pagination

   Aşağıdaki sayfalarda pagination eksiklerini tamamla:

   - `/examinations`
   - `/vaccinations`
   - `/lab-results`

3. Mobil hayvan düzenleme

   Mobil pet detail ekranına edit butonu ve form akışı ekle. Backend endpoint hazır:

   ```text
   PATCH /pets/:id
   ```

4. OTP/SMS

   Şimdilik mock kalacak. Backend SMS/OTP gerçek entegrasyonu demo dışı.

5. Push notification

   UI ve bildirim listesi çalışabilir. Gerçek Firebase push gönderimi demo dışı.

6. Dosya/PDF

   Lab result ve prescription PDF demo için seed URL ile çalışır. Gerçek upload/storage/PDF production entegrasyonu demo dışı.

## Push Öncesi Kontrol

Portal değişikliği yaptıysan:

```bash
cd portal
npm run build
```

Mobil değişikliği yaptıysan:

```bash
cd mobile
npm run start
```

Temel ekranları lokal backend açıkken kontrol et.

## Dikkat Edilecekler

- `e-pati-api/.env` GitHub'a pushlanmayacak.
- Gerçek DB şifresi repo içine yazılmayacak.
- `e-pati-api/` backend feature koduna dokunma.
- Mobilde Zod import'u:

  ```ts
  import { z } from 'zod/v4'
  ```

- `Notification` type çakışması olursa:

  ```ts
  import type { Notification as AppNotification }
  ```

- shadcn Select için:

  ```ts
  onValueChange={v => { if (v) setValue(...) }}
  ```

Öncelik: Portalı lokal backend + Supabase seed data ile aç, hangi ekranlar mock'a düşüyor netleştir, sonra pagination ve mobil pet edit işlerine geç.

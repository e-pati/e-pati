# VetCep Deployment Baseline

Bu dosya profesyonel deploy icin ilk altyapi standardini tanimlar.

## Hedef Teknoloji Seti

- Backend: NestJS, Prisma, PostgreSQL
- Portal: Next.js standalone Docker image
- Mobil: Expo/EAS
- Cache/OTP: Redis
- Dosya: Cloudflare R2 veya Supabase Storage
- Email: Resend veya kurumsal SMTP
- Push: Firebase Cloud Messaging
- Runtime: Docker image + Docker Compose/Kubernetes uyumlu container

## Lokal Prod-Benzeri Calistirma

```bash
docker compose up --build
```

Servisler:

- API: `http://localhost:3000`
- API health: `http://localhost:3000/health`
- API readiness: `http://localhost:3000/health/ready`
- Portal: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Ilk calistirmada migration'i ayrica kos:

```bash
docker compose run --rm api pnpm db:migrate
```

Demo verisi gerekiyorsa:

```bash
docker compose run --rm api pnpm db:seed
```

## Canli Ortam Notlari

Canli deploy'da compose icindeki default secret'lar kullanilmaz. Su degiskenler ortam secret yoneticisinden verilir:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `QR_TOKEN_SECRET`
- `RESEND_API_KEY`
- `R2_*`
- `FIREBASE_*`
- `META_WHATSAPP_*`

Kisa vadede Supabase + Upstash kullanilabilir. Bakanlik/pilot fazinda veri yerlesimi ve KVKK nedeniyle PostgreSQL/Redis Turkiye'de barinan bir ortama tasinmalidir.

## Ortam Dosyalari

- Backend local: `e-pati-api/.env.example`
- Backend production: `e-pati-api/.env.production.example`
- Portal local: `portal/.env.example`
- Portal production: `portal/.env.production.example`
- Mobile local/prod build: `mobile/.env.example` veya EAS secret'lari

Production API `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `QR_TOKEN_SECRET` ve `CORS_ORIGINS` olmadan acilmaz. Bu bilerek yapildi; placeholder secret ile deploy etmek yerine uygulama erken hata verir.

Secret uretimi icin:

```bash
openssl rand -base64 48
```

## CI Beklentisi

Her PR su kontrollerden gecmelidir:

- Backend: Prisma generate, Jest, Nest build
- Portal: ESLint, TypeScript, Next build
- Mobile: TypeScript

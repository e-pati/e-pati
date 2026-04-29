# e-Pati

Veteriner klinikleri ve hayvan sahipleri için dijital sağlık kaydı backend'i.

## Backend

NestJS API uygulaması `e-pati-api/` klasöründedir.

```bash
cd e-pati-api
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm start:dev
```

Swagger dokümantasyonu geliştirme ortamında `http://localhost:3000/docs` adresinden açılır.

## Branch Akışı

- Backend geliştirmeleri `dev/backend` branch'inde yapılır.
- Özellik işleri `feature/*` branch'lerinden `dev/backend` üzerine PR ile birleştirilir.
- Hazır backend `dev/backend` üzerinden `main` branch'ine PR açılarak taşınır.

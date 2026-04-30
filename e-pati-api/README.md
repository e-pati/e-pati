# e-Pati API

NestJS + Prisma + PostgreSQL backend for the e-Pati veterinary health record app.

## Requirements

- Node.js 20+
- pnpm
- PostgreSQL connection string. Supabase PostgreSQL is the recommended MVP database.

## Environment

Create `e-pati-api/.env` from `.env.example` and set at least:

```env
DATABASE_URL="postgresql://postgres.aurjucbyusfmwkysaofz:<DB_PASSWORD>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
JWT_ACCESS_SECRET="change-me-to-a-long-random-value"
JWT_REFRESH_SECRET="change-me-to-a-long-random-value"
QR_TOKEN_SECRET="change-me-to-a-long-random-value"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8081,https://e-pati.vercel.app"
```

The Supabase project uses the Session Pooler URL above so development works on IPv4/public networks. Replace `<DB_PASSWORD>` with the shared database password outside Git.

## Database

Apply migrations:

```bash
pnpm db:migrate
```

Generate Prisma Client:

```bash
pnpm db:generate
```

Seed demo data:

```bash
pnpm db:seed
```

Open Prisma Studio:

```bash
pnpm db:studio
```

Demo credentials created by the seed:

- Owner: `sahip@example.com` / `DemoPass123`
- Clinic staff: `vet@example.com` / `DemoPass123`

## Development

```bash
pnpm install
pnpm start:dev
```

Swagger runs at:

```text
http://localhost:3000/docs
```

## Verification

```bash
pnpm lint
pnpm exec jest --runInBand
pnpm build
```

# VetCep — Backend Implementation Planı (Erol İçin)

> Rekabet analizi ve ürün yol haritasına dayalı backend geliştirme planı.  
> **Son güncelleme:** Mayıs 2026  
> **Stack:** NestJS · PostgreSQL (Supabase) · Redis (Upstash) · Render

---

## Öncelik Sıralaması

| Öncelik | Açıklama |
|---|---|
| 🔴 P0 | Gelir için zorunlu — bu olmadan para kazanılamaz |
| 🟠 P1 | Klinik satışı için kritik |
| 🟡 P2 | Rekabet avantajı |
| 🟢 P3 | Büyüme özellikleri — 6+ ay |

---

## 🔴 P0 — Firebase Push Bildirimleri

**Neden kritik:** Sahip uygulamasının en değerli özelliği. Aşı hatırlatması ve muayene bildirimi olmadan mobil uygulama yarı değerinde.

### Kurulum

```bash
npm install firebase-admin
```

### Yeni Dosyalar

**`src/firebase/firebase.module.ts`:**
```typescript
import { Module, Global } from '@nestjs/common'
import { FirebaseService } from './firebase.service'

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
```

**`src/firebase/firebase.service.ts`:**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App

  onModuleInit() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }

  async sendPush(token: string, title: string, body: string, data?: Record<string, string>) {
    try {
      await this.app.messaging().send({
        token,
        notification: { title, body },
        data,
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
        android: { priority: 'high', notification: { sound: 'default' } },
      })
    } catch (err) {
      // Token geçersizse veritabanından sil
      if (err.code === 'messaging/registration-token-not-registered') {
        await this.invalidateToken(token)
      }
    }
  }

  async sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>) {
    if (!tokens.length) return
    const chunks = this.chunk(tokens, 500) // Firebase limit: 500/istek
    for (const chunk of chunks) {
      await this.app.messaging().sendEachForMulticast({ tokens: chunk, notification: { title, body }, data })
    }
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))
  }

  private async invalidateToken(token: string) {
    // PushToken tablosundan sil — PrismaService inject et
  }
}
```

### Push Token Endpoint'i

**`src/notifications/notifications.controller.ts`** güncelleme:
```typescript
@Post('push-token')
@UseGuards(JwtAuthGuard)
async savePushToken(
  @CurrentUser() user: JwtPayload,
  @Body() dto: SavePushTokenDto,
) {
  return this.notificationsService.savePushToken(user.sub, dto.token, dto.platform)
}

@Delete('push-token')
@UseGuards(JwtAuthGuard)
async removePushToken(@CurrentUser() user: JwtPayload) {
  return this.notificationsService.removePushToken(user.sub)
}
```

**`src/notifications/dto/save-push-token.dto.ts`:**
```typescript
import { IsString, IsEnum } from 'class-validator'

export class SavePushTokenDto {
  @IsString()
  token: string

  @IsEnum(['ios', 'android'])
  platform: 'ios' | 'android'
}
```

### Prisma Schema Güncellemesi

```prisma
model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   // 'ios' | 'android'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Tetikleyici Noktalar

Şu noktalarda push gönderilmeli:

```typescript
// 1. Muayene kaydedildiğinde — sahibe
await firebaseService.sendPush(ownerToken, 'Muayene Kaydedildi', 
  `${pet.name}'nın muayene notları kliniğe eklendi`)

// 2. Aşı hatırlatması (BullMQ job) — sahibe + kliniğe
await firebaseService.sendPush(ownerToken, 'Aşı Hatırlatması',
  `${pet.name}'nın ${vaccine.name} aşısı ${daysLeft} gün içinde yapılmalı`)

// 3. Reçete oluşturulduğunda — sahibe
await firebaseService.sendPush(ownerToken, 'Reçete Hazır',
  `${pet.name} için reçete oluşturuldu, uygulamadan görüntüleyebilirsiniz`)

// 4. Lab sonucu yüklendiğinde — sahibe
await firebaseService.sendPush(ownerToken, 'Lab Sonucu Hazır',
  `${pet.name}'nın ${lab.testType} sonuçları sisteme eklendi`)
```

### .env Güncellemesi

```env
FIREBASE_PROJECT_ID=vetcep-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@vetcep-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🔴 P0 — Cloudflare R2 Dosya Yükleme

**Neden kritik:** Lab sonucu röntgen, reçete PDF gerçekten depolanabilsin.

### Kurulum

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Yeni Dosyalar

**`src/storage/storage.module.ts`:**
```typescript
import { Module, Global } from '@nestjs/common'
import { StorageService } from './storage.service'

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
```

**`src/storage/storage.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

@Injectable()
export class StorageService {
  private client: S3Client
  private bucket = process.env.R2_BUCKET!
  private publicBase = process.env.R2_PUBLIC_BASE_URL!

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  // Doğrudan yükleme (küçük dosyalar, PDF)
  async upload(buffer: Buffer, mimeType: string, folder = 'uploads'): Promise<string> {
    const key = `${folder}/${randomUUID()}`
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }))
    return key
  }

  // 15 dakika geçerli indirme URL'i
  async getSignedDownloadUrl(key: string, expiresIn = 900): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    )
  }

  // Client-side doğrudan yükleme için presigned URL (büyük dosyalar)
  async getPresignedUploadUrl(mimeType: string, folder = 'uploads', expiresIn = 300): Promise<{ uploadUrl: string; key: string }> {
    const key = `${folder}/${randomUUID()}`
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: mimeType }),
      { expiresIn },
    )
    return { uploadUrl, key }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }
}
```

### Lab Results Modülü Güncellemesi

**`src/lab-results/lab-results.controller.ts`:**
```typescript
@Post('upload-url')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VETERINARIAN', 'CLINIC_ADMIN')
async getUploadUrl(@Body() dto: GetUploadUrlDto) {
  return this.storageService.getPresignedUploadUrl(dto.mimeType, 'lab-results')
}

@Get(':id/file')
@UseGuards(JwtAuthGuard)
async getFileUrl(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
  const lab = await this.labResultsService.findOne(id, user)
  if (!lab.fileKey) throw new NotFoundException('Dosya bulunamadı')
  const url = await this.storageService.getSignedDownloadUrl(lab.fileKey)
  return { url }
}
```

### Reçete PDF Üretimi

**`src/prescriptions/prescription-pdf.service.ts`** — yeni:
```typescript
import { Injectable } from '@nestjs/common'
import * as PDFDocument from 'pdfkit'

@Injectable()
export class PrescriptionPdfService {
  async generate(prescription: PrescriptionWithDetails): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const buffers: Buffer[] = []
      doc.on('data', b => buffers.push(b))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Header
      doc.fontSize(20).text('VetCep — Veteriner Reçetesi', { align: 'center' })
      doc.moveDown()
      
      // Klinik bilgileri, hasta bilgileri, ilaçlar...
      // (detaylı implementasyon)
      
      doc.end()
    })
  }
}
```

```bash
npm install pdfkit @types/pdfkit
```

### .env Güncellemesi

```env
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=yyy
R2_BUCKET=vetcep-files
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
```

---

## 🔴 P0 — Abonelik Sistemi

**Neden kritik:** Para toplamak için zorunlu.

### Kurulum

```bash
npm install iyzipay  # veya stripe için: npm install stripe
```

### Yeni Modül: `src/subscriptions/`

**`src/subscriptions/subscriptions.module.ts`**

**`src/subscriptions/subscriptions.service.ts`:**
```typescript
@Injectable()
export class SubscriptionsService {
  // iyzico ile abonelik oluştur
  async createCheckoutForm(clinicId: string, plan: 'monthly' | 'yearly'): Promise<{ token: string; checkoutFormContent: string }>

  // iyzico webhook'tan gelen ödeme sonucu
  async handleWebhook(payload: IyzicoWebhookPayload): Promise<void>

  // Deneme başlat (14 gün)
  async startTrial(clinicId: string): Promise<Subscription>

  // Abonelik durumu
  async getStatus(clinicId: string): Promise<{ status: 'trialing' | 'active' | 'past_due' | 'canceled'; trialEndsAt?: Date; nextBillingAt?: Date }>

  // İptal
  async cancel(clinicId: string): Promise<void>
}
```

**`src/subscriptions/subscriptions.controller.ts`:**
```typescript
@Post('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINIC_ADMIN')
async createCheckout(@CurrentUser() user, @Body() dto: CreateCheckoutDto)

@Post('webhook')
// iyzico'nun webhook imzasını doğrula
async handleWebhook(@Headers('x-iyz-signature') signature: string, @Body() payload: any)

@Get('status')
@UseGuards(JwtAuthGuard)
async getStatus(@CurrentUser() user)

@Post('cancel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINIC_ADMIN')
async cancel(@CurrentUser() user)
```

### Prisma Schema Güncellemesi

```prisma
model Subscription {
  id              String    @id @default(cuid())
  clinicId        String    @unique
  status          String    // 'trialing' | 'active' | 'past_due' | 'canceled'
  plan            String    // 'monthly' | 'yearly'
  trialStartsAt   DateTime?
  trialEndsAt     DateTime?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  iyzicoSubKey    String?   // iyzico subscription key
  canceledAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  clinic          Clinic    @relation(fields: [clinicId], references: [id])
}
```

### Auth Guard Güncellemesi

Aboneliği olmayan veya süresi geçmiş klinikleri engelle:
```typescript
// src/common/guards/subscription.guard.ts
@Injectable()
export class SubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user
    const sub = await this.subscriptionsService.getStatus(user.clinicId)
    
    if (sub.status === 'active' || sub.status === 'trialing') return true
    
    throw new ForbiddenException({
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'Aboneliğiniz sona ermiş',
      redirectTo: '/billing',
    })
  }
}
```

---

## 🟠 P1 — Randevu Sistemi

**Neden kritik:** En büyük klinik ağrı noktası. Bu özellik tek başına fiyatı artırabilir.

### Yeni Modül: `src/appointments/`

**Prisma Schema:**
```prisma
model Appointment {
  id          String    @id @default(cuid())
  clinicId    String
  petId       String
  vetId       String?
  ownerId     String
  title       String    // "Aşı", "Kontrol", "Operasyon"
  notes       String?
  scheduledAt DateTime
  duration    Int       @default(30) // dakika
  status      String    @default("pending") // pending | confirmed | canceled | completed
  cancelReason String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  clinic      Clinic    @relation(fields: [clinicId], references: [id])
  pet         Pet       @relation(fields: [petId], references: [id])
  owner       Owner     @relation(fields: [ownerId], references: [id])
}
```

**`src/appointments/appointments.controller.ts`:**
```typescript
// Klinik endpoint'leri
@Get()                              // Klinik randevu listesi (tarih filtresi)
@Post()                             // Yeni randevu oluştur
@Patch(':id/confirm')               // Onayla
@Patch(':id/cancel')                // İptal et
@Patch(':id/complete')              // Tamamlandı

// Sahip endpoint'leri
@Get('my')                          // Sahibin kendi randevuları
@Post('request')                    // Randevu talebi gönder
```

**`src/appointments/appointments.service.ts`:**
```typescript
// Randevu onaylandığında sahibe push + SMS
async confirmAppointment(id: string, clinicId: string) {
  const appointment = await this.update(id, { status: 'confirmed' })
  
  // Push bildirimi
  await this.firebaseService.sendPush(
    ownerToken,
    'Randevunuz Onaylandı',
    `${appointment.scheduledAt} tarihindeki randevunuz onaylandı`
  )
  
  // WhatsApp mesajı (eğer entegrasyon aktifse)
  await this.whatsappService.sendTemplate(
    ownerPhone,
    'appointment_confirmed',
    { date: formatDate(appointment.scheduledAt), clinicName }
  )
  
  return appointment
}

// 24 saat öncesi hatırlatma (BullMQ job)
async scheduleReminder(appointment: Appointment) {
  const delay = appointment.scheduledAt.getTime() - Date.now() - 24 * 60 * 60 * 1000
  await this.appointmentQueue.add('reminder', { appointmentId: appointment.id }, { delay })
}
```

**Çakışma Kontrolü:**
```typescript
async checkAvailability(clinicId: string, vetId: string | undefined, scheduledAt: Date, duration: number) {
  const end = new Date(scheduledAt.getTime() + duration * 60_000)
  const conflict = await this.prisma.appointment.findFirst({
    where: {
      clinicId,
      ...(vetId ? { vetId } : {}),
      status: { in: ['pending', 'confirmed'] },
      scheduledAt: { lt: end },
      // scheduled_at + duration > scheduledAt
    },
  })
  if (conflict) throw new ConflictException('Bu saatte başka randevu var')
}
```

---

## 🟠 P1 — WhatsApp Business API

**Neden kritik:** Türkiye'de vet-sahip iletişiminin büyük çoğunluğu WhatsApp üzerinden.

### Kurulum

```bash
npm install @nestjs/axios axios
# Meta WhatsApp Business API — REST API, SDK yok
```

### Yeni Modül: `src/whatsapp/`

**`src/whatsapp/whatsapp.service.ts`:**
```typescript
@Injectable()
export class WhatsappService {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0'
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  constructor(private readonly http: HttpService) {}

  async sendTemplate(
    to: string,
    templateName: string,
    components: WhatsappComponent[],
    languageCode = 'tr',
  ) {
    const phone = to.replace(/\D/g, '').replace(/^0/, '90') // +90xxx formatı
    
    await this.http.post(
      `${this.apiUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    ).toPromise()
  }

  // Template örnekleri:
  // 'exam_summary'        → "{{hayvan_adi}}'nın muayene notları eklendi"
  // 'vaccine_reminder'    → "{{hayvan_adi}}'nın {{asi_adi}} aşısı {{tarih}}'de yapılmalı"
  // 'appointment_confirm' → "Randevunuz onaylandı: {{tarih}} {{saat}}"
  // 'prescription_ready'  → "{{hayvan_adi}} için reçete hazır"
}
```

**`src/whatsapp/whatsapp.controller.ts`:**
```typescript
// Klinik WhatsApp ayarları
@Get('status')          // Entegrasyon aktif mi?
@Post('test')           // Test mesajı gönder
@Get('templates')       // Onaylı template listesi
```

**Webhook (Meta'dan gelen durum bildirimleri):**
```typescript
@Get('webhook')   // Meta doğrulama
@Post('webhook')  // Mesaj durumu (delivered, read, failed)
```

### .env Güncellemesi

```env
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_ACCESS_TOKEN=EAABxx...
WHATSAPP_VERIFY_TOKEN=random-verify-token-for-webhook
```

---

## 🟠 P1 — Admin Paneli Endpoint'leri

**Neden önemli:** Bizim MRR, churn, klinik sayısını görmemiz gerekiyor.

### Yeni Modül: `src/admin/`

```typescript
// src/admin/admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  
  @Get('dashboard')
  async getDashboard() {
    return {
      totalClinics: await this.clinicsService.count(),
      activeSubscriptions: await this.subscriptionsService.countByStatus('active'),
      trialing: await this.subscriptionsService.countByStatus('trialing'),
      mrr: await this.subscriptionsService.calculateMRR(),
      newThisMonth: await this.clinicsService.countNewThisMonth(),
      churnThisMonth: await this.subscriptionsService.countCanceledThisMonth(),
    }
  }

  @Get('clinics')
  async getClinics(@Query() query: AdminClinicsQueryDto) {
    // Tüm klinikler + abonelik durumu + son aktivite
  }

  @Get('revenue')
  async getRevenue(@Query('period') period: '7d' | '30d' | '90d') {
    // Günlük/haftalık gelir grafiği
  }
}
```

---

## 🟡 P2 — BullMQ Job Queue (Hatırlatmalar)

**Neden önemli:** Aşı hatırlatmaları, randevu hatırlatmaları, deneme sonu bildirimleri.

### Kurulum

```bash
npm install @nestjs/bull bull @types/bull
# Redis zaten var (Upstash)
```

### Yeni Queue'lar

**`src/queues/vaccine-reminder.processor.ts`:**
```typescript
@Processor('vaccine-reminder')
export class VaccineReminderProcessor {
  
  @Process('check-upcoming')
  async checkUpcoming() {
    // Her gün sabah 09:00'da çalış
    // 30 gün, 7 gün, 1 gün içindeki aşıları bul
    // Sahibe push + WhatsApp gönder
    // Kliniğe dashboard bildirimi ekle
  }
}
```

**`src/queues/trial-reminder.processor.ts`:**
```typescript
@Processor('trial-reminder')
export class TrialReminderProcessor {
  
  @Process('check-expiring')
  async checkExpiring() {
    // Her gün çalış
    // 3 gün kalan denemeleri bul
    // Klinik adminine e-posta gönder: "Denemeniz bitiyor"
  }
}
```

**Queue Tanımı `src/app.module.ts`'e ekle:**
```typescript
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_URL,
  },
}),
BullModule.registerQueue(
  { name: 'vaccine-reminder' },
  { name: 'appointment-reminder' },
  { name: 'trial-reminder' },
),
```

---

## 🟡 P2 — Gelişmiş Klinik Analitiği

**Neden önemli:** "Bu yazılım bana para kazandırıyor" dedirtir.

**`src/clinics/clinics.controller.ts`** güncellemesi:
```typescript
@Get(':id/analytics')
@UseGuards(JwtAuthGuard, ClinicAccessGuard)
async getAnalytics(
  @Param('id') clinicId: string,
  @Query('period') period: '7d' | '30d' | '90d' = '30d',
) {
  return {
    examsByDay: await this.analyticsService.getExamsByDay(clinicId, period),
    topSpecies: await this.analyticsService.getTopSpecies(clinicId),
    inactivePatients: await this.analyticsService.getInactivePatients(clinicId, 180), // 6 ay
    popularVaccines: await this.analyticsService.getPopularVaccines(clinicId),
    popularMedications: await this.analyticsService.getPopularMedications(clinicId),
    peakHours: await this.analyticsService.getPeakHours(clinicId),
  }
}
```

**`src/clinics/analytics.service.ts`** — yeni:
```typescript
async getInactivePatients(clinicId: string, daysSince: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysSince)
  
  return this.prisma.pet.findMany({
    where: {
      clinicPatients: { some: { clinicId } },
      examinations: {
        none: { createdAt: { gte: cutoff } },
      },
    },
    include: { owner: { select: { fullName: true, phone: true } } },
    take: 50,
  })
}
```

---

## 🟡 P2 — Resend E-posta Geliştirmeleri

**Neden önemli:** Şu an sadece OTP var. Abonelik ve bildirim e-postaları lazım.

**Yeni e-posta tipleri:**

```typescript
// src/email/email.service.ts güncelleme:

// Deneme başladı
async sendTrialStarted(email: string, clinicName: string, trialEndsAt: Date)

// Deneme bitiyor (3 gün kaldı)  
async sendTrialExpiring(email: string, clinicName: string, daysLeft: number)

// Ödeme başarılı
async sendPaymentSuccess(email: string, amount: number, nextBillingAt: Date)

// Ödeme başarısız
async sendPaymentFailed(email: string, clinicName: string)

// Haftalık özet (klinik adminine)
async sendWeeklySummary(email: string, stats: WeeklyStats)
```

**Resend domain kurulumu (kritik):**
- Resend panelinde `vetcep.com` domain'ini ekle
- DNS TXT kaydı ekle (SPF, DKIM)
- `MAIL_FROM` değerini `VetCep <noreply@vetcep.com>` yap
- Bu yapılmazsa e-postalar spam'e düşer

---

## 🟢 P3 — Gelecek Endpoint'ler (6+ Ay)

### Pet Insurance Entegrasyonu
```typescript
// GET  /insurance/offers?petId=xxx     → Sigorta teklifleri
// POST /insurance/apply               → Başvuru
// GET  /insurance/claims              → Hasar başvuruları
```

### AI / ML Endpoint'leri
```typescript
// POST /ai/symptom-check              → Semptom analizi
// POST /ai/diagnosis-suggest          → Tanı önerisi (SOAP'tan)
// GET  /ai/vaccine-prediction/:petId  → Optimal aşı takvimi
```

### Marketplace
```typescript
// GET  /products                      → Ürün kataloğu
// POST /orders                        → Sipariş
// GET  /orders/:id                    → Sipariş durumu
```

### TARBİL Entegrasyonu (Büyükbaş)
```typescript
// POST /tarbil/sync/:petId            → TARBİL'e veri gönder
// GET  /tarbil/status/:petId          → Kayıt durumu
```

---

## Prisma Migration Planı

Yeni tablolar için migration sırası:

```bash
# 1. Push token tablosu
npx prisma migrate dev --name add-push-tokens

# 2. Subscription tablosu  
npx prisma migrate dev --name add-subscriptions

# 3. Appointment tablosu
npx prisma migrate dev --name add-appointments

# 4. WhatsApp ayarları (Clinic tablosuna alan ekle)
npx prisma migrate dev --name add-whatsapp-settings
```

---

## .env Tam Liste (Güncel)

```env
# Mevcut
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."
CORS_ORIGINS="..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"
QR_TOKEN_SECRET="..."
QR_TOKEN_TTL="24h"
REDIS_URL="rediss://..."
RESEND_API_KEY="re_..."
MAIL_FROM="VetCep <noreply@vetcep.com>"

# Firebase (P0 — ekle)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Cloudflare R2 (P0 — ekle)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
R2_PUBLIC_BASE_URL=""

# iyzico (P0 — ekle)
IYZICO_API_KEY=""
IYZICO_SECRET_KEY=""
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"  # prod: https://api.iyzipay.com

# WhatsApp (P1 — ekle)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN=""
```

---

## Öncelik Sırası Özeti

```
Ay 1:  Firebase push + R2 dosya yükleme + Abonelik sistemi
Ay 2:  Randevu modülü + Admin endpoint'leri
Ay 3:  WhatsApp Business API
Ay 4:  BullMQ job queue + Analitik endpoint'leri
Ay 5:  Resend domain + E-posta şablonları genişletme
Ay 6+: AI / Insurance / Marketplace / TARBİL
```

---

## Notlar

- Firebase için Console'da proje oluştur → Service Account JSON indir → .env'e ekle
- R2 için Cloudflare Dashboard → R2 → Create bucket → API token oluştur
- iyzico için sandbox.iyzipay.com'dan test hesabı aç
- WhatsApp için Meta Business Suite → WhatsApp Business API → Phone number ekle → Template oluştur (Meta onayı 1-3 gün sürer)
- BullMQ mevcut Upstash Redis ile çalışır, yeni servis gerekmez

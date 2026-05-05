import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LabResultsModule } from './lab-results/lab-results.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ClinicsModule } from './clinics/clinics.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BillingModule } from './billing/billing.module';
import { AdminModule } from './admin/admin.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { OwnerHealthModule } from './owner-health/owner-health.module';
import { OwnersModule } from './owners/owners.module';
import { PrivacyModule } from './privacy/privacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    PetsModule,
    ExaminationsModule,
    VaccinationsModule,
    PrescriptionsModule,
    LabResultsModule,
    NotificationsModule,
    ClinicsModule,
    UploadsModule,
    AppointmentsModule,
    BillingModule,
    AdminModule,
    WhatsAppModule,
    AnalyticsModule,
    CampaignsModule,
    OwnerHealthModule,
    OwnersModule,
    PrivacyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';

@Module({
  imports: [AuditModule, NotificationsModule],
  controllers: [VaccinationsController],
  providers: [VaccinationsService],
})
export class VaccinationsModule {}

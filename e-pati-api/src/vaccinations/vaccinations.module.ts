import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';

@Module({
  imports: [NotificationsModule],
  controllers: [VaccinationsController],
  providers: [VaccinationsService],
})
export class VaccinationsModule {}

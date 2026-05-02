import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadsModule } from '../uploads/uploads.module';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  imports: [NotificationsModule, UploadsModule],
  controllers: [LabResultsController],
  providers: [LabResultsService],
})
export class LabResultsModule {}

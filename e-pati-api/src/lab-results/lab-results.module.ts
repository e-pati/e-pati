import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  imports: [UploadsModule],
  controllers: [LabResultsController],
  providers: [LabResultsService],
})
export class LabResultsModule {}

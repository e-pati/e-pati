import { Module } from '@nestjs/common';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  controllers: [LabResultsController],
  providers: [LabResultsService],
})
export class LabResultsModule {}

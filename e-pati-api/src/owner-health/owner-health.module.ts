import { Module } from '@nestjs/common';
import { OwnerHealthController } from './owner-health.controller';
import { OwnerHealthService } from './owner-health.service';

@Module({
  controllers: [OwnerHealthController],
  providers: [OwnerHealthService],
})
export class OwnerHealthModule {}

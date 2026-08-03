import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { MunicipalityController } from './municipality.controller';
import { MunicipalityService } from './municipality.service';

@Module({
  imports: [AuditModule],
  controllers: [MunicipalityController],
  providers: [MunicipalityService],
})
export class MunicipalityModule {}

import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';

@Module({
  imports: [AuditModule],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class RegistryModule {}

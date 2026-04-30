import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClinicsService } from './clinics.service';
import { ListClinicPatientsQueryDto } from './dto/list-clinic-patients-query.dto';

@ApiTags('clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get(':id/patients')
  @ApiOkResponse({ description: 'Clinic patient list.' })
  findPatients(
    @Param('id') id: string,
    @Query() query: ListClinicPatientsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.clinicsService.findPatients(id, query, user);
  }

  @Get(':id/dashboard')
  @ApiOkResponse({ description: 'Clinic dashboard summary.' })
  getDashboard(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.clinicsService.getDashboard(id, user);
  }
}

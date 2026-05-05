import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('clinic/summary')
  @ApiOkResponse({ description: 'Clinic analytics summary.' })
  summary(@CurrentUser() user: TokenPayload) {
    return this.analyticsService.summary(user);
  }

  @Get('lost-patients')
  lostPatients(@CurrentUser() user: TokenPayload) {
    return this.analyticsService.lostPatients(user);
  }

  @Get('top-medications')
  topMedications(@CurrentUser() user: TokenPayload) {
    return this.analyticsService.topMedications(user);
  }

  @Get('busy-hours')
  busyHours(@CurrentUser() user: TokenPayload) {
    return this.analyticsService.busyHours(user);
  }

  @Get('visit-trend')
  visitTrend(@CurrentUser() user: TokenPayload) {
    return this.analyticsService.visitTrend(user);
  }
}

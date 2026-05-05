import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDietPlanDto } from './dto/create-diet-plan.dto';
import { CreateWeightLogDto } from './dto/create-weight-log.dto';
import { OwnerHealthService } from './owner-health.service';

@ApiTags('owner-health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('owner-health')
export class OwnerHealthController {
  constructor(private readonly ownerHealthService: OwnerHealthService) {}

  @Get('overview')
  @ApiOkResponse({ description: 'Owner pet health tracking overview.' })
  overview(@CurrentUser() user: TokenPayload) {
    return this.ownerHealthService.overview(user);
  }

  @Post('weight-logs')
  createWeightLog(
    @Body() dto: CreateWeightLogDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.ownerHealthService.createWeightLog(dto, user);
  }

  @Post('diet-plans')
  createDietPlan(
    @Body() dto: CreateDietPlanDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.ownerHealthService.createDietPlan(dto, user);
  }
}

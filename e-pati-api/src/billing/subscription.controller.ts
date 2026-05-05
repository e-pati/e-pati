import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';

@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly billingService: BillingService) {}

  @Get('current')
  @ApiOkResponse({ description: 'Current clinic subscription.' })
  current(@CurrentUser() user: TokenPayload) {
    return this.billingService.getClinicCurrent(user);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: TokenPayload) {
    return this.billingService.cancelClinic(user);
  }

  @Post('resume')
  resume(@CurrentUser() user: TokenPayload) {
    return this.billingService.resumeClinic(user);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('owner-subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('owner-subscriptions')
export class OwnerSubscriptionsController {
  constructor(private readonly billingService: BillingService) {}

  @Get('current')
  @ApiOkResponse({ description: 'Current owner premium subscription.' })
  current(@CurrentUser() user: TokenPayload) {
    return this.billingService.getOwnerCurrent(user);
  }

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: TokenPayload) {
    return this.billingService.createOwnerCheckout(dto, user);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: TokenPayload) {
    return this.billingService.cancelOwner(user);
  }

  @Post('resume')
  resume(@CurrentUser() user: TokenPayload) {
    return this.billingService.resumeOwner(user);
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Clinic checkout session created.' })
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: TokenPayload) {
    return this.billingService.createClinicCheckout(dto, user);
  }

  @Post('webhook')
  @ApiOkResponse({ description: 'Payment webhook accepted.' })
  webhook(@Body() payload: Record<string, unknown>) {
    return this.billingService.handleWebhook(payload);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';
import { PrivacyService } from './privacy.service';

@ApiTags('privacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('requests')
  @ApiOkResponse({ description: 'Owner privacy requests.' })
  requests(@CurrentUser() user: TokenPayload) {
    return this.privacyService.requests(user);
  }

  @Post('requests')
  create(
    @Body() dto: CreatePrivacyRequestDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.privacyService.create(dto, user);
  }
}

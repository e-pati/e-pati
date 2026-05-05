import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectWhatsAppDto } from './dto/connect-whatsapp.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  @ApiOkResponse({ description: 'Clinic WhatsApp connection status.' })
  status(@CurrentUser() user: TokenPayload) {
    return this.whatsappService.status(user);
  }

  @Post('connect')
  connect(@Body() dto: ConnectWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.connect(dto, user);
  }

  @Post('test')
  test(@Body() dto: SendWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.send(
      { ...dto, type: dto.type ?? 'custom' },
      user,
    );
  }

  @Post('messages')
  send(@Body() dto: SendWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.send(dto, user);
  }
}

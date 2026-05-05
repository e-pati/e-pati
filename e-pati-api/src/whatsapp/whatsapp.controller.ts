import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectWhatsAppDto } from './dto/connect-whatsapp.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Clinic WhatsApp connection status.' })
  status(@CurrentUser() user: TokenPayload) {
    return this.whatsappService.status(user);
  }

  @Post('connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  connect(@Body() dto: ConnectWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.connect(dto, user);
  }

  @Post('test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  test(@Body() dto: SendWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.send(
      { ...dto, type: dto.type ?? 'custom' },
      user,
    );
  }

  @Post('messages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  send(@Body() dto: SendWhatsAppDto, @CurrentUser() user: TokenPayload) {
    return this.whatsappService.send(dto, user);
  }

  @Get('webhook')
  @ApiOkResponse({ description: 'Meta webhook verification.' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, verifyToken, challenge);
  }

  @Post('webhook')
  @ApiOkResponse({ description: 'Meta webhook event accepted.' })
  receiveWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Req() request: Request,
  ) {
    return this.whatsappService.receiveWebhook(
      payload,
      signature,
      (request as Request & { rawBody?: Buffer }).rawBody,
    );
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CampaignsService } from './campaigns.service';
import { LostPatientCampaignDto } from './dto/lost-patient-campaign.dto';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('lost-patients/candidates')
  candidates(@CurrentUser() user: TokenPayload) {
    return this.campaignsService.candidates(user);
  }

  @Post('lost-patients/preview')
  preview(
    @Body() dto: LostPatientCampaignDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.preview(dto, user);
  }

  @Post('lost-patients/send')
  send(@Body() dto: LostPatientCampaignDto, @CurrentUser() user: TokenPayload) {
    return this.campaignsService.send(dto, user);
  }

  @Get(':id/results')
  results(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.campaignsService.results(id, user);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Prescription and medications created.' })
  create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.create(dto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Prescription details.' })
  findOne(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.prescriptionsService.findOne(id, user);
  }

  @Get(':id/pdf')
  @ApiOkResponse({ description: 'Prescription PDF status or URL.' })
  getPdfUrl(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.prescriptionsService.getPdfUrl(id, user);
  }
}

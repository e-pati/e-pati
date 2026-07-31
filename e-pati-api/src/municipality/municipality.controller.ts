import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAdoptionListingDto } from './dto/create-adoption-listing.dto';
import { CreateMunicipalityCaseDto } from './dto/create-municipality-case.dto';
import { CreateSterilizationRecordDto } from './dto/create-sterilization-record.dto';
import { ListMunicipalityCasesQueryDto } from './dto/list-municipality-cases-query.dto';
import { UpdateAdoptionListingStatusDto } from './dto/update-adoption-listing-status.dto';
import { MunicipalityService } from './municipality.service';

@ApiTags('municipality')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('municipality')
export class MunicipalityController {
  constructor(private readonly municipalityService: MunicipalityService) {}

  @Get('cases')
  @ApiOkResponse({ description: 'Municipality shelter cases visible to user.' })
  listCases(
    @Query() query: ListMunicipalityCasesQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.municipalityService.listCases(query, user);
  }

  @Post('cases')
  @ApiCreatedResponse({
    description: 'Municipality shelter intake case opened.',
  })
  createCase(
    @Body() dto: CreateMunicipalityCaseDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.municipalityService.createCase(dto, user);
  }

  @Get('cases/:id')
  @ApiOkResponse({ description: 'Municipality shelter case detail.' })
  getCase(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.municipalityService.getCase(id, user);
  }

  @Post('cases/:id/sterilizations')
  @ApiCreatedResponse({ description: 'Sterilization record added to case.' })
  createSterilization(
    @Param('id') id: string,
    @Body() dto: CreateSterilizationRecordDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.municipalityService.createSterilization(id, dto, user);
  }

  @Post('cases/:id/adoption-listings')
  @ApiCreatedResponse({ description: 'Adoption listing created for case.' })
  createAdoptionListing(
    @Param('id') id: string,
    @Body() dto: CreateAdoptionListingDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.municipalityService.createAdoptionListing(id, dto, user);
  }

  @Patch('adoption-listings/:id/status')
  @ApiOkResponse({ description: 'Adoption listing status updated.' })
  updateAdoptionListingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdoptionListingStatusDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.municipalityService.updateAdoptionListingStatus(id, dto, user);
  }
}

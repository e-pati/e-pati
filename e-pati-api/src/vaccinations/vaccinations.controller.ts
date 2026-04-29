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
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { ListVaccinationsQueryDto } from './dto/list-vaccinations-query.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { VaccinationsService } from './vaccinations.service';

@ApiTags('vaccinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated vaccinations.' })
  findAll(
    @Query() query: ListVaccinationsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.vaccinationsService.findAll(query, user);
  }

  @Get('upcoming')
  @ApiOkResponse({ description: 'Upcoming vaccinations for the next 30 days.' })
  upcoming(@CurrentUser() user: TokenPayload) {
    return this.vaccinationsService.upcoming(user);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Vaccination created.' })
  create(@Body() dto: CreateVaccinationDto, @CurrentUser() user: TokenPayload) {
    return this.vaccinationsService.create(dto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Vaccination details.' })
  findOne(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.vaccinationsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Vaccination updated.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.vaccinationsService.update(id, dto, user);
  }
}

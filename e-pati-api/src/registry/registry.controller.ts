import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { TokenPayload } from '../auth/types/token-payload';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { CreatePremiseDto } from './dto/create-premise.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';
import { RecordMovementDto } from './dto/record-movement.dto';
import { RegistryService } from './registry.service';

@ApiTags('registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('overview')
  @ApiOkResponse({ description: 'Registry overview counts for dashboards.' })
  overview(@CurrentUser() user: TokenPayload) {
    return this.registryService.overview(user);
  }

  @Get('premises')
  @ApiOkResponse({ description: 'Premises visible to the current user.' })
  listPremises(@CurrentUser() user: TokenPayload) {
    return this.registryService.listPremises(user);
  }

  @Post('premises')
  @ApiCreatedResponse({ description: 'Premise created.' })
  createPremise(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreatePremiseDto,
  ) {
    return this.registryService.createPremise(user, dto);
  }

  @Get('animals')
  @ApiOkResponse({ description: 'Animals visible to the current user.' })
  listAnimals(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListAnimalsQueryDto,
  ) {
    return this.registryService.listAnimals(user, query);
  }

  @Post('animals')
  @ApiCreatedResponse({ description: 'Animal created in national registry core.' })
  createAnimal(@CurrentUser() user: TokenPayload, @Body() dto: CreateAnimalDto) {
    return this.registryService.createAnimal(user, dto);
  }

  @Get('animals/:id')
  @ApiOkResponse({ description: 'Animal details.' })
  getAnimal(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.registryService.getAnimal(user, id);
  }

  @Post('animals/:id/movements')
  @ApiCreatedResponse({ description: 'Animal movement recorded.' })
  recordMovement(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: RecordMovementDto,
  ) {
    return this.registryService.recordMovement(user, id, dto);
  }
}

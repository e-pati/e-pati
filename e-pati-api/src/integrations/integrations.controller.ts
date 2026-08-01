import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IntegrationsService } from './integrations.service';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('status')
  @ApiOkResponse({ description: 'Mock public-system integration status.' })
  status(@CurrentUser() user: TokenPayload) {
    return this.integrationsService.status(user);
  }

  @Get('haybis/animals/:identifier')
  @ApiOkResponse({ description: 'Simulated HAYBIS/TURKVET animal lookup.' })
  haybisAnimal(
    @Param('identifier') identifier: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.integrationsService.haybisAnimal(identifier, user);
  }

  @Get('petvet/pets/:identifier')
  @ApiOkResponse({ description: 'Simulated PETVET pet lookup.' })
  petvetPet(
    @Param('identifier') identifier: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.integrationsService.petvetPet(identifier, user);
  }

  @Get('edevlet/owner-animals')
  @ApiOkResponse({ description: 'Simulated e-Devlet owner animal context.' })
  edevletOwnerAnimals(
    @Query('identityRef') identityRef: string | undefined,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.integrationsService.edevletOwnerAnimals(identityRef, user);
  }
}

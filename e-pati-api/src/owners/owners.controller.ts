import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnersService } from './owners.service';

@ApiTags('owners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Patch('me')
  @ApiOkResponse({ description: 'Owner profile updated.' })
  updateMe(@Body() dto: UpdateOwnerDto, @CurrentUser() user: TokenPayload) {
    return this.ownersService.updateMe(dto, user);
  }
}

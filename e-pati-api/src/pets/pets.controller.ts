import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimPetDto } from './dto/claim-pet.dto';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @ApiOkResponse({ description: 'Pets visible to the current user.' })
  findAll(@CurrentUser() user: TokenPayload) {
    return this.petsService.findAllForUser(user);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Pet created for the current owner.' })
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreatePetDto) {
    return this.petsService.create(user, dto);
  }

  @Post('claim')
  @ApiOkResponse({ description: 'Pet claimed by microchip number.' })
  claim(@CurrentUser() user: TokenPayload, @Body() dto: ClaimPetDto) {
    return this.petsService.claim(user, dto);
  }

  @Get(':id/summary')
  @ApiOkResponse({ description: 'Pet health summary.' })
  getSummary(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.petsService.getSummary(id, user);
  }

  @Get(':id/qr')
  @ApiOkResponse({ description: '24 hour read-only QR token.' })
  createQrToken(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.petsService.createQrToken(id, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Pet details.' })
  findOne(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.petsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Pet updated.' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petsService.update(id, user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Pet soft deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.petsService.remove(id, user);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { ListLabResultsQueryDto } from './dto/list-lab-results-query.dto';
import { LabResultsService } from './lab-results.service';

@ApiTags('lab-results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lab-results')
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Lab result created.' })
  create(@Body() dto: CreateLabResultDto, @CurrentUser() user: TokenPayload) {
    return this.labResultsService.create(dto, user);
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated lab results.' })
  findAll(
    @Query() query: ListLabResultsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.labResultsService.findAll(query, user);
  }

  @Get(':id/file')
  @ApiOkResponse({ description: 'Temporary file URL.' })
  getFile(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.labResultsService.getFile(id, user);
  }
}

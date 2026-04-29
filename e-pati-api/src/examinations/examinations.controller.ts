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
import { CreateExaminationDto } from './dto/create-examination.dto';
import { ListExaminationsQueryDto } from './dto/list-examinations-query.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { ExaminationsService } from './examinations.service';

@ApiTags('examinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('examinations')
export class ExaminationsController {
  constructor(private readonly examinationsService: ExaminationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated examinations.' })
  findAll(
    @Query() query: ListExaminationsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.examinationsService.findAll(query, user);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Examination created.' })
  create(@Body() dto: CreateExaminationDto, @CurrentUser() user: TokenPayload) {
    return this.examinationsService.create(dto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Examination details.' })
  findOne(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.examinationsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Examination updated.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExaminationDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.examinationsService.update(id, dto, user);
  }
}

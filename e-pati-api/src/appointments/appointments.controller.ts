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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RequestAppointmentDto } from './dto/request-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Appointment calendar list.' })
  findAll(
    @Query() query: ListAppointmentsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.appointmentsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Appointment detail.' })
  findOne(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.appointmentsService.findOne(id, user);
  }

  @Post()
  @ApiOkResponse({ description: 'Clinic appointment created.' })
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: TokenPayload) {
    return this.appointmentsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Appointment updated.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.appointmentsService.update(id, dto, user);
  }

  @Post('request')
  @ApiOkResponse({ description: 'Owner appointment request created.' })
  request(
    @Body() dto: RequestAppointmentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.appointmentsService.request(dto, user);
  }

  @Post(':id/confirm')
  @ApiOkResponse({ description: 'Pending appointment confirmed.' })
  confirm(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.appointmentsService.confirm(id, user);
  }
}

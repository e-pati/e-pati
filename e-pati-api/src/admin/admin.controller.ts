import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { TokenPayload } from '../auth/types/token-payload';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOkResponse({ description: 'Admin dashboard metrics.' })
  dashboard(@CurrentUser() user: TokenPayload) {
    return this.adminService.dashboard(user);
  }

  @Get('clinics')
  @ApiOkResponse({ description: 'Admin clinic list.' })
  clinics(@CurrentUser() user: TokenPayload) {
    return this.adminService.clinics(user);
  }

  @Get('clinics/:id')
  @ApiOkResponse({ description: 'Admin clinic detail.' })
  clinic(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.adminService.clinic(id, user);
  }

  @Get('revenue/summary')
  revenueSummary(@CurrentUser() user: TokenPayload) {
    return this.adminService.revenueSummary(user);
  }

  @Get('revenue/monthly')
  revenueMonthly(@CurrentUser() user: TokenPayload) {
    return this.adminService.revenueMonthly(user);
  }
}

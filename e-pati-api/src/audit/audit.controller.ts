import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { TokenPayload } from '../auth/types/token-payload';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from './audit.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOkResponse({ description: 'Paginated audit log entries for admins.' })
  listLogs(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditService.listLogs(user, query);
  }

  @Get('logs/:id')
  @ApiOkResponse({ description: 'Single audit log entry for admins.' })
  getLog(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.auditService.getLog(user, id);
  }
}

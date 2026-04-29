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
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated owner notifications.' })
  findAll(
    @Query() query: ListNotificationsQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.notificationsService.findAll(query, user);
  }

  @Patch(':id/read')
  @ApiOkResponse({ description: 'Notification marked as read.' })
  markRead(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.notificationsService.markRead(id, user);
  }

  @Post('preferences')
  @ApiOkResponse({ description: 'Notification preferences accepted.' })
  updatePreferences(
    @Body() dto: UpdateNotificationPreferencesDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.notificationsService.updatePreferences(dto, user);
  }
}

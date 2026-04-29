import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListNotificationsQueryDto, user: TokenPayload) {
    this.ensureOwner(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      ownerId: user.sub,
      ...(query.status === 'read' ? { readAt: { not: null } } : {}),
      ...(query.status === 'unread' ? { readAt: null } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async markRead(id: string, user: TokenPayload) {
    this.ensureOwner(user);
    const notification = await this.prisma.notification.findFirst({
      where: { id, ownerId: user.sub },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date(), status: 'READ' },
    });
  }

  updatePreferences(dto: UpdateNotificationPreferencesDto, user: TokenPayload) {
    this.ensureOwner(user);

    return {
      ownerId: user.sub,
      preferences: {
        push: dto.push ?? true,
        email: dto.email ?? true,
        sms: dto.sms ?? false,
      },
      persistence: 'pending_schema_support',
    };
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role === Role.OWNER) {
      return;
    }

    throw new ForbiddenException('Only owners can access notifications.');
  }
}

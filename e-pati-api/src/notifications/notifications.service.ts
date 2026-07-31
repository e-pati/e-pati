import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
  Role,
} from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { PushNotificationsService } from './push-notifications.service';

type CreateOwnerNotificationInput = {
  ownerId: string;
  title: string;
  body: string;
  payload?: Prisma.InputJsonObject;
  scheduledAt?: Date;
};

type CreateClinicNotificationInput = {
  clinicId: string;
  title: string;
  body: string;
  payload?: Prisma.InputJsonObject;
};

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private scheduledWorker?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotifications: PushNotificationsService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    if (
      this.configService.get<string>('NOTIFICATION_WORKER_ENABLED') === 'false'
    ) {
      return;
    }

    this.scheduledWorker = setInterval(() => {
      void this.sendDueScheduledNotifications();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.scheduledWorker) {
      clearInterval(this.scheduledWorker);
    }
  }

  async findAll(query: ListNotificationsQueryDto, user: TokenPayload) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.notificationScope(query, user);

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
    const notification = await this.prisma.notification.findFirst({
      where: { id, ...this.notificationScope({}, user) },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date(), status: 'READ' },
    });
  }

  async getPreferences(user: TokenPayload) {
    this.ensureOwner(user);
    const owner = await this.prisma.owner.findUnique({
      where: { id: user.sub },
      select: {
        pushEnabled: true,
        pushToken: true,
        notificationPreferences: true,
      },
    });
    const preferences = this.defaultPreferences(owner?.notificationPreferences);

    return {
      ...preferences,
      enabled: owner?.pushEnabled ?? preferences.enabled,
      pushToken: owner?.pushToken ?? undefined,
    };
  }

  updatePreferences(dto: UpdateNotificationPreferencesDto, user: TokenPayload) {
    this.ensureOwner(user);
    const enabled = dto.enabled ?? dto.push ?? true;
    const preferences = {
      enabled,
      vaccinationAlerts: dto.vaccinationAlerts ?? true,
      medicationReminders: dto.medicationReminders ?? true,
      appointmentReminders: dto.appointmentReminders ?? true,
      campaignMessages: dto.campaignMessages ?? true,
      email: dto.email ?? true,
      sms: dto.sms ?? false,
      platform: dto.platform,
    };

    return this.prisma.owner.update({
      where: { id: user.sub },
      data: {
        pushEnabled: enabled,
        pushToken: dto.pushToken,
        notificationPreferences: preferences,
      },
      select: {
        id: true,
        pushEnabled: true,
        pushToken: true,
        notificationPreferences: true,
      },
    });
  }

  registerPushToken(dto: RegisterPushTokenDto, user: TokenPayload) {
    this.ensureOwner(user);
    const pushToken = dto.pushToken ?? dto.token;

    if (!pushToken) {
      throw new BadRequestException('Push token is required.');
    }

    return this.prisma.owner.update({
      where: { id: user.sub },
      data: {
        pushEnabled: true,
        pushToken,
        notificationPreferences: {
          ...this.defaultPreferences(undefined),
          platform: dto.platform,
        },
      },
      select: {
        id: true,
        pushEnabled: true,
        pushToken: true,
      },
    });
  }

  async createOwnerNotification(input: CreateOwnerNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        ownerId: input.ownerId,
        channel: NotificationChannel.PUSH,
        title: input.title,
        body: input.body,
        payload: input.payload,
        scheduledAt: input.scheduledAt,
      },
    });

    if (input.scheduledAt && input.scheduledAt > new Date()) {
      return notification;
    }

    return this.sendExistingNotification(notification.id);
  }

  createClinicNotification(input: CreateClinicNotificationInput) {
    return this.prisma.notification.create({
      data: {
        clinicId: input.clinicId,
        channel: NotificationChannel.PUSH,
        status: NotificationStatus.SENT,
        title: input.title,
        body: input.body,
        payload: input.payload,
        sentAt: new Date(),
      },
    });
  }

  async sendDueScheduledNotifications(limit = 25): Promise<void> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        channel: NotificationChannel.PUSH,
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });

    await Promise.all(
      notifications.map((notification) =>
        this.sendExistingNotification(notification.id),
      ),
    );
  }

  private async sendExistingNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.status !== 'PENDING') {
      return notification;
    }

    if (!notification.ownerId) {
      return notification;
    }

    const owner = await this.prisma.owner.findFirst({
      where: { id: notification.ownerId, deletedAt: null },
      select: { pushToken: true, pushEnabled: true },
    });

    if (!owner?.pushToken || !owner.pushEnabled) {
      return notification;
    }

    try {
      await this.pushNotifications.send({
        token: owner.pushToken,
        title: notification.title,
        body: notification.body,
        data: this.toRecord(notification.payload),
      });

      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      this.logger.warn(
        `Push notification failed for ${notification.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private toRecord(payload: unknown): Record<string, unknown> | undefined {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return undefined;
    }

    return payload as Record<string, unknown>;
  }

  private defaultPreferences(value: unknown) {
    const preferences =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

    return {
      enabled: this.booleanPreference(preferences.enabled, true),
      vaccinationAlerts: this.booleanPreference(
        preferences.vaccinationAlerts,
        true,
      ),
      medicationReminders: this.booleanPreference(
        preferences.medicationReminders,
        true,
      ),
      appointmentReminders: this.booleanPreference(
        preferences.appointmentReminders,
        true,
      ),
      campaignMessages: this.booleanPreference(
        preferences.campaignMessages,
        true,
      ),
      email: this.booleanPreference(preferences.email, true),
      sms: this.booleanPreference(preferences.sms, false),
      platform:
        typeof preferences.platform === 'string'
          ? preferences.platform
          : undefined,
    };
  }

  private booleanPreference(value: unknown, fallback: boolean) {
    return typeof value === 'boolean' ? value : fallback;
  }

  private notificationScope(
    query: Pick<ListNotificationsQueryDto, 'status'>,
    user: TokenPayload,
  ): Prisma.NotificationWhereInput {
    const statusScope =
      query.status === 'read'
        ? { readAt: { not: null } }
        : query.status === 'unread'
          ? { readAt: null }
          : {};

    if (user.role === Role.SUPER_ADMIN) {
      return statusScope;
    }

    if (user.role === Role.OWNER) {
      return { ownerId: user.sub, ...statusScope };
    }

    if (
      (user.role === Role.VETERINARIAN || user.role === Role.CLINIC_ADMIN) &&
      user.clinicId
    ) {
      return { clinicId: user.clinicId, ...statusScope };
    }

    throw new ForbiddenException('You cannot access notifications.');
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role === Role.OWNER) {
      return;
    }

    throw new ForbiddenException('Only owners can access notifications.');
  }
}

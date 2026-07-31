import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';

describe('NotificationsService', () => {
  type NotificationFindManyArgs = {
    where: Record<string, unknown>;
    orderBy?: Record<string, string>;
    skip?: number;
    take?: number;
  };
  type NotificationCountArgs = { where: Record<string, unknown> };
  type NotificationUpdateArgs = {
    where: { id: string };
    data: { readAt?: Date; status?: NotificationStatus };
  };
  type NotificationCreateArgs = {
    data: {
      clinicId?: string;
      channel: NotificationChannel;
      status?: NotificationStatus;
      title: string;
      body: string;
      payload?: Record<string, unknown>;
      sentAt?: Date;
    };
  };

  const notificationFindMany = jest.fn<
    Promise<unknown[]>,
    [NotificationFindManyArgs]
  >();
  const notificationCount = jest.fn<Promise<number>, [NotificationCountArgs]>();
  const notificationFindFirst = jest.fn<
    Promise<{ id: string; clinicId?: string; readAt: Date | null } | null>,
    [{ where: Record<string, unknown> }]
  >();
  const notificationUpdate = jest.fn<
    Promise<unknown>,
    [NotificationUpdateArgs]
  >();
  const notificationCreate = jest.fn<
    Promise<unknown>,
    [NotificationCreateArgs]
  >();
  const prisma = {
    notification: {
      findMany: notificationFindMany,
      count: notificationCount,
      findFirst: notificationFindFirst,
      update: notificationUpdate,
      create: notificationCreate,
    },
  } as unknown as PrismaService;
  const pushNotifications = {} as PushNotificationsService;
  const configService = { get: jest.fn() } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createService() {
    return new NotificationsService(prisma, pushNotifications, configService);
  }

  it('lists owner notifications with owner scope', async () => {
    const service = createService();
    notificationFindMany.mockResolvedValue([]);
    notificationCount.mockResolvedValue(0);

    await service.findAll(
      { page: 1, limit: 20, status: 'unread' },
      {
        sub: 'owner-1',
        email: 'owner@example.com',
        role: Role.OWNER,
        type: 'owner',
      },
    );

    expect(notificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 'owner-1', readAt: null },
      }),
    );
  });

  it('lists clinic notifications with clinic scope', async () => {
    const service = createService();
    notificationFindMany.mockResolvedValue([]);
    notificationCount.mockResolvedValue(0);

    await service.findAll(
      { page: 1, limit: 20 },
      {
        sub: 'vet-1',
        email: 'vet@example.com',
        role: Role.VETERINARIAN,
        type: 'veterinarian',
        clinicId: 'clinic-1',
      },
    );

    expect(notificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clinicId: 'clinic-1' },
      }),
    );
  });

  it('marks clinic scoped notifications as read', async () => {
    const service = createService();
    const notification = {
      id: 'notification-1',
      clinicId: 'clinic-1',
      readAt: null,
    };
    notificationFindFirst.mockResolvedValue(notification);
    notificationUpdate.mockResolvedValue({
      ...notification,
      status: NotificationStatus.READ,
      readAt: new Date('2026-07-31T10:00:00.000Z'),
    });

    await service.markRead('notification-1', {
      sub: 'vet-1',
      email: 'vet@example.com',
      role: Role.VETERINARIAN,
      type: 'veterinarian',
      clinicId: 'clinic-1',
    });

    expect(notificationFindFirst).toHaveBeenCalledWith({
      where: { id: 'notification-1', clinicId: 'clinic-1' },
    });
    const updateArg = notificationUpdate.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: 'notification-1' });
    expect(updateArg.data.status).toBe(NotificationStatus.READ);
  });

  it('creates clinic notifications as in-app sent records', async () => {
    const service = createService();
    notificationCreate.mockResolvedValue({ id: 'notification-1' });

    await service.createClinicNotification({
      clinicId: 'clinic-1',
      title: 'Aşı kaydı oluşturuldu',
      body: 'Misket için aşı kaydı eklendi.',
      payload: { type: 'vaccination', petId: 'pet-1' },
    });

    const createArg = notificationCreate.mock.calls[0][0];
    expect(createArg.data.clinicId).toBe('clinic-1');
    expect(createArg.data.channel).toBe(NotificationChannel.PUSH);
    expect(createArg.data.status).toBe(NotificationStatus.SENT);
    expect(createArg.data.sentAt).toBeInstanceOf(Date);
  });

  it('rejects clinic staff without clinic scope', async () => {
    const service = createService();

    await expect(
      service.findAll(
        { page: 1, limit: 20 },
        {
          sub: 'vet-1',
          email: 'vet@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

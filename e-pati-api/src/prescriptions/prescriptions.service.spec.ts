import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { PrescriptionsService } from './prescriptions.service';

describe('PrescriptionsService', () => {
  const prescriptionFindMany = jest.fn();
  const prescriptionCount = jest.fn();
  const prisma = {
    pet: {
      findFirst: jest.fn(),
    },
    prescription: {
      create: jest.fn(),
      findMany: prescriptionFindMany,
      count: prescriptionCount,
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const uploadsService = {} as UploadsService;
  const notificationsService = {
    createOwnerNotification: jest.fn(),
    createClinicNotification: jest.fn(),
  } as unknown as NotificationsService;
  const auditService = {
    record: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (
      prisma as never as { pet: { findFirst: jest.Mock } }
    ).pet.findFirst.mockResolvedValue({
      id: 'pet-1',
      ownerId: 'owner-1',
      clinicId: 'clinic-1',
    });
    (
      prisma as never as { $transaction: jest.Mock }
    ).$transaction.mockImplementation((callback) => callback(prisma));
    (
      prisma as never as { prescription: { create: jest.Mock } }
    ).prescription.create.mockResolvedValue({
      id: 'rx-1',
      petId: 'pet-1',
      clinicId: 'clinic-1',
      veterinarianId: 'vet-1',
      diagnosis: 'Kontrol',
      notes: null,
      medications: [{ id: 'med-1' }, { id: 'med-2' }],
      clinic: { id: 'clinic-1', name: 'Demo Klinik' },
    });
    (
      notificationsService as never as {
        createOwnerNotification: jest.Mock;
        createClinicNotification: jest.Mock;
      }
    ).createOwnerNotification.mockResolvedValue({ id: 'notif-owner' });
    (
      notificationsService as never as {
        createOwnerNotification: jest.Mock;
        createClinicNotification: jest.Mock;
      }
    ).createClinicNotification.mockResolvedValue({ id: 'notif-clinic' });
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  function createService() {
    return new PrescriptionsService(
      prisma,
      uploadsService,
      notificationsService,
      auditService as never,
    );
  }

  it('records audit log when a veterinarian creates a prescription', async () => {
    const service = createService();
    const user = {
      sub: 'vet-1',
      email: 'vet@example.com',
      role: Role.VETERINARIAN,
      type: 'veterinarian' as const,
      clinicId: 'clinic-1',
    };

    await service.create(
      {
        petId: 'pet-1',
        diagnosis: 'Kontrol',
        medications: [
          {
            name: 'Amoxicillin',
            dose: '50mg',
            frequency: 'Günde 2',
            duration: '7 gün',
          },
          {
            name: 'Vitamin',
            dose: '1 tablet',
            frequency: 'Günde 1',
            duration: '5 gün',
          },
        ],
      },
      user,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        action: 'prescription.create',
        resourceType: 'Prescription',
        resourceId: 'rx-1',
        metadata: expect.objectContaining({
          petId: 'pet-1',
          ownerId: 'owner-1',
          clinicId: 'clinic-1',
          veterinarianId: 'vet-1',
          medicationCount: 2,
          hasDiagnosis: true,
          hasNotes: false,
        }),
      }),
    );
  });

  it('lists only the owner scoped pet prescriptions', async () => {
    const service = createService();
    prescriptionFindMany.mockResolvedValue([]);
    prescriptionCount.mockResolvedValue(0);

    await service.findAll(
      { page: 1, limit: 20, petId: 'pet-1' },
      {
        sub: 'owner-1',
        email: 'owner@example.com',
        role: Role.OWNER,
        type: 'owner',
      },
    );

    expect(prescriptionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          petId: 'pet-1',
          pet: { ownerId: 'owner-1', deletedAt: null },
        },
      }),
    );
  });

  it('lists clinic prescriptions without leaking other clinics', async () => {
    const service = createService();
    prescriptionFindMany.mockResolvedValue([
      {
        id: 'rx-1',
        petId: 'pet-1',
        clinicId: 'clinic-1',
        veterinarianId: 'vet-1',
        diagnosis: null,
        notes: null,
        pdfUrl: null,
        medications: [],
        clinic: { id: 'clinic-1', name: 'Demo Klinik' },
        veterinarian: { id: 'vet-1', fullName: 'Ayse Demir' },
        createdAt: new Date('2026-07-31T10:00:00.000Z'),
        updatedAt: new Date('2026-07-31T10:00:00.000Z'),
        deletedAt: null,
      },
    ]);
    prescriptionCount.mockResolvedValue(1);

    const result = await service.findAll(
      { page: 1, limit: 20 },
      {
        sub: 'vet-1',
        email: 'vet@example.com',
        role: Role.VETERINARIAN,
        type: 'veterinarian',
        clinicId: 'clinic-1',
      },
    );

    expect(prescriptionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [
            { clinicId: 'clinic-1' },
            { pet: { clinicId: 'clinic-1', deletedAt: null } },
          ],
        },
      }),
    );
    expect(result.items[0]).toMatchObject({
      id: 'rx-1',
      vet: { id: 'vet-1', fullName: 'Ayse Demir', title: 'Dr.' },
    });
  });

  it('rejects clinic staff without a clinic scope', async () => {
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

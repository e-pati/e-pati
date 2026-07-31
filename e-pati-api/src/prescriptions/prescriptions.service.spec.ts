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
    prescription: {
      findMany: prescriptionFindMany,
      count: prescriptionCount,
    },
  } as unknown as PrismaService;

  const uploadsService = {} as UploadsService;
  const notificationsService = {} as NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createService() {
    return new PrescriptionsService(
      prisma,
      uploadsService,
      notificationsService,
    );
  }

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

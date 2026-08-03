import { Role } from '@prisma/client';
import { LabResultsService } from './lab-results.service';

describe('LabResultsService', () => {
  const collectedAt = new Date('2026-08-03T09:00:00.000Z');
  const pet = {
    id: 'pet-1',
    ownerId: 'owner-1',
    clinicId: 'clinic-1',
    name: 'Misket',
  };
  const labResult = {
    id: 'lab-1',
    petId: 'pet-1',
    clinicId: 'clinic-1',
    veterinarianId: 'vet-1',
    title: 'Kan paneli',
    fileUrl: 'https://cdn.example.com/lab.pdf',
    mimeType: 'application/pdf',
    notes: null,
    collectedAt,
    createdAt: collectedAt,
    updatedAt: collectedAt,
    deletedAt: null,
    clinic: { id: 'clinic-1', name: 'Demo Klinik' },
  };
  const prisma = {
    pet: {
      findFirst: jest.fn(),
    },
    labResult: {
      create: jest.fn(),
    },
  };
  const uploadsService = {};
  const notificationsService = {
    createOwnerNotification: jest.fn(),
    createClinicNotification: jest.fn(),
  };
  const auditService = {
    record: jest.fn(),
  };
  const user = {
    sub: 'vet-1',
    email: 'vet@example.com',
    role: Role.VETERINARIAN,
    type: 'veterinarian' as const,
    clinicId: 'clinic-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.pet.findFirst.mockResolvedValue(pet);
    prisma.labResult.create.mockResolvedValue(labResult);
    notificationsService.createOwnerNotification.mockResolvedValue({
      id: 'notif-owner',
    });
    notificationsService.createClinicNotification.mockResolvedValue({
      id: 'notif-clinic',
    });
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  it('records audit log when a lab result is created', async () => {
    const service = new LabResultsService(
      prisma as never,
      uploadsService as never,
      notificationsService as never,
      auditService as never,
    );

    await service.create(
      {
        petId: 'pet-1',
        title: 'Kan paneli',
        fileUrl: 'https://cdn.example.com/lab.pdf',
        mimeType: 'application/pdf',
        collectedAt: collectedAt.toISOString(),
      },
      user,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        action: 'labResult.create',
        resourceType: 'LabResult',
        resourceId: 'lab-1',
        metadata: expect.objectContaining({
          petId: 'pet-1',
          ownerId: 'owner-1',
          clinicId: 'clinic-1',
          veterinarianId: 'vet-1',
          title: 'Kan paneli',
          mimeType: 'application/pdf',
          collectedAt,
          hasFile: true,
        }),
      }),
    );
  });
});

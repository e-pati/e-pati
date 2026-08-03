import { Role } from '@prisma/client';
import { VaccinationsService } from './vaccinations.service';

describe('VaccinationsService', () => {
  const appliedAt = new Date('2026-08-03T09:00:00.000Z');
  const dueAt = new Date('2027-08-03T09:00:00.000Z');
  const pet = {
    id: 'pet-1',
    ownerId: 'owner-1',
    clinicId: 'clinic-1',
    name: 'Misket',
  };
  const vaccination = {
    id: 'vaccination-1',
    petId: 'pet-1',
    clinicId: 'clinic-1',
    veterinarianId: 'vet-1',
    name: 'Kuduz',
    lotNumber: 'LOT-2026',
    appliedAt,
    dueAt,
    notes: null,
    createdAt: appliedAt,
    updatedAt: appliedAt,
    deletedAt: null,
    clinic: { id: 'clinic-1', name: 'Demo Klinik' },
  };
  const prisma = {
    pet: {
      findFirst: jest.fn(),
    },
    vaccination: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
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
    prisma.vaccination.create.mockResolvedValue(vaccination);
    prisma.vaccination.findFirst.mockResolvedValue({
      ...vaccination,
      pet,
    });
    prisma.vaccination.update.mockResolvedValue({
      ...vaccination,
      dueAt: new Date('2027-09-03T09:00:00.000Z'),
    });
    notificationsService.createOwnerNotification.mockResolvedValue({
      id: 'notif-owner',
    });
    notificationsService.createClinicNotification.mockResolvedValue({
      id: 'notif-clinic',
    });
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  function createService() {
    return new VaccinationsService(
      prisma as never,
      notificationsService as never,
      auditService as never,
    );
  }

  it('records audit log when a vaccination is created', async () => {
    const service = createService();

    await service.create(
      {
        petId: 'pet-1',
        name: 'Kuduz',
        lotNumber: 'LOT-2026',
        appliedAt: appliedAt.toISOString(),
        dueAt: dueAt.toISOString(),
      },
      user,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        action: 'vaccination.create',
        resourceType: 'Vaccination',
        resourceId: 'vaccination-1',
        metadata: expect.objectContaining({
          petId: 'pet-1',
          ownerId: 'owner-1',
          clinicId: 'clinic-1',
          veterinarianId: 'vet-1',
          name: 'Kuduz',
          lotNumber: 'LOT-2026',
        }),
      }),
    );
  });

  it('records audit log when a vaccination is updated', async () => {
    const service = createService();

    await service.update(
      'vaccination-1',
      { dueAt: '2027-09-03T09:00:00.000Z', notes: 'Takip edildi' },
      user,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        action: 'vaccination.update',
        resourceType: 'Vaccination',
        resourceId: 'vaccination-1',
        metadata: expect.objectContaining({
          previousDueAt: dueAt,
          changedFields: ['dueAt', 'notes'],
        }),
      }),
    );
  });
});

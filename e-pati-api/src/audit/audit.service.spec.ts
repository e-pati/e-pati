import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  const prisma = {
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  it('records owner scoped audit entries', async () => {
    const service = new AuditService(prisma as never);

    await service.record(
      {
        sub: 'owner-1',
        email: 'owner@example.com',
        role: Role.OWNER,
        type: 'owner',
      },
      {
        action: 'registry.animal.create',
        resourceType: 'Animal',
        resourceId: 'animal-1',
        metadata: { skipped: undefined, changedFields: ['name'] },
      },
    );

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: 'owner-1',
        action: 'registry.animal.create',
        resourceType: 'Animal',
        resourceId: 'animal-1',
        metadata: { changedFields: ['name'] },
      }),
    });
  });

  it('records veterinarian scoped audit entries', async () => {
    const service = new AuditService(prisma as never);

    await service.record(
      {
        sub: 'vet-1',
        email: 'vet@example.com',
        role: Role.VETERINARIAN,
        type: 'veterinarian',
        clinicId: 'clinic-1',
      },
      {
        action: 'municipality.case.create',
        resourceType: 'MunicipalityAnimalCase',
        resourceId: 'case-1',
        metadata: { intakeAt: new Date('2026-08-03T09:00:00.000Z') },
      },
    );

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        veterinarianId: 'vet-1',
        metadata: { intakeAt: '2026-08-03T09:00:00.000Z' },
      }),
    });
  });
});

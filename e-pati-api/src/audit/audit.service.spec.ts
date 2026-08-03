import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  const createdAt = new Date('2026-08-03T09:00:00.000Z');
  const prisma = {
    auditLog: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const adminUser = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: Role.SUPER_ADMIN,
    type: 'veterinarian' as const,
  };
  const ownerUser = {
    sub: 'owner-1',
    email: 'owner@example.com',
    role: Role.OWNER,
    type: 'owner' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.auditLog.findMany.mockResolvedValue([]);
    prisma.auditLog.findUnique.mockResolvedValue(null);
    prisma.auditLog.count.mockResolvedValue(0);
  });

  it('records owner scoped audit entries', async () => {
    const service = new AuditService(prisma as never);

    await service.record(ownerUser, {
      action: 'registry.animal.create',
      resourceType: 'Animal',
      resourceId: 'animal-1',
      metadata: { skipped: undefined, changedFields: ['name'] },
    });

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

  it('lists filtered audit entries for admins', async () => {
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-1',
        ownerId: null,
        veterinarianId: 'vet-1',
        action: 'municipality.case.create',
        resourceType: 'MunicipalityAnimalCase',
        resourceId: 'case-1',
        ipAddress: null,
        metadata: { foundProvince: 'Ankara' },
        createdAt,
        owner: null,
        veterinarian: {
          id: 'vet-1',
          fullName: 'Ayse Demir',
          email: 'vet@example.com',
        },
      },
    ]);
    prisma.auditLog.count.mockResolvedValue(1);
    const service = new AuditService(prisma as never);

    const result = await service.listLogs(adminUser, {
      actorId: 'vet-1',
      actorType: 'veterinarian',
      resourceType: 'MunicipalityAnimalCase',
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-03T23:59:59.000Z',
      page: 2,
      limit: 25,
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          veterinarianId: 'vet-1',
          resourceType: 'MunicipalityAnimalCase',
          createdAt: {
            gte: new Date('2026-08-01T00:00:00.000Z'),
            lte: new Date('2026-08-03T23:59:59.000Z'),
          },
        }),
        skip: 25,
        take: 25,
      }),
    );
    expect(result).toMatchObject({
      total: 1,
      page: 2,
      limit: 25,
      items: [
        {
          id: 'audit-1',
          actor: {
            type: 'veterinarian',
            id: 'vet-1',
            fullName: 'Ayse Demir',
          },
        },
      ],
    });
  });

  it('rejects audit log listing for non-admin users', async () => {
    const service = new AuditService(prisma as never);

    await expect(service.listLogs(ownerUser, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns not found for missing audit detail', async () => {
    const service = new AuditService(prisma as never);

    await expect(service.getLog(adminUser, 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

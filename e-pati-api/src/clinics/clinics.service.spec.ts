import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClinicsService } from './clinics.service';

describe('ClinicsService', () => {
  function createService() {
    const prisma = {
      pet: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as unknown as PrismaService;

    return { service: new ClinicsService(prisma), prisma };
  }

  it('allows clinic staff to list their clinic patients', async () => {
    const { service } = createService();

    await expect(
      service.findPatients(
        'clinic-1',
        { page: 1, limit: 20 },
        {
          sub: 'vet-1',
          email: 'vet@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
          clinicId: 'clinic-1',
        },
      ),
    ).resolves.toMatchObject({ items: [], total: 0, page: 1, limit: 20 });
  });

  it('rejects clinic staff from another clinic', async () => {
    const { service } = createService();

    await expect(
      service.findPatients(
        'clinic-1',
        { page: 1, limit: 20 },
        {
          sub: 'vet-2',
          email: 'other@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
          clinicId: 'clinic-2',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

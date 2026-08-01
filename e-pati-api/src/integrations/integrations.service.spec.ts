import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnimalClass, AnimalIdentifierType, Role } from '@prisma/client';
import { IntegrationsService } from './integrations.service';

describe('IntegrationsService', () => {
  const prisma = {
    animal: {
      findFirst: jest.fn(),
    },
    pet: {
      findFirst: jest.fn(),
    },
    owner: {
      findFirst: jest.fn(),
    },
  };

  const superAdminUser = {
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
  });

  function createService() {
    return new IntegrationsService(prisma as never);
  }

  it('returns explicit mock adapter status for super admins', () => {
    const service = createService();

    expect(service.status(superAdminUser)).toMatchObject({
      simulation: true,
      adapters: expect.arrayContaining([
        expect.objectContaining({
          key: 'haybis',
          officialConnection: false,
        }),
        expect.objectContaining({
          key: 'petvet',
          officialConnection: false,
        }),
        expect.objectContaining({
          key: 'edevlet',
          officialConnection: false,
        }),
      ]),
    });
  });

  it('rejects owner access to integration simulations', () => {
    const service = createService();

    expect(() => service.status(ownerUser)).toThrow(ForbiddenException);
  });

  it('looks up a simulated HAYBIS animal by HKN or ear tag', async () => {
    prisma.animal.findFirst.mockResolvedValue({
      id: 'animal-1',
      hkn: 'HKN-2026-0001',
    });
    const service = createService();

    const result = await service.haybisAnimal(
      ' tr060000000001 ',
      superAdminUser,
    );

    expect(prisma.animal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          class: { in: [AnimalClass.CATTLE, AnimalClass.SMALL_RUMINANT] },
          OR: expect.arrayContaining([
            { hkn: 'TR060000000001' },
            expect.objectContaining({
              identifiers: {
                some: {
                  type: {
                    in: [
                      AnimalIdentifierType.HKN,
                      AnimalIdentifierType.EAR_TAG,
                    ],
                  },
                  value: 'TR060000000001',
                },
              },
            }),
          ]),
        }),
      }),
    );
    expect(result).toMatchObject({
      simulation: true,
      authority: 'HAYBIS/TURKVET',
      queriedIdentifier: 'TR060000000001',
    });
  });

  it('looks up a simulated PETVET pet by microchip or registry identifier', async () => {
    prisma.pet.findFirst.mockResolvedValue({
      id: 'pet-1',
      microchipNo: '900182000123456',
    });
    const service = createService();

    const result = await service.petvetPet('900182000123456', superAdminUser);

    expect(prisma.pet.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ microchipNo: '900182000123456' }]),
        }),
      }),
    );
    expect(result).toMatchObject({
      simulation: true,
      authority: 'PETVET',
      queriedIdentifier: '900182000123456',
    });
  });

  it('returns simulated e-Devlet owner animal context', async () => {
    prisma.owner.findFirst.mockResolvedValue({
      id: 'owner-1',
      fullName: 'Burak Yilmaz',
      pets: [],
      animals: [],
    });
    const service = createService();

    const result = await service.edevletOwnerAnimals(
      'sahip@example.com',
      superAdminUser,
    );

    expect(prisma.owner.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [{ id: 'sahip@example.com' }, { email: 'sahip@example.com' }],
        },
      }),
    );
    expect(result).toMatchObject({
      simulation: true,
      authority: 'e-Devlet',
      owner: { id: 'owner-1' },
    });
  });

  it('returns not found when a simulated adapter has no matching data', async () => {
    prisma.animal.findFirst.mockResolvedValue(null);
    const service = createService();

    await expect(
      service.haybisAnimal('missing', superAdminUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

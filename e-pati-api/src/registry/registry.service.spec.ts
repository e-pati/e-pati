import {
  AdoptionListingStatus,
  AnimalClass,
  AnimalIdentifierType,
  AnimalSex,
  AnimalStatus,
  MunicipalityCaseStatus,
  MovementReason,
  PremiseType,
  Role,
} from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { RegistryService } from './registry.service';

describe('RegistryService', () => {
  const prisma = {
    animal: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    premise: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    animalMovement: {
      count: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
    },
    municipalityAnimalCase: {
      groupBy: jest.fn(),
    },
    adoptionListing: {
      groupBy: jest.fn(),
    },
    vaccination: {
      count: jest.fn(),
    },
    pet: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ownerUser = {
    sub: 'owner-1',
    email: 'owner@example.com',
    role: Role.OWNER,
  };

  const superAdminUser = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: Role.SUPER_ADMIN,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
  });

  it('creates owner-scoped animals with an HKN identifier', async () => {
    prisma.animal.create.mockResolvedValue({ id: 'animal-1' });
    const service = new RegistryService(prisma as never);

    await service.createAnimal(ownerUser, {
      hkn: 'hkn-2026-demo',
      class: AnimalClass.CATTLE,
      species: 'Cattle',
      sex: AnimalSex.FEMALE,
      identifiers: [
        {
          type: AnimalIdentifierType.EAR_TAG,
          value: 'tr060000000001',
        },
      ],
    });

    expect(prisma.animal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hkn: 'HKN-2026-DEMO',
          ownerId: 'owner-1',
          identifiers: {
            create: expect.arrayContaining([
              expect.objectContaining({
                type: AnimalIdentifierType.HKN,
                value: 'HKN-2026-DEMO',
                isPrimary: true,
              }),
              expect.objectContaining({
                type: AnimalIdentifierType.EAR_TAG,
                value: 'TR060000000001',
              }),
            ]),
          },
        }),
      }),
    );
  });

  it('records movement and updates current premise', async () => {
    prisma.animal.findFirst.mockResolvedValue({
      id: 'animal-1',
      ownerId: 'owner-1',
    });
    prisma.animalMovement.create.mockResolvedValue({ id: 'movement-1' });
    const service = new RegistryService(prisma as never);

    await service.recordMovement(ownerUser, 'animal-1', {
      reason: MovementReason.TRANSFER,
      occurredAt: '2026-07-21T12:00:00.000Z',
      fromPremiseId: 'premise-a',
      toPremiseId: 'premise-b',
    });

    expect(prisma.animal.update).toHaveBeenCalledWith({
      where: { id: 'animal-1' },
      data: { currentPremiseId: 'premise-b' },
    });
    expect(prisma.premise.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'premise-a', currentAnimalCount: { gt: 0 } },
      }),
    );
    expect(prisma.premise.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'premise-b' },
      }),
    );
  });

  it('builds a national oversight summary for super admins', async () => {
    prisma.animal.count.mockResolvedValue(2);
    prisma.animal.groupBy
      .mockResolvedValueOnce([
        { class: AnimalClass.CATTLE, _count: { _all: 1 } },
        { class: AnimalClass.STRAY, _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { status: AnimalStatus.ACTIVE, _count: { _all: 2 } },
      ]);
    prisma.premise.count.mockResolvedValue(2);
    prisma.premise.groupBy
      .mockResolvedValueOnce([
        { type: PremiseType.FARM, _count: { _all: 1 } },
        { type: PremiseType.SHELTER, _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([{ province: 'Ankara', _count: { _all: 2 } }]);
    prisma.animalMovement.count.mockResolvedValue(3);
    prisma.animalMovement.groupBy.mockResolvedValue([
      { reason: MovementReason.SHELTER_INTAKE, _count: { _all: 1 } },
    ]);
    prisma.municipalityAnimalCase.groupBy.mockResolvedValue([
      { status: MunicipalityCaseStatus.ADOPTION_READY, _count: { _all: 1 } },
    ]);
    prisma.adoptionListing.groupBy.mockResolvedValue([
      { status: AdoptionListingStatus.PUBLISHED, _count: { _all: 1 } },
    ]);
    prisma.vaccination.count.mockResolvedValue(4);
    prisma.pet.count.mockResolvedValue(5);
    const service = new RegistryService(prisma as never);

    const result = await service.nationalSummary(superAdminUser);

    expect(result.population.totalAnimals).toBe(2);
    expect(result.premises.topProvinces).toEqual([
      { province: 'Ankara', count: 2 },
    ]);
    expect(result.clinicalCoverage).toEqual({
      clinicalPets: 5,
      vaccinationRecords: 4,
    });
  });

  it('rejects national oversight summary for owners', async () => {
    const service = new RegistryService(prisma as never);

    await expect(service.nationalSummary(ownerUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns early warning candidates from registry aggregates', async () => {
    prisma.municipalityAnimalCase.groupBy
      .mockResolvedValueOnce([
        {
          foundProvince: 'Ankara',
          foundDistrict: 'Cankaya',
          status: MunicipalityCaseStatus.INTAKE,
          _count: { _all: 2 },
        },
      ])
      .mockResolvedValueOnce([
        {
          foundProvince: 'Ankara',
          foundDistrict: 'Cankaya',
          _count: { _all: 1 },
        },
      ]);
    prisma.animalMovement.groupBy.mockResolvedValue([
      { reason: MovementReason.SHELTER_INTAKE, _count: { _all: 2 } },
    ]);
    prisma.vaccination.count.mockResolvedValue(1);
    const service = new RegistryService(prisma as never);

    const result = await service.earlyWarnings(superAdminUser);

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'MUNICIPALITY_INTAKE_WATCH',
          province: 'Ankara',
        }),
        expect.objectContaining({
          type: 'ADOPTION_BACKLOG',
          district: 'Cankaya',
        }),
        expect.objectContaining({
          type: 'CLINICAL_VACCINATION_OVERDUE',
          count: 1,
        }),
      ]),
    );
  });
});

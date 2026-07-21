import {
  AnimalClass,
  AnimalIdentifierType,
  AnimalSex,
  MovementReason,
  Role,
} from '@prisma/client';
import { RegistryService } from './registry.service';

describe('RegistryService', () => {
  const prisma = {
    animal: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    premise: {
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    animalMovement: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const ownerUser = {
    sub: 'owner-1',
    email: 'owner@example.com',
    role: Role.OWNER,
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
});

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnimalClass,
  AnimalIdentifierType,
  Prisma,
  Role,
} from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';

const SIMULATION_NOTICE =
  'Simulation only. No official government system was queried.';

const animalSelect = {
  id: true,
  hkn: true,
  class: true,
  species: true,
  breed: true,
  name: true,
  sex: true,
  status: true,
  currentPremise: {
    select: {
      id: true,
      name: true,
      type: true,
      province: true,
      district: true,
      ministryCode: true,
    },
  },
  identifiers: {
    select: {
      type: true,
      value: true,
      issuedBy: true,
      isPrimary: true,
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.AnimalSelect;

const petSelect = {
  id: true,
  name: true,
  species: true,
  breed: true,
  sex: true,
  microchipNo: true,
  owner: {
    select: {
      id: true,
      fullName: true,
    },
  },
  animal: {
    select: animalSelect,
  },
} satisfies Prisma.PetSelect;

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  status(user: TokenPayload) {
    this.ensureIntegrationAccess(user);

    return {
      simulation: true,
      notice: SIMULATION_NOTICE,
      generatedAt: new Date().toISOString(),
      adapters: [
        {
          key: 'haybis',
          name: 'HAYBIS/TURKVET',
          mode: 'mock',
          direction: 'read-through-simulation',
          officialConnection: false,
        },
        {
          key: 'petvet',
          name: 'PETVET',
          mode: 'mock',
          direction: 'read-through-simulation',
          officialConnection: false,
        },
        {
          key: 'edevlet',
          name: 'e-Devlet',
          mode: 'mock',
          direction: 'identity-context-simulation',
          officialConnection: false,
        },
      ],
    };
  }

  async haybisAnimal(identifier: string, user: TokenPayload) {
    this.ensureIntegrationAccess(user);
    const normalized = this.normalizeIdentifier(identifier);
    const animal = await this.prisma.animal.findFirst({
      where: {
        deletedAt: null,
        class: { in: [AnimalClass.CATTLE, AnimalClass.SMALL_RUMINANT] },
        OR: [
          { hkn: normalized },
          {
            identifiers: {
              some: {
                type: {
                  in: [AnimalIdentifierType.HKN, AnimalIdentifierType.EAR_TAG],
                },
                value: normalized,
              },
            },
          },
        ],
      },
      select: animalSelect,
    });

    if (!animal) {
      throw new NotFoundException('Simulated HAYBIS animal not found.');
    }

    return {
      simulation: true,
      notice: SIMULATION_NOTICE,
      authority: 'HAYBIS/TURKVET',
      queriedIdentifier: normalized,
      animal,
    };
  }

  async petvetPet(identifier: string, user: TokenPayload) {
    this.ensureIntegrationAccess(user);
    const normalized = this.normalizeIdentifier(identifier);
    const pet = await this.prisma.pet.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { microchipNo: normalized },
          { animal: { hkn: normalized, deletedAt: null } },
          {
            animal: {
              deletedAt: null,
              identifiers: {
                some: {
                  type: {
                    in: [
                      AnimalIdentifierType.HKN,
                      AnimalIdentifierType.MICROCHIP,
                      AnimalIdentifierType.PASSPORT,
                    ],
                  },
                  value: normalized,
                },
              },
            },
          },
        ],
      },
      select: petSelect,
    });

    if (!pet) {
      throw new NotFoundException('Simulated PETVET pet not found.');
    }

    return {
      simulation: true,
      notice: SIMULATION_NOTICE,
      authority: 'PETVET',
      queriedIdentifier: normalized,
      pet,
    };
  }

  async edevletOwnerAnimals(
    identityRef: string | undefined,
    user: TokenPayload,
  ) {
    this.ensureIntegrationAccess(user);
    const owner = await this.prisma.owner.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { id: identityRef?.trim() || '__none__' },
          { email: identityRef?.trim().toLowerCase() || '__none__' },
        ],
      },
      select: {
        id: true,
        fullName: true,
        pets: {
          where: { deletedAt: null },
          select: petSelect,
          orderBy: { createdAt: 'desc' },
        },
        animals: {
          where: { deletedAt: null },
          select: animalSelect,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!owner) {
      throw new NotFoundException(
        'Simulated e-Devlet owner context not found.',
      );
    }

    return {
      simulation: true,
      notice: SIMULATION_NOTICE,
      authority: 'e-Devlet',
      identityRef: identityRef?.trim(),
      owner,
    };
  }

  private ensureIntegrationAccess(user: TokenPayload): void {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    throw new ForbiddenException(
      'Integration simulation requires admin access.',
    );
  }

  private normalizeIdentifier(identifier: string): string {
    return identifier.trim().toUpperCase();
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnimalIdentifierType,
  Prisma,
  Role,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { CreatePremiseDto } from './dto/create-premise.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';
import { RecordMovementDto } from './dto/record-movement.dto';

type NormalizedIdentifier = {
  type: AnimalIdentifierType;
  value: string;
  issuedBy?: string;
  issuedAt?: Date;
  isPrimary: boolean;
};

const animalInclude = {
  owner: { select: { id: true, fullName: true, email: true, phone: true } },
  clinic: { select: { id: true, name: true, city: true, district: true } },
  pet: { select: { id: true, name: true, species: true, microchipNo: true } },
  currentPremise: {
    select: {
      id: true,
      type: true,
      name: true,
      province: true,
      district: true,
      ministryCode: true,
    },
  },
  identifiers: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
} satisfies Prisma.AnimalInclude;

const movementPremiseSelect = {
  id: true,
  type: true,
  name: true,
  province: true,
  district: true,
  ministryCode: true,
  currentAnimalCount: true,
} satisfies Prisma.PremiseSelect;

@Injectable()
export class RegistryService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: TokenPayload) {
    const [animalsByClass, animalsByStatus, premiseCount] = await Promise.all([
      this.prisma.animal.groupBy({
        by: ['class'],
        where: this.animalScope(user),
        _count: { _all: true },
      }),
      this.prisma.animal.groupBy({
        by: ['status'],
        where: this.animalScope(user),
        _count: { _all: true },
      }),
      this.prisma.premise.count({ where: this.premiseScope(user) }),
    ]);

    return {
      animalsByClass: animalsByClass.map((row) => ({
        class: row.class,
        count: row._count._all,
      })),
      animalsByStatus: animalsByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      premiseCount,
    };
  }

  listPremises(user: TokenPayload) {
    return this.prisma.premise.findMany({
      where: this.premiseScope(user),
      orderBy: [{ province: 'asc' }, { district: 'asc' }, { name: 'asc' }],
    });
  }

  createPremise(user: TokenPayload, dto: CreatePremiseDto) {
    const ownership = this.resolveOwnership(user, dto.ownerId, dto.clinicId);

    return this.prisma.premise.create({
      data: {
        type: dto.type,
        name: dto.name.trim(),
        province: dto.province.trim(),
        district: dto.district.trim(),
        neighborhood: dto.neighborhood?.trim(),
        address: dto.address?.trim(),
        ministryCode: dto.ministryCode?.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        capacity: dto.capacity,
        ...ownership,
      },
    });
  }

  listAnimals(user: TokenPayload, query: ListAnimalsQueryDto) {
    return this.prisma.animal.findMany({
      where: {
        ...this.animalScope(user),
        class: query.class,
        status: query.status,
        currentPremiseId: query.premiseId,
        identifiers: query.identifier
          ? {
              some: {
                value: {
                  contains: query.identifier.trim(),
                  mode: 'insensitive',
                },
              },
            }
          : undefined,
      },
      include: animalInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createAnimal(user: TokenPayload, dto: CreateAnimalDto) {
    const ownership = this.resolveOwnership(user, dto.ownerId, dto.clinicId);
    const hkn = this.normalizeIdentifier(dto.hkn) ?? this.generateHkn();
    const identifiers = this.normalizeIdentifiers(hkn, dto.identifiers);

    return this.prisma.animal.create({
      data: {
        hkn,
        class: dto.class,
        species: dto.species.trim(),
        breed: dto.breed?.trim(),
        name: dto.name?.trim(),
        sex: dto.sex,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        birthPlace: dto.birthPlace?.trim(),
        color: dto.color?.trim(),
        photoUrl: dto.photoUrl,
        petId: dto.petId,
        currentPremiseId: dto.currentPremiseId,
        ...ownership,
        identifiers: {
          create: identifiers,
        },
      },
      include: animalInclude,
    });
  }

  async getAnimal(user: TokenPayload, id: string) {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        ...this.animalScope(user),
      },
      include: {
        ...animalInclude,
        movements: {
          include: {
            fromPremise: { select: movementPremiseSelect },
            toPremise: { select: movementPremiseSelect },
          },
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal not found.');
    }

    return animal;
  }

  async recordMovement(
    user: TokenPayload,
    animalId: string,
    dto: RecordMovementDto,
  ) {
    const animal = await this.getAnimal(user, animalId);

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.animalMovement.create({
        data: {
          animalId: animal.id,
          fromPremiseId: dto.fromPremiseId,
          toPremiseId: dto.toPremiseId,
          reason: dto.reason,
          occurredAt: new Date(dto.occurredAt),
          notes: dto.notes?.trim(),
        },
        include: {
          fromPremise: { select: movementPremiseSelect },
          toPremise: { select: movementPremiseSelect },
        },
      });

      if (dto.toPremiseId) {
        await tx.animal.update({
          where: { id: animal.id },
          data: { currentPremiseId: dto.toPremiseId },
        });
      }

      if (dto.fromPremiseId && dto.fromPremiseId !== dto.toPremiseId) {
        await tx.premise.updateMany({
          where: { id: dto.fromPremiseId, currentAnimalCount: { gt: 0 } },
          data: { currentAnimalCount: { decrement: 1 } },
        });
      }

      if (dto.toPremiseId && dto.fromPremiseId !== dto.toPremiseId) {
        await tx.premise.update({
          where: { id: dto.toPremiseId },
          data: { currentAnimalCount: { increment: 1 } },
        });
      }

      return movement;
    });
  }

  private animalScope(user: TokenPayload): Prisma.AnimalWhereInput {
    if (user.role === Role.SUPER_ADMIN) {
      return { deletedAt: null };
    }

    if (user.role === Role.OWNER) {
      return { ownerId: user.sub, deletedAt: null };
    }

    if (user.clinicId) {
      return { clinicId: user.clinicId, deletedAt: null };
    }

    return { id: '__none__', deletedAt: null };
  }

  private premiseScope(user: TokenPayload): Prisma.PremiseWhereInput {
    if (user.role === Role.SUPER_ADMIN) {
      return { deletedAt: null };
    }

    if (user.role === Role.OWNER) {
      return { ownerId: user.sub, deletedAt: null };
    }

    if (user.clinicId) {
      return { clinicId: user.clinicId, deletedAt: null };
    }

    return { id: '__none__', deletedAt: null };
  }

  private resolveOwnership(
    user: TokenPayload,
    ownerId?: string,
    clinicId?: string,
  ): Pick<Prisma.AnimalCreateInput, never> & {
    ownerId?: string;
    clinicId?: string;
  } {
    if (user.role === Role.SUPER_ADMIN) {
      return {
        ownerId,
        clinicId,
      };
    }

    if (user.role === Role.OWNER) {
      return { ownerId: user.sub };
    }

    if (user.clinicId) {
      return { clinicId: user.clinicId };
    }

    throw new ForbiddenException('Registry ownership could not be resolved.');
  }

  private normalizeIdentifiers(
    hkn: string,
    identifiers: CreateAnimalDto['identifiers'] = [],
  ): NormalizedIdentifier[] {
    const normalized = identifiers
      .map((identifier): NormalizedIdentifier | undefined => {
        const value = this.normalizeIdentifier(identifier.value);

        if (!value) {
          return undefined;
        }

        return {
          type: identifier.type,
          value,
          issuedBy: identifier.issuedBy?.trim(),
          issuedAt: identifier.issuedAt
            ? new Date(identifier.issuedAt)
            : undefined,
          isPrimary: identifier.type === AnimalIdentifierType.HKN,
        };
      })
      .filter((identifier): identifier is NormalizedIdentifier =>
        Boolean(identifier),
      );

    const hasHkn = normalized.some(
      (identifier) =>
        identifier.type === AnimalIdentifierType.HKN && identifier.value === hkn,
    );

    if (!hasHkn) {
      normalized.unshift({
        type: AnimalIdentifierType.HKN,
        value: hkn,
        issuedBy: 'VetCep Registry',
        issuedAt: new Date(),
        isPrimary: true,
      });
    }

    return normalized;
  }

  private normalizeIdentifier(value?: string): string | undefined {
    const normalized = value?.trim().toUpperCase();
    return normalized || undefined;
  }

  private generateHkn(): string {
    return `HKN-${new Date().getFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
  }
}

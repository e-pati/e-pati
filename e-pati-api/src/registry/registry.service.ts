import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnimalIdentifierType,
  MunicipalityCaseStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
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

type RegistryWarning = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  count: number;
  message: string;
  province?: string;
  district?: string;
  reason?: string;
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

const WARNING_WINDOW_DAYS = 30;

@Injectable()
export class RegistryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

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

  async nationalSummary(user: TokenPayload) {
    this.ensureNationalOversight(user);
    const since = this.daysAgo(WARNING_WINDOW_DAYS);
    const [
      totalAnimals,
      animalsByClass,
      animalsByStatus,
      totalPremises,
      premisesByType,
      premisesByProvince,
      movementsLast30Days,
      movementsByReason,
      municipalityCasesByStatus,
      adoptionListingsByStatus,
      vaccinationRecords,
      clinicalPets,
    ] = await Promise.all([
      this.prisma.animal.count({ where: { deletedAt: null } }),
      this.prisma.animal.groupBy({
        by: ['class'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.animal.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.premise.count({ where: { deletedAt: null } }),
      this.prisma.premise.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.premise.groupBy({
        by: ['province'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.animalMovement.count({
        where: { occurredAt: { gte: since } },
      }),
      this.prisma.animalMovement.groupBy({
        by: ['reason'],
        where: { occurredAt: { gte: since } },
        _count: { _all: true },
      }),
      this.prisma.municipalityAnimalCase.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.adoptionListing.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.vaccination.count({ where: { deletedAt: null } }),
      this.prisma.pet.count({ where: { deletedAt: null } }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      windowDays: WARNING_WINDOW_DAYS,
      population: {
        totalAnimals,
        byClass: this.countRows(animalsByClass, 'class'),
        byStatus: this.countRows(animalsByStatus, 'status'),
      },
      premises: {
        total: totalPremises,
        byType: this.countRows(premisesByType, 'type'),
        topProvinces: this.topCountRows(premisesByProvince, 'province'),
      },
      clinicalCoverage: {
        clinicalPets,
        vaccinationRecords,
      },
      municipality: {
        casesByStatus: this.countRows(municipalityCasesByStatus, 'status'),
        adoptionListingsByStatus: this.countRows(
          adoptionListingsByStatus,
          'status',
        ),
      },
      movements: {
        last30Days: movementsLast30Days,
        byReason: this.countRows(movementsByReason, 'reason'),
      },
    };
  }

  async provinceSummary(user: TokenPayload, province: string) {
    this.ensureNationalOversight(user);
    const provinceFilter = {
      equals: province.trim(),
      mode: 'insensitive' as const,
    };
    const [
      premises,
      animalsByClass,
      animalsByStatus,
      municipalityCasesByStatus,
      adoptionListingsByStatus,
      movementsIntoProvince,
    ] = await Promise.all([
      this.prisma.premise.findMany({
        where: { province: provinceFilter, deletedAt: null },
        select: {
          id: true,
          type: true,
          name: true,
          district: true,
          currentAnimalCount: true,
        },
        orderBy: [{ district: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.animal.groupBy({
        by: ['class'],
        where: {
          deletedAt: null,
          currentPremise: { province: provinceFilter, deletedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.animal.groupBy({
        by: ['status'],
        where: {
          deletedAt: null,
          currentPremise: { province: provinceFilter, deletedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.municipalityAnimalCase.groupBy({
        by: ['status'],
        where: { foundProvince: provinceFilter, deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.adoptionListing.groupBy({
        by: ['status'],
        where: { case: { foundProvince: provinceFilter, deletedAt: null } },
        _count: { _all: true },
      }),
      this.prisma.animalMovement.count({
        where: { toPremise: { province: provinceFilter, deletedAt: null } },
      }),
    ]);

    return {
      province: province.trim(),
      population: {
        byClass: this.countRows(animalsByClass, 'class'),
        byStatus: this.countRows(animalsByStatus, 'status'),
      },
      premises: {
        total: premises.length,
        byDistrict: this.countBy(premises, 'district'),
        items: premises,
      },
      municipality: {
        casesByStatus: this.countRows(municipalityCasesByStatus, 'status'),
        adoptionListingsByStatus: this.countRows(
          adoptionListingsByStatus,
          'status',
        ),
      },
      movements: {
        intoProvince: movementsIntoProvince,
      },
    };
  }

  async earlyWarnings(user: TokenPayload) {
    this.ensureNationalOversight(user);
    const since = this.daysAgo(WARNING_WINDOW_DAYS);
    const [
      recentMunicipalityCases,
      adoptionReadyBacklog,
      movementActivity,
      overdueVaccinations,
    ] = await Promise.all([
      this.prisma.municipalityAnimalCase.groupBy({
        by: ['foundProvince', 'foundDistrict', 'status'],
        where: {
          deletedAt: null,
          intakeAt: { gte: since },
          status: {
            in: [
              MunicipalityCaseStatus.INTAKE,
              MunicipalityCaseStatus.UNDER_TREATMENT,
            ],
          },
        },
        _count: { _all: true },
      }),
      this.prisma.municipalityAnimalCase.groupBy({
        by: ['foundProvince', 'foundDistrict'],
        where: {
          deletedAt: null,
          status: MunicipalityCaseStatus.ADOPTION_READY,
        },
        _count: { _all: true },
      }),
      this.prisma.animalMovement.groupBy({
        by: ['reason'],
        where: { occurredAt: { gte: since } },
        _count: { _all: true },
      }),
      this.prisma.vaccination.count({
        where: {
          deletedAt: null,
          dueAt: { lte: new Date() },
        },
      }),
    ]);

    const warnings: RegistryWarning[] = [
      ...recentMunicipalityCases.map((row) => ({
        id: `municipality-${row.foundProvince}-${row.foundDistrict}-${row.status}`,
        type: 'MUNICIPALITY_INTAKE_WATCH',
        severity:
          row._count._all >= 5 ? ('high' as const) : ('medium' as const),
        province: row.foundProvince,
        district: row.foundDistrict,
        count: row._count._all,
        message:
          'Recent stray animal intake or treatment activity requires municipal review.',
      })),
      ...adoptionReadyBacklog.map((row) => ({
        id: `adoption-backlog-${row.foundProvince}-${row.foundDistrict}`,
        type: 'ADOPTION_BACKLOG',
        severity: row._count._all >= 10 ? ('high' as const) : ('low' as const),
        province: row.foundProvince,
        district: row.foundDistrict,
        count: row._count._all,
        message: 'Adoption-ready municipality cases are waiting for placement.',
      })),
      ...movementActivity.map((row) => ({
        id: `movement-${row.reason}`,
        type: 'REGISTRY_MOVEMENT_ACTIVITY',
        severity:
          row._count._all >= 20 ? ('medium' as const) : ('low' as const),
        reason: row.reason,
        count: row._count._all,
        message:
          'Recent animal movement volume is available for oversight review.',
      })),
    ];

    if (overdueVaccinations > 0) {
      warnings.push({
        id: 'clinical-overdue-vaccinations',
        type: 'CLINICAL_VACCINATION_OVERDUE',
        severity: overdueVaccinations >= 25 ? 'high' : 'medium',
        count: overdueVaccinations,
        message:
          'Clinical vaccination records have due dates that need follow-up.',
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      windowDays: WARNING_WINDOW_DAYS,
      source: 'registry-and-clinical-demo-data',
      warnings,
    };
  }

  listPremises(user: TokenPayload) {
    return this.prisma.premise.findMany({
      where: this.premiseScope(user),
      orderBy: [{ province: 'asc' }, { district: 'asc' }, { name: 'asc' }],
    });
  }

  async createPremise(user: TokenPayload, dto: CreatePremiseDto) {
    const ownership = this.resolveOwnership(user, dto.ownerId, dto.clinicId);

    const premise = await this.prisma.premise.create({
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

    await this.auditService.record(user, {
      action: 'registry.premise.create',
      resourceType: 'Premise',
      resourceId: premise.id,
      metadata: {
        type: premise.type,
        province: premise.province,
        district: premise.district,
        ownerId: premise.ownerId,
        clinicId: premise.clinicId,
      },
    });

    return premise;
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

    const animal = await this.prisma.animal.create({
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

    await this.auditService.record(user, {
      action: 'registry.animal.create',
      resourceType: 'Animal',
      resourceId: animal.id,
      metadata: {
        hkn: animal.hkn,
        class: animal.class,
        ownerId: animal.ownerId,
        clinicId: animal.clinicId,
        currentPremiseId: animal.currentPremiseId,
      },
    });

    return animal;
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

    const movement = await this.prisma.$transaction(async (tx) => {
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

    await this.auditService.record(user, {
      action: 'registry.animal.movement.record',
      resourceType: 'AnimalMovement',
      resourceId: movement.id,
      metadata: {
        animalId: animal.id,
        fromPremiseId: dto.fromPremiseId,
        toPremiseId: dto.toPremiseId,
        reason: dto.reason,
        occurredAt: dto.occurredAt,
      },
    });

    return movement;
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
        identifier.type === AnimalIdentifierType.HKN &&
        identifier.value === hkn,
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

  private ensureNationalOversight(user: TokenPayload): void {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    throw new ForbiddenException(
      'National registry overview requires admin access.',
    );
  }

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  private countRows<T extends Record<string, unknown>, K extends keyof T>(
    rows: Array<T & { _count: { _all: number } }>,
    key: K,
  ) {
    return rows.map((row) => ({
      [key]: row[key],
      count: row._count._all,
    }));
  }

  private topCountRows<T extends Record<string, unknown>, K extends keyof T>(
    rows: Array<T & { _count: { _all: number } }>,
    key: K,
    limit = 10,
  ) {
    return this.countRows(rows, key)
      .sort((left, right) => right.count - left.count)
      .slice(0, limit);
  }

  private countBy<T extends Record<string, unknown>, K extends keyof T>(
    rows: T[],
    key: K,
  ) {
    const counts = new Map<string, number>();

    for (const row of rows) {
      const value = String(row[key] ?? 'UNKNOWN');
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([value, count]) => ({
      [key]: value,
      count,
    }));
  }
}

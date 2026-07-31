import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdoptionListingStatus,
  AnimalClass,
  AnimalStatus,
  MunicipalityCaseStatus,
  MovementReason,
  PremiseType,
  Prisma,
  Role,
  SterilizationStatus,
} from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdoptionListingDto } from './dto/create-adoption-listing.dto';
import { CreateMunicipalityCaseDto } from './dto/create-municipality-case.dto';
import { CreateSterilizationRecordDto } from './dto/create-sterilization-record.dto';
import { ListMunicipalityCasesQueryDto } from './dto/list-municipality-cases-query.dto';
import { UpdateAdoptionListingStatusDto } from './dto/update-adoption-listing-status.dto';

const municipalityCaseInclude = {
  animal: {
    select: {
      id: true,
      hkn: true,
      class: true,
      species: true,
      breed: true,
      name: true,
      sex: true,
      color: true,
      status: true,
      identifiers: {
        select: {
          type: true,
          value: true,
          isPrimary: true,
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    },
  },
  shelterPremise: {
    select: {
      id: true,
      name: true,
      type: true,
      province: true,
      district: true,
      neighborhood: true,
      ministryCode: true,
      clinicId: true,
    },
  },
  sterilizations: {
    orderBy: { performedAt: 'desc' },
  },
  adoptionListings: {
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.MunicipalityAnimalCaseInclude;

@Injectable()
export class MunicipalityService {
  constructor(private readonly prisma: PrismaService) {}

  listCases(query: ListMunicipalityCasesQueryDto, user: TokenPayload) {
    this.ensureMunicipalityUser(user);

    return this.prisma.municipalityAnimalCase.findMany({
      where: {
        ...this.caseScope(user),
        status: query.status,
        foundProvince: query.province,
        foundDistrict: query.district,
      },
      include: municipalityCaseInclude,
      orderBy: { intakeAt: 'desc' },
      take: 100,
    });
  }

  async getCase(id: string, user: TokenPayload) {
    const caseRecord = await this.prisma.municipalityAnimalCase.findFirst({
      where: { id, ...this.caseScope(user) },
      include: municipalityCaseInclude,
    });

    if (!caseRecord) {
      throw new NotFoundException('Municipality animal case not found.');
    }

    return caseRecord;
  }

  async createCase(dto: CreateMunicipalityCaseDto, user: TokenPayload) {
    this.ensureMunicipalityUser(user);
    const [animal, shelter] = await Promise.all([
      this.ensureStrayAnimal(dto.animalId, user),
      this.ensureShelterPremise(dto.shelterPremiseId, user),
    ]);

    return this.prisma.$transaction(async (tx) => {
      const caseRecord = await tx.municipalityAnimalCase.create({
        data: {
          animalId: animal.id,
          shelterPremiseId: shelter.id,
          caseNumber: this.trim(dto.caseNumber),
          municipalityName: dto.municipalityName.trim(),
          intakeSource: this.trim(dto.intakeSource),
          intakeAt: new Date(dto.intakeAt),
          foundProvince: dto.foundProvince.trim(),
          foundDistrict: dto.foundDistrict.trim(),
          foundNeighborhood: this.trim(dto.foundNeighborhood),
          publicLocationNote: this.trim(dto.publicLocationNote),
          notes: this.trim(dto.notes),
        },
        include: municipalityCaseInclude,
      });

      if (animal.currentPremiseId !== shelter.id) {
        await tx.animal.update({
          where: { id: animal.id },
          data: { currentPremiseId: shelter.id },
        });
        await tx.animalMovement.create({
          data: {
            animalId: animal.id,
            fromPremiseId: animal.currentPremiseId,
            toPremiseId: shelter.id,
            reason: MovementReason.SHELTER_INTAKE,
            occurredAt: new Date(dto.intakeAt),
            notes: 'Municipality shelter intake case opened.',
          },
        });
      }

      return caseRecord;
    });
  }

  async createSterilization(
    caseId: string,
    dto: CreateSterilizationRecordDto,
    user: TokenPayload,
  ) {
    await this.getCase(caseId, user);
    const status = dto.status ?? SterilizationStatus.COMPLETED;
    const caseStatus =
      status === SterilizationStatus.COMPLETED
        ? MunicipalityCaseStatus.STERILIZED
        : status === SterilizationStatus.SCHEDULED
          ? MunicipalityCaseStatus.UNDER_TREATMENT
          : undefined;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.sterilizationRecord.create({
        data: {
          caseId,
          performedAt: new Date(dto.performedAt),
          veterinarianName: dto.veterinarianName.trim(),
          clinicName: this.trim(dto.clinicName),
          status,
          anesthesiaNotes: this.trim(dto.anesthesiaNotes),
          surgeryNotes: this.trim(dto.surgeryNotes),
          complicationNotes: this.trim(dto.complicationNotes),
        },
      });

      if (caseStatus) {
        await tx.municipalityAnimalCase.update({
          where: { id: caseId },
          data: { status: caseStatus },
        });
      }

      return record;
    });
  }

  async createAdoptionListing(
    caseId: string,
    dto: CreateAdoptionListingDto,
    user: TokenPayload,
  ) {
    await this.getCase(caseId, user);
    const status = dto.status ?? AdoptionListingStatus.PUBLISHED;
    const publishedAt =
      status === AdoptionListingStatus.PUBLISHED ? new Date() : undefined;

    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.adoptionListing.create({
        data: {
          caseId,
          title: dto.title.trim(),
          description: dto.description.trim(),
          healthSummary: this.trim(dto.healthSummary),
          suitabilityNotes: this.trim(dto.suitabilityNotes),
          contactName: this.trim(dto.contactName),
          contactPhone: this.trim(dto.contactPhone),
          status,
          publishedAt,
        },
      });

      if (status === AdoptionListingStatus.PUBLISHED) {
        await tx.municipalityAnimalCase.update({
          where: { id: caseId },
          data: { status: MunicipalityCaseStatus.ADOPTION_READY },
        });
      }

      return listing;
    });
  }

  async updateAdoptionListingStatus(
    listingId: string,
    dto: UpdateAdoptionListingStatusDto,
    user: TokenPayload,
  ) {
    this.ensureMunicipalityUser(user);
    const listing = await this.prisma.adoptionListing.findFirst({
      where: {
        id: listingId,
        case: this.caseScope(user),
      },
      include: {
        case: { select: { id: true, animalId: true } },
      },
    });

    if (!listing) {
      throw new NotFoundException('Adoption listing not found.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.adoptionListing.update({
        where: { id: listing.id },
        data: {
          status: dto.status,
          publishedAt:
            dto.status === AdoptionListingStatus.PUBLISHED
              ? (listing.publishedAt ?? now)
              : undefined,
          adoptedAt:
            dto.status === AdoptionListingStatus.ADOPTED
              ? (listing.adoptedAt ?? now)
              : undefined,
        },
      });

      if (dto.status === AdoptionListingStatus.ADOPTED) {
        await tx.municipalityAnimalCase.update({
          where: { id: listing.case.id },
          data: { status: MunicipalityCaseStatus.ADOPTED },
        });
        await tx.animal.update({
          where: { id: listing.case.animalId },
          data: { status: AnimalStatus.ADOPTED },
        });
      }

      if (dto.status === AdoptionListingStatus.ARCHIVED) {
        await tx.municipalityAnimalCase.update({
          where: { id: listing.case.id },
          data: { status: MunicipalityCaseStatus.CLOSED },
        });
      }

      return updated;
    });
  }

  private async ensureStrayAnimal(id: string, user: TokenPayload) {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        class: AnimalClass.STRAY,
        deletedAt: null,
        ...(user.role === Role.SUPER_ADMIN
          ? {}
          : {
              OR: [
                { clinicId: user.clinicId },
                { currentPremise: { clinicId: user.clinicId } },
              ],
            }),
      },
      select: { id: true, currentPremiseId: true },
    });

    if (!animal) {
      throw new NotFoundException('Stray animal not found.');
    }

    return animal;
  }

  private async ensureShelterPremise(id: string, user: TokenPayload) {
    const shelter = await this.prisma.premise.findFirst({
      where: {
        id,
        type: PremiseType.SHELTER,
        deletedAt: null,
        ...(user.role === Role.SUPER_ADMIN ? {} : { clinicId: user.clinicId }),
      },
      select: { id: true },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter premise not found.');
    }

    return shelter;
  }

  private caseScope(
    user: TokenPayload,
  ): Prisma.MunicipalityAnimalCaseWhereInput {
    if (user.role === Role.SUPER_ADMIN) {
      return { deletedAt: null };
    }

    if (user.clinicId) {
      return {
        deletedAt: null,
        OR: [
          { shelterPremise: { clinicId: user.clinicId, deletedAt: null } },
          { animal: { clinicId: user.clinicId, deletedAt: null } },
        ],
      };
    }

    return { id: '__none__', deletedAt: null };
  }

  private ensureMunicipalityUser(user: TokenPayload): void {
    if (user.role === Role.SUPER_ADMIN || user.clinicId) {
      return;
    }

    throw new ForbiddenException('Municipality access requires clinic scope.');
  }

  private trim(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized || undefined;
  }
}

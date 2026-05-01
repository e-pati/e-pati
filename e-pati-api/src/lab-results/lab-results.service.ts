import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LabResult, Pet, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { ListLabResultsQueryDto } from './dto/list-lab-results-query.dto';

@Injectable()
export class LabResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLabResultDto, user: TokenPayload) {
    this.ensureClinicStaff(user);
    const pet = await this.findPetForClinic(dto.petId, user);

    const labResult = await this.prisma.labResult.create({
      data: {
        petId: pet.id,
        clinicId: user.clinicId,
        veterinarianId: user.role === Role.VETERINARIAN ? user.sub : undefined,
        title: dto.title,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        notes: dto.notes,
        collectedAt: dto.collectedAt ? new Date(dto.collectedAt) : undefined,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    await this.prisma.notification.create({
      data: {
        ownerId: pet.ownerId,
        channel: 'PUSH',
        title: 'Yeni laboratuvar sonucu',
        body: `${pet.name} için yeni laboratuvar sonucu yüklendi.`,
        payload: { labResultId: labResult.id, petId: pet.id },
      },
    });

    return labResult;
  }

  async findAll(query: ListLabResultsQueryDto, user: TokenPayload) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      deletedAt: null,
      ...(query.petId ? { petId: query.petId } : {}),
      ...(user.role === Role.OWNER
        ? { pet: { ownerId: user.sub, deletedAt: null } }
        : user.clinicId
          ? { clinicId: user.clinicId }
          : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.labResult.findMany({
        where,
        include: { clinic: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.labResult.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getFile(id: string, user: TokenPayload) {
    const labResult = await this.findOne(id, user);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      labResultId: labResult.id,
      url: labResult.fileUrl,
      expiresAt,
    };
  }

  private async findOne(id: string, user: TokenPayload): Promise<LabResult> {
    const labResult = await this.prisma.labResult.findFirst({
      where: { id, deletedAt: null },
      include: { pet: true, clinic: { select: { id: true, name: true } } },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found.');
    }

    this.ensureCanRead(labResult.pet, user);
    return labResult;
  }

  private async findPetForClinic(
    petId: string,
    user: TokenPayload,
  ): Promise<Pet> {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    if (user.clinicId && pet.clinicId && pet.clinicId !== user.clinicId) {
      throw new ForbiddenException('This pet belongs to another clinic.');
    }

    return pet;
  }

  private ensureCanRead(pet: Pet, user: TokenPayload): void {
    if (user.role === Role.OWNER && pet.ownerId === user.sub) {
      return;
    }

    if (user.clinicId && pet.clinicId === user.clinicId) {
      return;
    }

    throw new ForbiddenException('You cannot access this lab result.');
  }

  private ensureClinicStaff(user: TokenPayload): void {
    if (
      (user.role === Role.VETERINARIAN || user.role === Role.CLINIC_ADMIN) &&
      user.clinicId
    ) {
      return;
    }

    throw new ForbiddenException('Only clinic staff can perform this action.');
  }
}

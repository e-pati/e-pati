import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pet, Role, Vaccination } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { TokenPayload } from '../auth/types/token-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { ListVaccinationsQueryDto } from './dto/list-vaccinations-query.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';

@Injectable()
export class VaccinationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: ListVaccinationsQueryDto, user: TokenPayload) {
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
      this.prisma.vaccination.findMany({
        where,
        include: { clinic: { select: { id: true, name: true } } },
        orderBy: [{ dueAt: 'asc' }, { appliedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vaccination.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async create(dto: CreateVaccinationDto, user: TokenPayload) {
    this.ensureVeterinarian(user);
    const pet = await this.findPetForClinic(dto.petId, user);

    const vaccination = await this.prisma.vaccination.create({
      data: {
        petId: pet.id,
        clinicId: user.clinicId,
        veterinarianId: user.sub,
        name: dto.name,
        lotNumber: dto.lotNumber,
        appliedAt: new Date(dto.appliedAt),
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        notes: dto.notes,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    if (vaccination.dueAt) {
      await this.notificationsService.createOwnerNotification({
        ownerId: pet.ownerId,
        title: 'Aşı hatırlatması planlandı',
        body: `${pet.name} için ${vaccination.name} aşı hatırlatması oluşturuldu.`,
        payload: {
          type: 'vaccination',
          vaccinationId: vaccination.id,
          petId: pet.id,
        },
        scheduledAt: vaccination.dueAt,
      });
    }

    await this.notificationsService.createClinicNotification({
      clinicId: user.clinicId!,
      title: 'Aşı kaydı oluşturuldu',
      body: `${pet.name} için ${vaccination.name} aşı kaydı klinik arşivine eklendi.`,
      payload: {
        type: 'vaccination',
        vaccinationId: vaccination.id,
        petId: pet.id,
      },
    });

    await this.auditVaccination(user, 'vaccination.create', vaccination, {
      ownerId: pet.ownerId,
    });

    return vaccination;
  }

  async upcoming(user: TokenPayload, days = 30) {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + days);

    return this.prisma.vaccination.findMany({
      where: {
        deletedAt: null,
        dueAt: { gte: now, lte: until },
        ...(user.role === Role.OWNER
          ? { pet: { ownerId: user.sub, deletedAt: null } }
          : user.clinicId
            ? { clinicId: user.clinicId }
            : {}),
      },
      include: { clinic: { select: { id: true, name: true } } },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findOne(id: string, user: TokenPayload): Promise<Vaccination> {
    const vaccination = await this.prisma.vaccination.findFirst({
      where: { id, deletedAt: null },
      include: { pet: true, clinic: { select: { id: true, name: true } } },
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination not found.');
    }

    this.ensureCanRead(vaccination.pet, user);
    return vaccination;
  }

  async update(id: string, dto: UpdateVaccinationDto, user: TokenPayload) {
    this.ensureVeterinarian(user);
    const current = await this.findOne(id, user);

    const vaccination = await this.prisma.vaccination.update({
      where: { id },
      data: {
        name: dto.name,
        lotNumber: dto.lotNumber,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        notes: dto.notes,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    await this.auditVaccination(user, 'vaccination.update', vaccination, {
      previousDueAt: current.dueAt,
      changedFields: Object.keys(dto),
    });

    return vaccination;
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

    throw new ForbiddenException('You cannot access this vaccination.');
  }

  private ensureVeterinarian(user: TokenPayload): void {
    if (user.role === Role.VETERINARIAN && user.clinicId) {
      return;
    }

    throw new ForbiddenException('Only veterinarians can perform this action.');
  }

  private auditVaccination(
    user: TokenPayload,
    action: string,
    vaccination: Vaccination,
    metadata: Record<string, unknown> = {},
  ) {
    return this.auditService.record(user, {
      action,
      resourceType: 'Vaccination',
      resourceId: vaccination.id,
      metadata: {
        petId: vaccination.petId,
        clinicId: vaccination.clinicId,
        veterinarianId: vaccination.veterinarianId,
        name: vaccination.name,
        lotNumber: vaccination.lotNumber,
        appliedAt: vaccination.appliedAt,
        dueAt: vaccination.dueAt,
        ...metadata,
      },
    });
  }
}

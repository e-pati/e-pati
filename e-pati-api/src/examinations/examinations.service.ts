import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Examination, Pet, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { ListExaminationsQueryDto } from './dto/list-examinations-query.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';

@Injectable()
export class ExaminationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: ListExaminationsQueryDto, user: TokenPayload) {
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
      this.prisma.examination.findMany({
        where,
        include: { clinic: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.examination.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async create(dto: CreateExaminationDto, user: TokenPayload) {
    this.ensureVeterinarian(user);
    const pet = await this.findPetForClinic(dto.petId, user);

    const examination = await this.prisma.examination.create({
      data: {
        petId: pet.id,
        clinicId: user.clinicId,
        veterinarianId: user.sub,
        complaint: dto.complaint,
        findings: dto.findings,
        assessment: dto.assessment,
        plan: dto.plan,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    await this.notificationsService.createOwnerNotification({
      ownerId: pet.ownerId,
      title: 'Yeni muayene kaydı',
      body: `${pet.name} için yeni muayene kaydı oluşturuldu.`,
      payload: { examinationId: examination.id, petId: pet.id },
    });

    return examination;
  }

  async findOne(id: string, user: TokenPayload): Promise<Examination> {
    const examination = await this.prisma.examination.findFirst({
      where: { id, deletedAt: null },
      include: { pet: true, clinic: { select: { id: true, name: true } } },
    });

    if (!examination) {
      throw new NotFoundException('Examination not found.');
    }

    this.ensureCanRead(examination.pet, user);
    return examination;
  }

  async update(id: string, dto: UpdateExaminationDto, user: TokenPayload) {
    this.ensureVeterinarian(user);
    const examination = await this.findOne(id, user);

    if (examination.veterinarianId !== user.sub) {
      throw new ForbiddenException(
        'Only the author can update this examination.',
      );
    }

    const updated = await this.prisma.examination.update({
      where: { id },
      data: {
        complaint: dto.complaint,
        findings: dto.findings,
        assessment: dto.assessment,
        plan: dto.plan,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        veterinarianId: user.sub,
        action: 'examination.update',
        resourceType: 'Examination',
        resourceId: id,
        metadata: { changedFields: Object.keys(dto) },
      },
    });

    return updated;
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

    throw new ForbiddenException('You cannot access this examination.');
  }

  private ensureVeterinarian(user: TokenPayload): void {
    if (user.role === Role.VETERINARIAN && user.clinicId) {
      return;
    }

    throw new ForbiddenException('Only veterinarians can perform this action.');
  }
}

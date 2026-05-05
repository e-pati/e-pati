import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { RequestAppointmentDto } from './dto/request-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const includeAppointment = {
  pet: {
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  clinic: {
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      district: true,
    },
  },
  veterinarian: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
} satisfies Prisma.AppointmentInclude;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll(query: ListAppointmentsQueryDto, user: TokenPayload) {
    const where: Prisma.AppointmentWhereInput = {
      deletedAt: null,
      ...this.scopeForUser(user),
      ...(query.from || query.to
        ? {
            startsAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: includeAppointment,
      orderBy: { startsAt: 'asc' },
    });

    return appointments.map((appointment) => this.present(appointment));
  }

  async findOne(id: string, user: TokenPayload) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, deletedAt: null, ...this.scopeForUser(user) },
      include: includeAppointment,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    return this.present(appointment);
  }

  async create(dto: CreateAppointmentDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const startsAt = this.getStartsAt(dto);
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: dto.petId,
        clinicId: user.clinicId,
        deletedAt: null,
      },
      select: { id: true, ownerId: true, clinicId: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found in this clinic.');
    }

    if (dto.veterinarianId) {
      await this.ensureVeterinarianInClinic(dto.veterinarianId, user.clinicId);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        petId: pet.id,
        ownerId: pet.ownerId,
        clinicId: pet.clinicId,
        veterinarianId: dto.veterinarianId,
        startsAt,
        durationMinutes: dto.durationMinutes,
        status: AppointmentStatus.CONFIRMED,
        reason: dto.reason,
        notes: dto.notes,
        notifyOwner: dto.notifyOwner ?? true,
      },
      include: includeAppointment,
    });

    if (appointment.notifyOwner && appointment.ownerId) {
      await this.notifyOwner(
        appointment.ownerId,
        'Randevu olusturuldu',
        dto.reason,
      );
    }

    return this.present(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const current = await this.prisma.appointment.findFirst({
      where: { id, clinicId: user.clinicId, deletedAt: null },
    });

    if (!current) {
      throw new NotFoundException('Appointment not found.');
    }

    if (dto.veterinarianId) {
      await this.ensureVeterinarianInClinic(dto.veterinarianId, user.clinicId);
    }

    const status = dto.status ? this.toDbStatus(dto.status) : undefined;
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        startsAt:
          (dto.startsAt ?? dto.scheduledAt)
            ? new Date(dto.startsAt ?? dto.scheduledAt!)
            : undefined,
        durationMinutes: dto.durationMinutes,
        veterinarianId: dto.veterinarianId,
        reason: dto.reason,
        notes: dto.notes,
        notifyOwner: dto.notifyOwner,
        status,
      },
      include: includeAppointment,
    });

    if (
      appointment.notifyOwner &&
      appointment.ownerId &&
      status &&
      (status === AppointmentStatus.CANCELLED ||
        status === AppointmentStatus.COMPLETED)
    ) {
      await this.notifyOwner(
        appointment.ownerId,
        status === AppointmentStatus.CANCELLED
          ? 'Randevu iptal edildi'
          : 'Randevu tamamlandi',
        appointment.reason ?? 'Randevu guncellendi',
      );
    }

    return this.present(appointment);
  }

  async confirm(id: string, user: TokenPayload) {
    this.ensureClinicUser(user);
    const current = await this.prisma.appointment.findFirst({
      where: { id, clinicId: user.clinicId, deletedAt: null },
    });

    if (!current) {
      throw new NotFoundException('Appointment not found.');
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: includeAppointment,
    });

    if (appointment.ownerId) {
      await this.notifyOwner(
        appointment.ownerId,
        'Randevu talebiniz onaylandi',
        appointment.reason ?? 'Randevunuz onaylandi.',
      );
    }

    return this.present(appointment);
  }

  async request(dto: RequestAppointmentDto, user: TokenPayload) {
    this.ensureOwner(user);
    const pet = await this.prisma.pet.findFirst({
      where: { id: dto.petId, ownerId: user.sub, deletedAt: null },
      select: { id: true, ownerId: true, clinicId: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    const clinicId = dto.clinicId ?? pet.clinicId;
    const startsAt = this.parsePreferredDateTime(
      dto.preferredDate,
      dto.preferredTime,
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        petId: pet.id,
        ownerId: user.sub,
        clinicId,
        startsAt,
        requestedDate: dto.preferredDate,
        requestedTime: dto.preferredTime,
        durationMinutes: 30,
        status: AppointmentStatus.PENDING,
        reason: dto.reason,
        notifyOwner: true,
      },
      include: includeAppointment,
    });

    return this.present(appointment);
  }

  private scopeForUser(user: TokenPayload): Prisma.AppointmentWhereInput {
    if (user.role === Role.SUPER_ADMIN) {
      return {};
    }

    if (user.role === Role.OWNER) {
      return { ownerId: user.sub };
    }

    if (user.clinicId) {
      return { clinicId: user.clinicId };
    }

    throw new ForbiddenException('You cannot access appointments.');
  }

  private ensureClinicUser(user: TokenPayload): void {
    if (
      user.role === Role.SUPER_ADMIN ||
      user.role === Role.CLINIC_ADMIN ||
      user.role === Role.VETERINARIAN
    ) {
      if (user.role !== Role.SUPER_ADMIN && !user.clinicId) {
        throw new ForbiddenException('Clinic context is required.');
      }
      return;
    }

    throw new ForbiddenException('Only clinic users can manage appointments.');
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role !== Role.OWNER) {
      throw new ForbiddenException('Only owners can request appointments.');
    }
  }

  private async ensureVeterinarianInClinic(
    veterinarianId: string,
    clinicId?: string,
  ): Promise<void> {
    if (!clinicId) {
      return;
    }

    const exists = await this.prisma.veterinarian.count({
      where: { id: veterinarianId, clinicId, deletedAt: null },
    });

    if (!exists) {
      throw new BadRequestException('Veterinarian does not belong to clinic.');
    }
  }

  private getStartsAt(dto: CreateAppointmentDto): Date {
    const raw = dto.startsAt ?? dto.scheduledAt;

    if (!raw) {
      throw new BadRequestException('scheduledAt or startsAt is required.');
    }

    return new Date(raw);
  }

  private parsePreferredDateTime(date: string, time: string): Date {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const parsed = new Date(`${date}T${normalizedTime}`);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        'preferredDate or preferredTime is invalid.',
      );
    }

    return parsed;
  }

  private toDbStatus(
    status: UpdateAppointmentDto['status'],
  ): AppointmentStatus {
    const map = {
      pending: AppointmentStatus.PENDING,
      confirmed: AppointmentStatus.CONFIRMED,
      cancelled: AppointmentStatus.CANCELLED,
      completed: AppointmentStatus.COMPLETED,
    };

    return map[status!];
  }

  private present<
    T extends {
      startsAt: Date;
      durationMinutes: number;
      status: AppointmentStatus;
    },
  >(appointment: T) {
    const endsAt = new Date(
      appointment.startsAt.getTime() + appointment.durationMinutes * 60_000,
    );

    return {
      ...appointment,
      scheduledAt: appointment.startsAt,
      endsAt,
      status: appointment.status.toLowerCase(),
    };
  }

  private notifyOwner(ownerId: string, title: string, body: string) {
    return this.notifications.createOwnerNotification({
      ownerId,
      title,
      body,
      payload: { type: 'appointment' },
    });
  }
}

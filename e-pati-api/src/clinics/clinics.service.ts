import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ListClinicPatientsQueryDto } from './dto/list-clinic-patients-query.dto';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  async discovery(query: {
    latitude?: string;
    longitude?: string;
    city?: string;
  }) {
    const latitude = query.latitude ? Number(query.latitude) : undefined;
    const longitude = query.longitude ? Number(query.longitude) : undefined;
    const clinics = await this.prisma.clinic.findMany({
      where: {
        deletedAt: null,
        isApproved: true,
        ...(query.city
          ? { city: { equals: query.city, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      city: clinic.city ?? undefined,
      district: clinic.district ?? undefined,
      address: clinic.address ?? undefined,
      phone: clinic.phone ?? undefined,
      distanceKm: this.distanceKm(
        latitude,
        longitude,
        clinic.latitude,
        clinic.longitude,
      ),
      rating: clinic.rating ?? undefined,
      isOpen: undefined,
      isVetCepPartner: true,
    }));
  }

  async publicProfile(id: string) {
    const clinic = await this.prisma.clinic.findFirstOrThrow({
      where: { id, deletedAt: null, isApproved: true },
    });

    return {
      id: clinic.id,
      name: clinic.name,
      city: clinic.city ?? undefined,
      district: clinic.district ?? undefined,
      address: clinic.address ?? undefined,
      phone: clinic.phone ?? undefined,
      website: clinic.website ?? undefined,
      description: clinic.description ?? undefined,
      workingHours: clinic.workingHours ?? undefined,
      rating: clinic.rating ?? undefined,
      services: clinic.services,
      appointmentRequestEnabled: true,
      isVetCepPartner: true,
    };
  }

  async findPatients(
    clinicId: string,
    query: ListClinicPatientsQueryDto,
    user: TokenPayload,
  ) {
    this.ensureClinicAccess(clinicId, user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const species = query.species?.trim();
    const where: Prisma.PetWhereInput = {
      clinicId,
      deletedAt: null,
      ...(species ? { species: { equals: species, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              {
                owner: { fullName: { contains: search, mode: 'insensitive' } },
              },
              { microchipNo: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pet.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getDashboard(clinicId: string, user: TokenPayload) {
    this.ensureClinicAccess(clinicId, user);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const nextThirtyDays = new Date(now);
    nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);

    const [
      patientCount,
      examinationsToday,
      upcomingVaccinationCount,
      unreadNotificationCount,
      recentExaminations,
      upcomingVaccinations,
    ] = await Promise.all([
      this.prisma.pet.count({
        where: { clinicId, deletedAt: null },
      }),
      this.prisma.examination.count({
        where: {
          clinicId,
          deletedAt: null,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      this.prisma.vaccination.count({
        where: {
          clinicId,
          deletedAt: null,
          dueAt: { gte: now, lte: nextThirtyDays },
        },
      }),
      this.prisma.notification.count({
        where: {
          readAt: null,
          owner: {
            pets: {
              some: { clinicId, deletedAt: null },
            },
          },
        },
      }),
      this.prisma.examination.findMany({
        where: { clinicId, deletedAt: null },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
          veterinarian: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.vaccination.findMany({
        where: {
          clinicId,
          deletedAt: null,
          dueAt: { gte: now, lte: nextThirtyDays },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
        },
        orderBy: { dueAt: 'asc' },
        take: 5,
      }),
    ]);

    return {
      stats: {
        patientCount,
        examinationsToday,
        upcomingVaccinationCount,
        unreadNotificationCount,
      },
      recentExaminations,
      upcomingVaccinations,
    };
  }

  private ensureClinicAccess(clinicId: string, user: TokenPayload): void {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    if (
      user.clinicId === clinicId &&
      (user.role === Role.VETERINARIAN || user.role === Role.CLINIC_ADMIN)
    ) {
      return;
    }

    throw new ForbiddenException('You cannot access this clinic.');
  }

  private distanceKm(
    fromLat?: number,
    fromLon?: number,
    toLat?: number | null,
    toLon?: number | null,
  ) {
    if (
      fromLat === undefined ||
      fromLon === undefined ||
      toLat === null ||
      toLon === null ||
      toLat === undefined ||
      toLon === undefined
    ) {
      return undefined;
    }

    const earthKm = 6371;
    const dLat = this.toRad(toLat - fromLat);
    const dLon = this.toRad(toLon - fromLon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(fromLat)) *
        Math.cos(this.toRad(toLat)) *
        Math.sin(dLon / 2) ** 2;

    return (
      Math.round(
        earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10,
      ) / 10
    );
  }

  private toRad(value: number) {
    return (value * Math.PI) / 180;
  }
}

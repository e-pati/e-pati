import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: TokenPayload) {
    const clinicId = this.clinicId(user);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const nextThirtyDays = new Date(now);
    nextThirtyDays.setDate(now.getDate() + 30);

    const [
      activePatients,
      lostPatients,
      appointmentCount,
      vaccinationDueCount,
      busyHours,
    ] = await Promise.all([
      this.prisma.pet.count({ where: { clinicId, deletedAt: null } }),
      this.lostPatients(user),
      this.prisma.appointment.count({
        where: { clinicId, deletedAt: null, startsAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.vaccination.count({
        where: {
          clinicId,
          deletedAt: null,
          dueAt: { gte: now, lte: nextThirtyDays },
        },
      }),
      this.busyHours(user),
    ]);

    return {
      activePatients,
      lostPatientCount: lostPatients.length,
      lostPatientRisk: lostPatients.length,
      appointmentCount,
      revenue: undefined,
      estimatedRevenue: undefined,
      vaccinationDueCount,
      busiestHour: busyHours[0]?.hour,
      revisitRate: activePatients ? Math.max(0, 100 - lostPatients.length) : 0,
    };
  }

  async lostPatients(user: TokenPayload) {
    const clinicId = this.clinicId(user);
    const pets = await this.prisma.pet.findMany({
      where: { clinicId, deletedAt: null },
      include: {
        owner: { select: { fullName: true, phone: true } },
        examinations: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });

    return pets
      .map((pet) => {
        const lastVisitAt = pet.examinations[0]?.createdAt ?? pet.updatedAt;
        const daysSinceLastVisit = Math.floor(
          (Date.now() - lastVisitAt.getTime()) / 86_400_000,
        );
        const riskLevel =
          daysSinceLastVisit >= 180
            ? 'high'
            : daysSinceLastVisit >= 90
              ? 'medium'
              : 'low';

        return {
          id: pet.id,
          petId: pet.id,
          petName: pet.name,
          ownerName: pet.owner.fullName,
          ownerPhone: pet.owner.phone,
          lastVisitAt,
          daysSinceLastVisit,
          riskLevel,
          riskScore: daysSinceLastVisit,
          suggestedChannel: pet.owner.phone ? 'whatsapp' : 'sms',
        };
      })
      .filter((candidate) => candidate.daysSinceLastVisit >= 60);
  }

  async topMedications(user: TokenPayload) {
    const clinicId = this.clinicId(user);
    const medications = await this.prisma.medication.findMany({
      where: { prescription: { clinicId, deletedAt: null } },
      select: { name: true },
    });
    const counts = new Map<string, number>();

    for (const medication of medications) {
      counts.set(medication.name, (counts.get(medication.name) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async busyHours(user: TokenPayload) {
    const clinicId = this.clinicId(user);
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        deletedAt: null,
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
        },
      },
      select: { startsAt: true },
    });
    const counts = new Map<number, number>();

    for (const appointment of appointments) {
      const hour = appointment.startsAt.getHours();
      counts.set(hour, (counts.get(hour) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([hour, count]) => ({ hour: String(hour).padStart(2, '0'), count }))
      .sort((a, b) => b.count - a.count);
  }

  async visitTrend(user: TokenPayload) {
    const clinicId = this.clinicId(user);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const examinations = await this.prisma.examination.findMany({
      where: { clinicId, deletedAt: null, createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const counts = new Map<string, number>();

    for (const examination of examinations) {
      const date = examination.createdAt.toISOString().slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([date, count]) => ({
        date,
        week: date,
        label: date,
        count,
        visits: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private clinicId(user: TokenPayload): string {
    if (
      (user.role === Role.CLINIC_ADMIN || user.role === Role.VETERINARIAN) &&
      user.clinicId
    ) {
      return user.clinicId;
    }

    throw new ForbiddenException('Clinic access is required.');
  }
}

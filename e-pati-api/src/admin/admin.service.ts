import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentStatus,
  Role,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(user: TokenPayload) {
    this.ensureAdmin(user);
    const monthStart = this.startOfMonth(new Date());
    const [
      totalClinics,
      activeSubscriptions,
      trialing,
      newThisMonth,
      churnThisMonth,
      revenueTrend,
      mrr,
    ] = await Promise.all([
      this.prisma.clinic.count({ where: { deletedAt: null } }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE, clinicId: { not: null } },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.TRIALING, clinicId: { not: null } },
      }),
      this.prisma.clinic.count({
        where: { deletedAt: null, createdAt: { gte: monthStart } },
      }),
      this.prisma.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELED,
          clinicId: { not: null },
          updatedAt: { gte: monthStart },
        },
      }),
      this.revenueMonthly(user),
      this.currentMrr(),
    ]);

    const metrics = {
      totalClinics,
      activeSubscriptions,
      mrr,
      churnThisMonth,
      trialing,
      newThisMonth,
    };

    return { ...metrics, metrics, revenueTrend };
  }

  async clinics(user: TokenPayload) {
    this.ensureAdmin(user);
    const clinics = await this.prisma.clinic.findMany({
      where: { deletedAt: null },
      include: {
        veterinarians: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pets: true, appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clinics.map((clinic) => this.presentClinic(clinic));
  }

  async clinic(id: string, user: TokenPayload) {
    this.ensureAdmin(user);
    const clinic = await this.prisma.clinic.findFirst({
      where: { id, deletedAt: null },
      include: {
        veterinarians: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pets: true, appointments: true } },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    return this.presentClinic(clinic);
  }

  async revenueSummary(user: TokenPayload) {
    this.ensureAdmin(user);
    const [mrr, successfulPayments, invoiceCount] = await Promise.all([
      this.currentMrr(),
      this.prisma.payment.count({
        where: { status: PaymentStatus.SUCCESSFUL },
      }),
      this.prisma.payment.count(),
    ]);

    return { mrr, arr: mrr * 12, successfulPayments, invoiceCount };
  }

  async revenueMonthly(user: TokenPayload) {
    this.ensureAdmin(user);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return this.startOfMonth(date);
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.SUCCESSFUL,
        paidAt: { gte: months[0] },
      },
      select: { amount: true, paidAt: true },
    });

    return months.map((monthStart) => {
      const next = new Date(monthStart);
      next.setMonth(next.getMonth() + 1);
      const amount = payments
        .filter(
          (payment) =>
            payment.paidAt &&
            payment.paidAt >= monthStart &&
            payment.paidAt < next,
        )
        .reduce((sum, payment) => sum + payment.amount, 0);

      return {
        month: monthStart.toISOString().slice(0, 7),
        mrr: amount / 100,
      };
    });
  }

  private async currentMrr() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
        clinicId: { not: null },
      },
      select: { plan: true, price: true },
    });

    return subscriptions.reduce((sum, subscription) => {
      const mrr =
        subscription.plan === SubscriptionPlan.YEARLY
          ? subscription.price / 12
          : subscription.price;
      return sum + mrr / 100;
    }, 0);
  }

  private presentClinic(clinic: {
    id: string;
    name: string;
    phone: string | null;
    city: string | null;
    district: string | null;
    address: string | null;
    createdAt: Date;
    veterinarians: Array<{
      fullName: string;
      email: string;
      phone: string | null;
    }>;
    subscriptions: Array<{
      status: SubscriptionStatus;
      plan: SubscriptionPlan | null;
      trialEndsAt: Date | null;
      currentPeriodEndsAt: Date | null;
      price: number;
    }>;
    _count: { pets: number; appointments: number };
  }) {
    const owner = clinic.veterinarians[0];
    const subscription = clinic.subscriptions[0];

    return {
      id: clinic.id,
      name: clinic.name,
      ownerName: owner?.fullName,
      ownerEmail: owner?.email,
      ownerPhone: owner?.phone ?? clinic.phone ?? undefined,
      city: clinic.city ?? undefined,
      district: clinic.district ?? undefined,
      address: clinic.address ?? undefined,
      subscriptionStatus: subscription?.status.toLowerCase() ?? 'none',
      subscriptionPlan: subscription?.plan?.toLowerCase(),
      trialEndsAt: subscription?.trialEndsAt ?? undefined,
      currentPeriodEndsAt: subscription?.currentPeriodEndsAt ?? undefined,
      mrr: subscription
        ? (subscription.plan === SubscriptionPlan.YEARLY
            ? subscription.price / 12
            : subscription.price) / 100
        : 0,
      totalPatients: clinic._count.pets,
      totalAppointments: clinic._count.appointments,
      lastLoginAt: undefined,
      createdAt: clinic.createdAt,
    };
  }

  private startOfMonth(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  private ensureAdmin(user: TokenPayload): void {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Admin access is required.');
    }
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  BillingAccountType,
  PaymentStatus,
  Role,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

const CLINIC_PRICES = {
  [SubscriptionPlan.MONTHLY]: 149900,
  [SubscriptionPlan.YEARLY]: 1499000,
};

const OWNER_PRICES = {
  [SubscriptionPlan.MONTHLY]: 9990,
  [SubscriptionPlan.YEARLY]: 99900,
};

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getClinicCurrent(user: TokenPayload) {
    this.ensureClinicUser(user);
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        accountType: BillingAccountType.CLINIC,
        clinicId: user.clinicId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.presentSubscription(subscription);
  }

  async createClinicCheckout(dto: CheckoutDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const plan = this.toPlan(dto.plan ?? 'monthly');
    const subscription = await this.upsertSubscription({
      accountType: BillingAccountType.CLINIC,
      clinicId: user.clinicId,
      plan,
      price: CLINIC_PRICES[plan],
    });

    return this.checkoutResponse(subscription.id, plan, dto);
  }

  async cancelClinic(user: TokenPayload) {
    this.ensureClinicUser(user);
    return this.cancel(BillingAccountType.CLINIC, user.clinicId);
  }

  async resumeClinic(user: TokenPayload) {
    this.ensureClinicUser(user);
    return this.resume(BillingAccountType.CLINIC, user.clinicId);
  }

  async getOwnerCurrent(user: TokenPayload) {
    this.ensureOwner(user);
    const subscription = await this.prisma.subscription.findFirst({
      where: { accountType: BillingAccountType.OWNER, ownerId: user.sub },
      orderBy: { createdAt: 'desc' },
    });

    const presented = this.presentSubscription(subscription);

    return {
      ...presented,
      isActive:
        presented.status === 'active' || presented.status === 'trialing',
      currentPeriodEnd: presented.currentPeriodEndsAt,
      plan: subscription
        ? {
            id: `owner-premium-${presented.plan ?? 'monthly'}`,
            name: 'VetCep Premium',
            priceMonthly:
              OWNER_PRICES[subscription.plan ?? SubscriptionPlan.MONTHLY] / 100,
            currency: 'TRY',
            features: ['Saglik takibi', 'Diyet plani', 'Hatirlaticilar'],
          }
        : undefined,
    };
  }

  async createOwnerCheckout(dto: CheckoutDto, user: TokenPayload) {
    this.ensureOwner(user);
    const plan = this.toPlan(
      dto.plan ?? (dto.planId?.includes('yearly') ? 'yearly' : 'monthly'),
    );
    const subscription = await this.upsertSubscription({
      accountType: BillingAccountType.OWNER,
      ownerId: user.sub,
      plan,
      price: OWNER_PRICES[plan],
    });

    return {
      ...this.checkoutResponse(subscription.id, plan, dto),
      token: `mock_${subscription.id}`,
      expiresAt: new Date(Date.now() + 30 * 60_000),
    };
  }

  async cancelOwner(user: TokenPayload) {
    this.ensureOwner(user);
    const result = await this.cancel(BillingAccountType.OWNER, user.sub);
    return { ...result, isActive: result.status === 'active' };
  }

  async resumeOwner(user: TokenPayload) {
    this.ensureOwner(user);
    const result = await this.resume(BillingAccountType.OWNER, user.sub);
    return { ...result, isActive: result.status === 'active' };
  }

  async handleWebhook(payload: Record<string, unknown>) {
    const subscriptionId = String(
      payload.subscriptionId ??
        payload.conversationId ??
        payload.paymentId ??
        '',
    );
    const rawStatus = String(
      payload.status ?? payload.event ?? '',
    ).toLowerCase();

    if (!subscriptionId) {
      return { received: true, ignored: true };
    }

    const status =
      rawStatus.includes('fail') || rawStatus.includes('past_due')
        ? SubscriptionStatus.PAST_DUE
        : rawStatus.includes('cancel')
          ? SubscriptionStatus.CANCELED
          : SubscriptionStatus.ACTIVE;

    const subscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        currentPeriodEndsAt: this.nextPeriod(
          new Date(),
          SubscriptionPlan.MONTHLY,
        ),
      },
    });

    await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        clinicId: subscription.clinicId,
        ownerId: subscription.ownerId,
        amount: subscription.price,
        status:
          status === SubscriptionStatus.ACTIVE
            ? PaymentStatus.SUCCESSFUL
            : PaymentStatus.FAILED,
        provider: 'iyzico',
        providerRef: String(
          payload.paymentId ?? payload.token ?? subscription.id,
        ),
        paidAt: status === SubscriptionStatus.ACTIVE ? new Date() : undefined,
      },
    });

    return {
      received: true,
      subscription: this.presentSubscription(subscription),
    };
  }

  private async upsertSubscription(input: {
    accountType: BillingAccountType;
    clinicId?: string;
    ownerId?: string;
    plan: SubscriptionPlan;
    price: number;
  }) {
    const current = await this.prisma.subscription.findFirst({
      where: {
        accountType: input.accountType,
        clinicId: input.clinicId,
        ownerId: input.ownerId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = {
      accountType: input.accountType,
      clinicId: input.clinicId,
      ownerId: input.ownerId,
      plan: input.plan,
      price: input.price,
      status: SubscriptionStatus.TRIALING,
      currentPeriodEndsAt: this.nextPeriod(new Date(), input.plan),
      provider: 'iyzico',
    };

    if (current) {
      return this.prisma.subscription.update({
        where: { id: current.id },
        data: { ...data, cancelAtPeriodEnd: false },
      });
    }

    return this.prisma.subscription.create({
      data: {
        ...data,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private async cancel(accountType: BillingAccountType, accountId?: string) {
    const subscription = await this.findSubscription(accountType, accountId);
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    return this.presentSubscription(updated);
  }

  private async resume(accountType: BillingAccountType, accountId?: string) {
    const subscription = await this.findSubscription(accountType, accountId);
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false, status: SubscriptionStatus.ACTIVE },
    });

    return this.presentSubscription(updated);
  }

  private findSubscription(
    accountType: BillingAccountType,
    accountId?: string,
  ) {
    return this.prisma.subscription.findFirstOrThrow({
      where: {
        accountType,
        ...(accountType === BillingAccountType.CLINIC
          ? { clinicId: accountId }
          : { ownerId: accountId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private checkoutResponse(
    id: string,
    plan: SubscriptionPlan,
    dto: CheckoutDto,
  ) {
    const baseUrl =
      this.configService.get<string>('IYZICO_CHECKOUT_BASE_URL') ??
      this.configService.get<string>('APP_URL') ??
      'https://vetcep.com';
    const hostedUrl = `${baseUrl.replace(/\/$/, '')}/billing/checkout?subscriptionId=${id}&plan=${plan.toLowerCase()}`;

    return {
      hostedUrl,
      checkoutUrl: hostedUrl,
      formToken: `mock_${id}`,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    };
  }

  private presentSubscription(subscription: Subscription | null) {
    if (!subscription) {
      return {
        status: 'none',
        plan: undefined,
        trialEndsAt: undefined,
        currentPeriodEndsAt: undefined,
        cancelAtPeriodEnd: false,
        mrr: 0,
        price: 0,
      };
    }

    return {
      id: subscription.id,
      clinicId: subscription.clinicId ?? undefined,
      ownerId: subscription.ownerId ?? undefined,
      status: subscription.status.toLowerCase(),
      plan: subscription.plan?.toLowerCase(),
      trialEndsAt: subscription.trialEndsAt ?? undefined,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt ?? undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      mrr: this.monthlyRecurringRevenue(subscription.plan, subscription.price),
      price: subscription.price / 100,
    };
  }

  private monthlyRecurringRevenue(
    plan: SubscriptionPlan | null,
    price: number,
  ) {
    return plan === SubscriptionPlan.YEARLY
      ? Math.round(price / 12) / 100
      : price / 100;
  }

  private nextPeriod(from: Date, plan: SubscriptionPlan) {
    const next = new Date(from);
    if (plan === SubscriptionPlan.YEARLY) {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  private toPlan(plan: 'monthly' | 'yearly') {
    return plan === 'yearly'
      ? SubscriptionPlan.YEARLY
      : SubscriptionPlan.MONTHLY;
  }

  private ensureClinicUser(user: TokenPayload): void {
    if (
      (user.role === Role.CLINIC_ADMIN || user.role === Role.VETERINARIAN) &&
      user.clinicId
    ) {
      return;
    }

    throw new ForbiddenException('Clinic subscription requires clinic access.');
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role !== Role.OWNER) {
      throw new ForbiddenException('Owner subscription requires owner access.');
    }
  }
}

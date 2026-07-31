import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import Redis from 'ioredis';
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

const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;

type BillingWebhookVerification = {
  eventId?: string;
  rawBody?: Buffer;
  signature?: string;
  timestamp?: string;
};

@Injectable()
export class BillingService {
  private redis?: Redis;

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

  async handleWebhook(
    payload: Record<string, unknown>,
    verification?: BillingWebhookVerification,
  ) {
    await this.verifyWebhook(verification);

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

  private async verifyWebhook(
    verification: BillingWebhookVerification | undefined,
  ): Promise<void> {
    const secret = this.configService.get<string>('BILLING_WEBHOOK_SECRET');

    if (!secret) {
      throw new ServiceUnavailableException(
        'Billing webhook secret is not configured.',
      );
    }

    if (
      !verification?.eventId ||
      !verification.rawBody ||
      !verification.signature ||
      !verification.timestamp
    ) {
      throw new UnauthorizedException(
        'Billing webhook signature, timestamp and event id are required.',
      );
    }

    this.verifyWebhookTimestamp(verification.timestamp);
    this.verifyWebhookSignature(
      secret,
      verification.timestamp,
      verification.rawBody,
      verification.signature,
    );
    await this.rememberWebhookEvent(verification.eventId);
  }

  private verifyWebhookTimestamp(timestamp: string): void {
    const timestampSeconds = Number(timestamp);

    if (!Number.isInteger(timestampSeconds) || timestampSeconds <= 0) {
      throw new UnauthorizedException('Invalid billing webhook timestamp.');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const toleranceSeconds = this.getWebhookToleranceSeconds();

    if (Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds) {
      throw new UnauthorizedException('Billing webhook timestamp is stale.');
    }
  }

  private verifyWebhookSignature(
    secret: string,
    timestamp: string,
    rawBody: Buffer,
    signature: string,
  ): void {
    const expectedSignature = `sha256=${createHmac('sha256', secret)
      .update(timestamp)
      .update('.')
      .update(rawBody)
      .digest('hex')}`;
    const receivedSignature = signature.startsWith('sha256=')
      ? signature
      : `sha256=${signature}`;
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(receivedSignature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Invalid billing webhook signature.');
    }
  }

  private async rememberWebhookEvent(eventId: string): Promise<void> {
    const eventHash = createHash('sha256').update(eventId).digest('hex');
    const result = await this.getRedis().set(
      `billing:webhook:event:${eventHash}`,
      '1',
      'EX',
      this.getWebhookToleranceSeconds(),
      'NX',
    );

    if (result !== 'OK') {
      throw new UnauthorizedException(
        'Billing webhook event has already been processed.',
      );
    }
  }

  private getWebhookToleranceSeconds(): number {
    const configured = Number(
      this.configService.get<string>('BILLING_WEBHOOK_TOLERANCE_SECONDS'),
    );

    return Number.isInteger(configured) && configured > 0
      ? configured
      : DEFAULT_WEBHOOK_TOLERANCE_SECONDS;
  }

  private getRedis(): Redis {
    if (!this.redis) {
      const redisUrl = this.configService.get<string>('REDIS_URL');

      if (!redisUrl) {
        throw new ServiceUnavailableException('Redis is not configured.');
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
      });
    }

    return this.redis;
  }
}

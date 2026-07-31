import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BillingAccountType,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';

describe('BillingService webhook verification', () => {
  const subscriptionUpdate = jest.fn();
  const paymentCreate = jest.fn();
  const redisSet = jest.fn();
  const configGet = jest.fn();
  const prisma = {
    subscription: {
      update: subscriptionUpdate,
    },
    payment: {
      create: paymentCreate,
    },
  } as unknown as PrismaService;
  const configService = {
    get: configGet,
  } as unknown as ConfigService;
  const secret = 'billing-webhook-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    configGet.mockImplementation((key: string) => {
      if (key === 'BILLING_WEBHOOK_SECRET') {
        return secret;
      }
      if (key === 'BILLING_WEBHOOK_TOLERANCE_SECONDS') {
        return '300';
      }
      if (key === 'REDIS_URL') {
        return 'redis://localhost:6379';
      }
      return undefined;
    });
    redisSet.mockResolvedValue('OK');
    subscriptionUpdate.mockResolvedValue({
      id: 'sub-1',
      accountType: BillingAccountType.CLINIC,
      clinicId: 'clinic-1',
      ownerId: null,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.MONTHLY,
      price: 149900,
      trialEndsAt: null,
      currentPeriodEndsAt: new Date('2026-08-31T00:00:00.000Z'),
      cancelAtPeriodEnd: false,
    });
    paymentCreate.mockResolvedValue({});
  });

  function createService() {
    const service = new BillingService(prisma, configService);
    jest
      .spyOn(
        service as unknown as { getRedis: () => { set: typeof redisSet } },
        'getRedis',
      )
      .mockReturnValue({ set: redisSet });
    return service;
  }

  function signedVerification(
    payload: Record<string, unknown>,
    overrides: Partial<{
      eventId: string;
      rawBody: Buffer;
      signature: string;
      timestamp: string;
    }> = {},
  ) {
    const rawBody = overrides.rawBody ?? Buffer.from(JSON.stringify(payload));
    const timestamp =
      overrides.timestamp ?? Math.floor(Date.now() / 1000).toString();
    const signature =
      overrides.signature ??
      `sha256=${createHmac('sha256', secret)
        .update(timestamp)
        .update('.')
        .update(rawBody)
        .digest('hex')}`;

    return {
      eventId: overrides.eventId ?? 'evt-1',
      rawBody,
      signature,
      timestamp,
    };
  }

  it('accepts a valid signed webhook and records the payment', async () => {
    const service = createService();
    const payload = {
      subscriptionId: 'sub-1',
      status: 'payment_success',
      paymentId: 'pay-1',
    };

    const result = await service.handleWebhook(
      payload,
      signedVerification(payload),
    );

    expect(redisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^billing:webhook:event:/),
      '1',
      'EX',
      300,
      'NX',
    );
    expect(subscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
      }),
    );
    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          providerRef: 'pay-1',
          subscriptionId: 'sub-1',
        }),
      }),
    );
    expect(result).toMatchObject({
      received: true,
      subscription: { id: 'sub-1', status: 'active' },
    });
  });

  it('rejects missing webhook verification headers', async () => {
    const service = createService();

    await expect(
      service.handleWebhook({ subscriptionId: 'sub-1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects stale webhook timestamps', async () => {
    const service = createService();
    const payload = { subscriptionId: 'sub-1' };
    const staleTimestamp = Math.floor(Date.now() / 1000 - 301).toString();

    await expect(
      service.handleWebhook(
        payload,
        signedVerification(payload, { timestamp: staleTimestamp }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid webhook signatures', async () => {
    const service = createService();
    const payload = { subscriptionId: 'sub-1' };

    await expect(
      service.handleWebhook(
        payload,
        signedVerification(payload, { signature: 'sha256=invalid' }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects replayed webhook events', async () => {
    const service = createService();
    const payload = { subscriptionId: 'sub-1' };
    redisSet.mockResolvedValue(null);

    await expect(
      service.handleWebhook(payload, signedVerification(payload)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('fails closed when the webhook secret is not configured', async () => {
    const service = createService();
    configGet.mockImplementation((key: string) =>
      key === 'BILLING_WEBHOOK_SECRET' ? undefined : '300',
    );

    await expect(
      service.handleWebhook({ subscriptionId: 'sub-1' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

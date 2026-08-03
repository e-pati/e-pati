import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';

type AuditRecordInput = {
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(user: TokenPayload, input: AuditRecordInput) {
    return this.prisma.auditLog.create({
      data: {
        ...this.actorScope(user),
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        ipAddress: input.ipAddress,
        metadata: input.metadata ? this.toJson(input.metadata) : undefined,
      },
    });
  }

  private actorScope(user: TokenPayload) {
    if (user.type === 'owner') {
      return { ownerId: user.sub };
    }

    return { veterinarianId: user.sub };
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    if (value === null) {
      return null as unknown as Prisma.InputJsonValue;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value
        .filter((item) => item !== undefined)
        .map((item) => this.toJson(item));
    }

    if (typeof value === 'object' && value) {
      const json: Record<string, Prisma.InputJsonValue> = {};

      for (const [key, nestedValue] of Object.entries(value)) {
        if (nestedValue !== undefined) {
          json[key] = this.toJson(nestedValue);
        }
      }

      return json;
    }

    return String(value);
  }
}

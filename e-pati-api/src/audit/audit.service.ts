import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

type AuditRecordInput = {
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

const auditLogInclude = {
  owner: { select: { id: true, fullName: true, email: true } },
  veterinarian: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.AuditLogInclude;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(user: TokenPayload, query: ListAuditLogsQueryDto) {
    this.ensureAdmin(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.buildAuditWhere(query);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: auditLogInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => this.present(item)),
      total,
      page,
      limit,
    };
  }

  async getLog(user: TokenPayload, id: string) {
    this.ensureAdmin(user);
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: auditLogInclude,
    });

    if (!log) {
      throw new NotFoundException('Audit log not found.');
    }

    return this.present(log);
  }

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

  private buildAuditWhere(
    query: ListAuditLogsQueryDto,
  ): Prisma.AuditLogWhereInput {
    return {
      action: query.action,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
      ...(query.actorId ? this.actorFilter(query) : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              gte: query.from ? new Date(query.from) : undefined,
              lte: query.to ? new Date(query.to) : undefined,
            },
          }
        : {}),
    };
  }

  private actorFilter(query: ListAuditLogsQueryDto): Prisma.AuditLogWhereInput {
    if (query.actorType === 'owner') {
      return { ownerId: query.actorId };
    }

    if (query.actorType === 'veterinarian') {
      return { veterinarianId: query.actorId };
    }

    return {
      OR: [{ ownerId: query.actorId }, { veterinarianId: query.actorId }],
    };
  }

  private actorScope(user: TokenPayload) {
    if (user.type === 'owner') {
      return { ownerId: user.sub };
    }

    return { veterinarianId: user.sub };
  }

  private ensureAdmin(user: TokenPayload): void {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    throw new ForbiddenException('Audit logs require admin access.');
  }

  private present<
    T extends {
      id: string;
      ownerId: string | null;
      veterinarianId: string | null;
      action: string;
      resourceType: string;
      resourceId: string | null;
      ipAddress: string | null;
      metadata: Prisma.JsonValue | null;
      createdAt: Date;
      owner?: { id: string; fullName: string; email: string } | null;
      veterinarian?: { id: string; fullName: string; email: string } | null;
    },
  >(log: T) {
    return {
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      metadata: log.metadata,
      createdAt: log.createdAt,
      actor: log.owner
        ? {
            type: 'owner' as const,
            id: log.owner.id,
            fullName: log.owner.fullName,
            email: log.owner.email,
          }
        : log.veterinarian
          ? {
              type: 'veterinarian' as const,
              id: log.veterinarian.id,
              fullName: log.veterinarian.fullName,
              email: log.veterinarian.email,
            }
          : undefined,
    };
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

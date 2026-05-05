import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';

@Injectable()
export class PrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  requests(user: TokenPayload) {
    this.ensureOwner(user);
    return this.prisma.privacyRequest.findMany({
      where: { ownerId: user.sub },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreatePrivacyRequestDto, user: TokenPayload) {
    this.ensureOwner(user);
    return this.prisma.privacyRequest.create({
      data: {
        ownerId: user.sub,
        type: dto.type,
        message: dto.message,
      },
    });
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role !== Role.OWNER) {
      throw new ForbiddenException('Owner access is required.');
    }
  }
}

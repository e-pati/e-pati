import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  updateMe(dto: UpdateOwnerDto, user: TokenPayload) {
    if (user.role !== Role.OWNER) {
      throw new ForbiddenException('Owner access is required.');
    }

    return this.prisma.owner.update({
      where: { id: user.sub },
      data: {
        fullName: dto.fullName?.trim(),
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }
}

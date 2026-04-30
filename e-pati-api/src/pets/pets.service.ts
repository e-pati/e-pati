import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Pet, Role } from '@prisma/client';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { TokenPayload } from '../auth/types/token-payload';

const QR_TOKEN_FALLBACK_TTL = '24h';
const GENERATED_OWNER_EMAIL_DOMAIN = 'no-email.e-pati.local';
const GENERATED_PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  findAllForUser(user: TokenPayload) {
    if (user.role === Role.OWNER) {
      return this.prisma.pet.findMany({
        where: {
          ownerId: user.sub,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.clinicId) {
      return this.prisma.pet.findMany({
        where: {
          clinicId: user.clinicId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }

  async create(user: TokenPayload, dto: CreatePetDto) {
    const ownerId = await this.resolveOwnerIdForCreate(user, dto);

    return this.prisma.pet.create({
      data: {
        ownerId,
        clinicId: user.role === Role.OWNER ? undefined : user.clinicId,
        name: dto.name.trim(),
        species: dto.species.trim(),
        breed: dto.breed?.trim(),
        sex: dto.sex,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        microchipNo: dto.microchipNo,
        photoUrl: dto.photoUrl,
      },
    });
  }

  async findOne(id: string, user: TokenPayload): Promise<Pet> {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    this.ensureCanRead(pet, user);
    return pet;
  }

  async update(
    id: string,
    user: TokenPayload,
    dto: UpdatePetDto,
  ): Promise<Pet> {
    const pet = await this.findOne(id, user);
    this.ensureCanMutate(pet, user);

    return this.prisma.pet.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        species: dto.species?.trim(),
        breed: dto.breed?.trim(),
        sex: dto.sex,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        microchipNo: dto.microchipNo,
        photoUrl: dto.photoUrl,
      },
    });
  }

  async remove(id: string, user: TokenPayload): Promise<void> {
    const pet = await this.findOne(id, user);
    this.ensureCanMutate(pet, user);

    await this.prisma.pet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getSummary(id: string, user: TokenPayload) {
    const pet = await this.findOne(id, user);
    const now = new Date();

    const [latestExamination, activePrescriptions, upcomingVaccinations] =
      await Promise.all([
        this.prisma.examination.findFirst({
          where: { petId: pet.id, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.prescription.findMany({
          where: { petId: pet.id, deletedAt: null },
          include: { medications: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
        this.prisma.vaccination.findMany({
          where: {
            petId: pet.id,
            deletedAt: null,
            dueAt: { gte: now },
          },
          orderBy: { dueAt: 'asc' },
          take: 5,
        }),
      ]);

    return {
      pet,
      latestExamination,
      activePrescriptions,
      upcomingVaccinations,
    };
  }

  async createQrToken(id: string, user: TokenPayload) {
    const pet = await this.findOne(id, user);

    return {
      token: await this.jwtService.signAsync(
        {
          sub: pet.id,
          ownerId: pet.ownerId,
          type: 'pet-readonly',
        },
        {
          secret: this.getQrSecret(),
          expiresIn: this.getQrTokenTtl(),
        },
      ),
    };
  }

  private ensureCanRead(pet: Pet, user: TokenPayload): void {
    if (user.role === Role.OWNER && pet.ownerId === user.sub) {
      return;
    }

    if (user.clinicId && pet.clinicId === user.clinicId) {
      return;
    }

    throw new ForbiddenException('You cannot access this pet.');
  }

  private ensureCanMutate(pet: Pet, user: TokenPayload): void {
    if (user.role === Role.OWNER && pet.ownerId === user.sub) {
      return;
    }

    if (user.clinicId && pet.clinicId === user.clinicId) {
      return;
    }

    throw new ForbiddenException('You cannot modify this pet.');
  }

  private async resolveOwnerIdForCreate(
    user: TokenPayload,
    dto: CreatePetDto,
  ): Promise<string> {
    if (user.role === Role.OWNER) {
      return user.sub;
    }

    if (!user.clinicId) {
      throw new ForbiddenException('Clinic staff must belong to a clinic.');
    }

    if (dto.ownerId) {
      const owner = await this.prisma.owner.findFirst({
        where: { id: dto.ownerId, deletedAt: null },
        select: { id: true },
      });

      if (!owner) {
        throw new NotFoundException('Owner not found.');
      }

      return owner.id;
    }

    if (dto.ownerEmail) {
      const email = dto.ownerEmail.toLowerCase();
      const existingOwner = await this.prisma.owner.findFirst({
        where: { email, deletedAt: null },
        select: { id: true },
      });

      if (existingOwner) {
        return existingOwner.id;
      }

      const owner = await this.prisma.owner.create({
        data: {
          email,
          phone: dto.ownerPhone,
          fullName: dto.ownerFullName?.trim() ?? email,
          passwordHash: await this.generatePlaceholderPasswordHash(),
        },
        select: { id: true },
      });

      return owner.id;
    }

    const owner = await this.prisma.owner.create({
      data: {
        email: this.generatePlaceholderOwnerEmail(user.clinicId),
        fullName: dto.ownerFullName?.trim() ?? 'Sahip bilgisi yok',
        passwordHash: await this.generatePlaceholderPasswordHash(),
      },
      select: { id: true },
    });

    return owner.id;
  }

  private generatePlaceholderOwnerEmail(clinicId: string): string {
    const token = randomBytes(10).toString('hex');
    return `clinic-${clinicId}-${token}@${GENERATED_OWNER_EMAIL_DOMAIN}`;
  }

  private generatePlaceholderPasswordHash(): Promise<string> {
    return bcrypt.hash(
      randomBytes(32).toString('base64url'),
      GENERATED_PASSWORD_SALT_ROUNDS,
    );
  }

  private getQrSecret(): string {
    return (
      this.configService.get<string>('QR_TOKEN_SECRET') ??
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'replace-with-access-token-secret'
    );
  }

  private getQrTokenTtl(): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>('QR_TOKEN_TTL') ??
      QR_TOKEN_FALLBACK_TTL) as JwtSignOptions['expiresIn'];
  }
}

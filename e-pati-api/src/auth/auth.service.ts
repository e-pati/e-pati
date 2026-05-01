import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { Owner, Role, Veterinarian } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import Redis from 'ioredis';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TokenPayload } from './types/token-payload';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    clinicId?: string;
  };
};

type StaffWithClinic = Veterinarian & {
  clinic: {
    id: string;
    deletedAt: Date | null;
    isApproved: boolean;
  };
};

const ACCESS_TOKEN_FALLBACK_TTL = '15m';
const REFRESH_TOKEN_DAYS = 7;
const PASSWORD_SALT_ROUNDS = 12;
const OTP_TTL_SECONDS = 5 * 60;

@Injectable()
export class AuthService {
  private redis?: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ email: string; otpExpiresIn: number }> {
    const email = this.normalizeEmail(dto.email);
    const existingOwner = await this.findOwnerByEmailOrPhone(email, dto.phone);

    if (existingOwner?.emailVerifiedAt) {
      throw new ConflictException('Email or phone is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    if (existingOwner) {
      await this.prisma.owner.update({
        where: { id: existingOwner.id },
        data: {
          email,
          phone: dto.phone,
          fullName: dto.fullName.trim(),
          passwordHash,
          emailVerifiedAt: null,
          deletedAt: null,
        },
      });
    } else {
      await this.prisma.owner.create({
        data: {
          email,
          phone: dto.phone,
          fullName: dto.fullName.trim(),
          passwordHash,
        },
      });
    }

    await this.sendOtpToEmail(email);
    return { email, otpExpiresIn: OTP_TTL_SECONDS };
  }

  async sendOtp(
    dto: SendOtpDto,
  ): Promise<{ email: string; otpExpiresIn: number }> {
    const email = this.normalizeEmail(dto.email);
    const owner = await this.prisma.owner.findUnique({
      where: { email },
    });

    if (!owner || owner.deletedAt) {
      throw new NotFoundException('Owner account was not found.');
    }

    await this.sendOtpToEmail(email);
    return { email, otpExpiresIn: OTP_TTL_SECONDS };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const storedCodeHash = await this.getRedis().get(this.getOtpKey(email));

    if (!storedCodeHash) {
      throw new BadRequestException('OTP code is expired or invalid.');
    }

    if (storedCodeHash !== this.hashOtp(email, dto.code)) {
      throw new BadRequestException('OTP code is expired or invalid.');
    }

    const owner = await this.prisma.owner.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    });

    await this.getRedis().del(this.getOtpKey(email));
    return this.issueTokenPair(owner);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const owner = await this.prisma.owner.findUnique({
      where: { email: this.normalizeEmail(dto.email) },
    });

    if (!owner?.passwordHash || owner.deletedAt || !owner.emailVerifiedAt) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      owner.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueTokenPair(owner);
  }

  async loginClinic(dto: LoginDto): Promise<AuthResponse> {
    const veterinarian = await this.prisma.veterinarian.findUnique({
      where: { email: this.normalizeEmail(dto.email) },
      include: {
        clinic: {
          select: {
            id: true,
            deletedAt: true,
            isApproved: true,
          },
        },
      },
    });

    if (
      !veterinarian?.passwordHash ||
      veterinarian.deletedAt ||
      veterinarian.clinic.deletedAt ||
      !veterinarian.clinic.isApproved
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      veterinarian.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueStaffTokenPair(veterinarian);
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        owner: true,
        veterinarian: {
          include: {
            clinic: {
              select: {
                id: true,
                deletedAt: true,
                isApproved: true,
              },
            },
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    if (storedToken.owner && !storedToken.owner.deletedAt) {
      return this.issueTokenPair(storedToken.owner);
    }

    if (
      storedToken.veterinarian &&
      !storedToken.veterinarian.deletedAt &&
      !storedToken.veterinarian.clinic.deletedAt &&
      storedToken.veterinarian.clinic.isApproved
    ) {
      return this.issueStaffTokenPair(storedToken.veterinarian);
    }

    throw new UnauthorizedException('Invalid refresh token.');
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokenPair(owner: Owner): Promise<AuthResponse> {
    const payload: TokenPayload = {
      sub: owner.id,
      email: owner.email,
      role: owner.role,
      type: 'owner',
    };
    const refreshToken = randomBytes(48).toString('base64url');
    const expiresAt = this.getRefreshExpiry();

    await this.prisma.refreshToken.create({
      data: {
        ownerId: owner.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.getAccessSecret(),
        expiresIn: this.getAccessTokenTtl(),
      }),
      refreshToken,
      user: {
        id: owner.id,
        email: owner.email,
        fullName: owner.fullName,
        role: owner.role,
      },
    };
  }

  private async issueStaffTokenPair(
    veterinarian: StaffWithClinic,
  ): Promise<AuthResponse> {
    const payload: TokenPayload = {
      sub: veterinarian.id,
      email: veterinarian.email,
      role: veterinarian.role,
      type: 'veterinarian',
      clinicId: veterinarian.clinicId,
    };
    const refreshToken = randomBytes(48).toString('base64url');
    const expiresAt = this.getRefreshExpiry();

    await this.prisma.refreshToken.create({
      data: {
        veterinarianId: veterinarian.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.getAccessSecret(),
        expiresIn: this.getAccessTokenTtl(),
      }),
      refreshToken,
      user: {
        id: veterinarian.id,
        email: veterinarian.email,
        fullName: veterinarian.fullName,
        role: veterinarian.role,
        clinicId: veterinarian.clinicId,
      },
    };
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256')
      .update(`${this.getRefreshSecret()}:${refreshToken}`)
      .digest('hex');
  }

  private async findOwnerByEmailOrPhone(
    email: string,
    phone: string | undefined,
  ): Promise<Owner | null> {
    return this.prisma.owner.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });
  }

  private async sendOtpToEmail(email: string): Promise<void> {
    const code = randomInt(100000, 1000000).toString();

    await this.getRedis().set(
      this.getOtpKey(email),
      this.hashOtp(email, code),
      'EX',
      OTP_TTL_SECONDS,
    );

    await this.getResend().emails.send({
      from: this.getMailFrom(),
      to: this.getMailTo(email),
      subject: 'e-Pati dogrulama kodunuz',
      text: `e-Pati dogrulama kodunuz: ${code}. Kod 5 dakika gecerlidir.`,
    });
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

  private getResend(): Resend {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('Resend is not configured.');
    }

    return new Resend(apiKey);
  }

  private getMailFrom(): string {
    return (
      this.configService.get<string>('MAIL_FROM') ??
      'e-Pati <noreply@example.com>'
    );
  }

  private getMailTo(email: string): string {
    return this.configService.get<string>('OTP_EMAIL_TO') ?? email;
  }

  private getOtpKey(email: string): string {
    return `auth:otp:${email}`;
  }

  private hashOtp(email: string, code: string): string {
    return createHash('sha256')
      .update(`${this.getRefreshSecret()}:${email}:${code}`)
      .digest('hex');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getAccessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'replace-with-access-token-secret'
    );
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'replace-with-refresh-token-secret'
    );
  }

  private getAccessTokenTtl(): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>('JWT_ACCESS_TTL') ??
      ACCESS_TOKEN_FALLBACK_TTL) as JwtSignOptions['expiresIn'];
  }

  private getRefreshExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
    return expiresAt;
  }
}

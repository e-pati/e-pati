import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectWhatsAppDto } from './dto/connect-whatsapp.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';

const DEFAULT_TEMPLATES = [
  { key: 'exam_summary', name: 'exam_summary', status: 'missing' },
  { key: 'vaccine_reminder', name: 'vaccine_reminder', status: 'missing' },
  {
    key: 'appointment_reminder',
    name: 'appointment_reminder',
    status: 'missing',
  },
  { key: 'lab_result_ready', name: 'lab_result_ready', status: 'missing' },
  { key: 'custom', name: 'custom', status: 'approved' },
];

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async status(user: TokenPayload) {
    this.ensureClinicUser(user);
    const connection = await this.prisma.whatsAppConnection.findUnique({
      where: { clinicId: user.clinicId },
    });

    return {
      connected: connection?.connected ?? false,
      phoneNumber: connection?.phoneNumber,
      businessName: connection?.businessName,
      templates: this.templates(connection?.templates),
    };
  }

  async connect(dto: ConnectWhatsAppDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { name: true },
    });

    const connection = await this.prisma.whatsAppConnection.upsert({
      where: { clinicId: user.clinicId! },
      update: {
        phoneNumber: dto.phoneNumber,
        businessName: clinic?.name,
        connected: Boolean(
          this.configService.get<string>('META_WHATSAPP_TOKEN'),
        ),
      },
      create: {
        clinicId: user.clinicId!,
        phoneNumber: dto.phoneNumber,
        businessName: clinic?.name,
        connected: Boolean(
          this.configService.get<string>('META_WHATSAPP_TOKEN'),
        ),
        templates: DEFAULT_TEMPLATES as Prisma.InputJsonValue,
      },
    });

    return {
      connected: connection.connected,
      phoneNumber: connection.phoneNumber,
      businessName: connection.businessName,
      templates: this.templates(connection.templates),
    };
  }

  async send(dto: SendWhatsAppDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const to = dto.to ?? dto.ownerPhone;

    if (!to) {
      throw new BadRequestException('to or ownerPhone is required.');
    }

    const type = dto.type ?? dto.template ?? 'custom';
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        clinicId: user.clinicId,
        petId: dto.petId,
        to,
        type,
        message: dto.message,
        variables: dto.variables as Prisma.InputJsonObject,
        status: this.canUseMetaApi() ? 'queued' : 'sent',
      },
    });

    if (this.canUseMetaApi()) {
      void this.sendViaMeta(to, type, dto.message, dto.variables).catch(
        async () => {
          await this.prisma.whatsAppMessage.update({
            where: { id: message.id },
            data: { status: 'failed' },
          });
        },
      );
    }

    return {
      id: message.id,
      status: message.status as 'queued' | 'sent' | 'failed',
    };
  }

  private templates(value: Prisma.JsonValue | null | undefined) {
    return Array.isArray(value) ? value : DEFAULT_TEMPLATES;
  }

  private canUseMetaApi() {
    return Boolean(
      this.configService.get<string>('META_WHATSAPP_TOKEN') &&
      this.configService.get<string>('META_WHATSAPP_PHONE_NUMBER_ID'),
    );
  }

  private async sendViaMeta(
    to: string,
    type: string,
    message?: string,
    variables?: Record<string, unknown>,
  ) {
    const phoneNumberId = this.configService.get<string>(
      'META_WHATSAPP_PHONE_NUMBER_ID',
    );
    const token = this.configService.get<string>('META_WHATSAPP_TOKEN');

    if (!phoneNumberId || !token) {
      return;
    }

    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body: message ?? `${type}: ${JSON.stringify(variables ?? {})}`,
        },
      }),
    });
  }

  private ensureClinicUser(user: TokenPayload): void {
    if (
      (user.role === Role.CLINIC_ADMIN || user.role === Role.VETERINARIAN) &&
      user.clinicId
    ) {
      return;
    }

    throw new ForbiddenException('Clinic access is required.');
  }
}

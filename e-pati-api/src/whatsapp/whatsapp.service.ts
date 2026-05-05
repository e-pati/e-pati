import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectWhatsAppDto } from './dto/connect-whatsapp.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';

type MetaMessageResponse = {
  messages?: Array<{ id?: string }>;
  error?: { message?: string; code?: number };
};

type MetaTemplate = {
  name: string;
  status: string;
};

type MetaTemplatesResponse = {
  data?: MetaTemplate[];
};

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
  private readonly logger = new Logger(WhatsAppService.name);

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
        connected: this.canUseMetaApi(),
        templates: await this.fetchTemplateStatuses(),
      },
      create: {
        clinicId: user.clinicId!,
        phoneNumber: dto.phoneNumber,
        businessName: clinic?.name,
        connected: this.canUseMetaApi(),
        templates: await this.fetchTemplateStatuses(),
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
    const to = dto.to ?? dto.phoneNumber ?? dto.ownerPhone;

    if (!to) {
      throw new BadRequestException(
        'to, phoneNumber or ownerPhone is required.',
      );
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
      try {
        const providerRef = await this.sendViaMeta(
          to,
          type,
          dto.message,
          dto.variables,
        );
        const updated = await this.prisma.whatsAppMessage.update({
          where: { id: message.id },
          data: {
            providerRef,
            status: providerRef ? 'sent' : 'queued',
          },
        });

        return {
          id: updated.id,
          status: updated.status as 'queued' | 'sent' | 'failed',
          providerRef: updated.providerRef ?? undefined,
        };
      } catch (error) {
        await this.prisma.whatsAppMessage.update({
          where: { id: message.id },
          data: { status: 'failed' },
        });
        throw error;
      }
    }

    return {
      id: message.id,
      status: message.status as 'queued' | 'sent' | 'failed',
    };
  }

  verifyWebhook(mode: string, verifyToken: string, challenge: string) {
    if (
      mode !== 'subscribe' ||
      verifyToken !==
        this.configService.get<string>('META_WHATSAPP_VERIFY_TOKEN')
    ) {
      throw new UnauthorizedException('Invalid webhook verification token.');
    }

    return challenge;
  }

  async receiveWebhook(
    payload: Record<string, unknown>,
    signature?: string,
    rawBody?: Buffer,
  ) {
    this.verifySignature(signature, rawBody);
    const statuses = this.extractStatuses(payload);

    await Promise.all(
      statuses.map((status) =>
        this.prisma.whatsAppMessage.updateMany({
          where: { providerRef: status.id },
          data: {
            status: this.mapWebhookStatus(status.status),
          },
        }),
      ),
    );

    return { received: true };
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
  ): Promise<string | undefined> {
    const phoneNumberId = this.configService.get<string>(
      'META_WHATSAPP_PHONE_NUMBER_ID',
    );
    const token = this.configService.get<string>('META_WHATSAPP_TOKEN');

    if (!phoneNumberId || !token) {
      return;
    }

    const response = await fetch(
      `${this.graphUrl()}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          this.createMetaPayload(to, type, message, variables),
        ),
      },
    );
    const body = (await response.json()) as MetaMessageResponse;

    if (!response.ok) {
      throw new BadRequestException(
        body.error?.message ?? 'WhatsApp message could not be sent.',
      );
    }

    return body.messages?.[0]?.id;
  }

  private createMetaPayload(
    to: string,
    type: string,
    message?: string,
    variables?: Record<string, unknown>,
  ) {
    if (type === 'custom') {
      return {
        messaging_product: 'whatsapp',
        to: this.normalizePhone(to),
        type: 'text',
        text: {
          preview_url: false,
          body: message ?? '',
        },
      };
    }

    return {
      messaging_product: 'whatsapp',
      to: this.normalizePhone(to),
      type: 'template',
      template: {
        name: this.templateName(type),
        language: {
          code:
            this.configService.get<string>('META_WHATSAPP_LANGUAGE') ?? 'tr',
        },
        components: this.templateComponents(variables),
      },
    };
  }

  private templateComponents(variables?: Record<string, unknown>) {
    const values = Object.values(variables ?? {}).filter(
      (value) => value !== undefined && value !== null,
    );

    if (!values.length) {
      return undefined;
    }

    return [
      {
        type: 'body',
        parameters: values.map((value) => ({
          type: 'text',
          text: String(value),
        })),
      },
    ];
  }

  private async fetchTemplateStatuses() {
    const businessAccountId = this.configService.get<string>(
      'META_WHATSAPP_BUSINESS_ACCOUNT_ID',
    );
    const token = this.configService.get<string>('META_WHATSAPP_TOKEN');

    if (!businessAccountId || !token) {
      return DEFAULT_TEMPLATES as Prisma.InputJsonValue;
    }

    try {
      const response = await fetch(
        `${this.graphUrl()}/${businessAccountId}/message_templates?fields=name,status&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const body = (await response.json()) as MetaTemplatesResponse;
      const templates = DEFAULT_TEMPLATES.map((template) => {
        const remote = body.data?.find(
          (item) => item.name === this.templateName(template.key),
        );

        return {
          ...template,
          name: this.templateName(template.key),
          status: remote?.status?.toLowerCase() ?? template.status,
        };
      });

      return templates as Prisma.InputJsonValue;
    } catch (error) {
      this.logger.warn(
        `WhatsApp templates could not be synced: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return DEFAULT_TEMPLATES as Prisma.InputJsonValue;
    }
  }

  private templateName(type: string) {
    const configKey = `META_WHATSAPP_TEMPLATE_${type.toUpperCase()}`;
    return this.configService.get<string>(configKey) ?? type;
  }

  private graphUrl() {
    const version =
      this.configService.get<string>('META_WHATSAPP_API_VERSION') ?? 'v20.0';
    return `https://graph.facebook.com/${version}`;
  }

  private normalizePhone(phone: string) {
    return phone.replace(/[^\d]/g, '');
  }

  private verifySignature(signature?: string, rawBody?: Buffer) {
    const appSecret = this.configService.get<string>(
      'META_WHATSAPP_APP_SECRET',
    );

    if (!appSecret) {
      return;
    }

    if (!signature || !rawBody) {
      throw new UnauthorizedException('Webhook signature is required.');
    }

    const expected = `sha256=${createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }
  }

  private extractStatuses(payload: Record<string, unknown>) {
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    const statuses: Array<{ id: string; status: string }> = [];

    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      const changes = Array.isArray((entry as { changes?: unknown }).changes)
        ? (entry as { changes: unknown[] }).changes
        : [];

      for (const change of changes) {
        const value =
          change && typeof change === 'object'
            ? (change as { value?: { statuses?: unknown } }).value
            : undefined;
        const changeStatuses = Array.isArray(value?.statuses)
          ? value.statuses
          : [];

        for (const status of changeStatuses) {
          if (
            status &&
            typeof status === 'object' &&
            typeof (status as { id?: unknown }).id === 'string' &&
            typeof (status as { status?: unknown }).status === 'string'
          ) {
            statuses.push({
              id: (status as { id: string }).id,
              status: (status as { status: string }).status,
            });
          }
        }
      }
    }

    return statuses;
  }

  private mapWebhookStatus(status: string) {
    if (status === 'failed') {
      return 'failed';
    }

    if (status === 'sent' || status === 'delivered' || status === 'read') {
      return status;
    }

    return 'queued';
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

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampaignChannel, CampaignStatus, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { LostPatientCampaignDto } from './dto/lost-patient-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  candidates(user: TokenPayload) {
    return this.analytics.lostPatients(user);
  }

  async preview(dto: LostPatientCampaignDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const candidates = await this.selectedCandidates(dto, user);
    const previewText = this.renderMessage(dto.message, candidates[0]);

    return {
      previewText,
      message: previewText,
      estimatedRecipients: candidates.length,
      recipientCount: candidates.length,
      estimatedCost: dto.channel === 'sms' ? candidates.length * 0.8 : 0,
    };
  }

  async send(dto: LostPatientCampaignDto, user: TokenPayload) {
    this.ensureClinicUser(user);
    const candidates = await this.selectedCandidates(dto, user);
    const campaign = await this.prisma.campaign.create({
      data: {
        clinicId: user.clinicId,
        channel:
          dto.channel === 'whatsapp'
            ? CampaignChannel.WHATSAPP
            : CampaignChannel.SMS,
        status: CampaignStatus.SENT,
        message: dto.message,
        candidateIds: candidates.map((candidate) => candidate.id),
        candidateCount: candidates.length,
        sentCount: candidates.length,
        deliveredCount: 0,
      },
    });

    return {
      campaignId: campaign.id,
      sentCount: campaign.sentCount,
      queuedCount: campaign.sentCount,
    };
  }

  async results(id: string, user: TokenPayload) {
    this.ensureClinicUser(user);
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, clinicId: user.clinicId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    return {
      candidateCount: campaign.candidateCount,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      openedCount: campaign.openedCount ?? undefined,
      returnedPatientCount: campaign.returnedPatientCount,
      appointmentRequestCount: campaign.appointmentRequestCount,
    };
  }

  private async selectedCandidates(
    dto: LostPatientCampaignDto,
    user: TokenPayload,
  ) {
    if (!dto.candidateIds.length) {
      throw new BadRequestException('At least one candidate must be selected.');
    }

    const candidates = await this.analytics.lostPatients(user);
    const selected = candidates.filter((candidate) =>
      dto.candidateIds.includes(candidate.id),
    );

    if (selected.length !== dto.candidateIds.length) {
      throw new BadRequestException('One or more candidates are not valid.');
    }

    return selected;
  }

  private renderMessage(
    message: string,
    candidate?: { petName: string; ownerName?: string },
  ) {
    if (!candidate) {
      return message;
    }

    return message
      .replace(/\{\{\s*petName\s*\}\}/g, candidate.petName)
      .replace(/\{\{\s*ownerName\s*\}\}/g, candidate.ownerName ?? '');
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

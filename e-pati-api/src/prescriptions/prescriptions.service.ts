import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pet, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, user: TokenPayload) {
    this.ensureVeterinarian(user);
    const pet = await this.findPetForClinic(dto.petId, user);

    return this.prisma.$transaction(async (tx) => {
      const prescription = await tx.prescription.create({
        data: {
          petId: pet.id,
          clinicId: user.clinicId,
          veterinarianId: user.sub,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
          medications: {
            create: dto.medications,
          },
        },
        include: {
          medications: true,
          clinic: { select: { id: true, name: true } },
        },
      });

      await tx.notification.create({
        data: {
          ownerId: pet.ownerId,
          channel: 'PUSH',
          title: 'Yeni reçete',
          body: `${pet.name} için yeni reçete oluşturuldu.`,
          payload: { prescriptionId: prescription.id, petId: pet.id },
        },
      });

      return prescription;
    });
  }

  async findOne(id: string, user: TokenPayload) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      include: {
        medications: true,
        pet: true,
        clinic: { select: { id: true, name: true } },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found.');
    }

    this.ensureCanRead(prescription.pet, user);
    return prescription;
  }

  async getPdfUrl(id: string, user: TokenPayload) {
    const prescription = await this.findOne(id, user);

    return {
      prescriptionId: prescription.id,
      url: prescription.pdfUrl,
      status: prescription.pdfUrl ? 'ready' : 'pending_pdf_generation',
    };
  }

  private async findPetForClinic(
    petId: string,
    user: TokenPayload,
  ): Promise<Pet> {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }

    if (user.clinicId && pet.clinicId && pet.clinicId !== user.clinicId) {
      throw new ForbiddenException('This pet belongs to another clinic.');
    }

    return pet;
  }

  private ensureCanRead(pet: Pet, user: TokenPayload): void {
    if (user.role === Role.OWNER && pet.ownerId === user.sub) {
      return;
    }

    if (user.clinicId && pet.clinicId === user.clinicId) {
      return;
    }

    throw new ForbiddenException('You cannot access this prescription.');
  }

  private ensureVeterinarian(user: TokenPayload): void {
    if (user.role === Role.VETERINARIAN && user.clinicId) {
      return;
    }

    throw new ForbiddenException('Only veterinarians can perform this action.');
  }
}

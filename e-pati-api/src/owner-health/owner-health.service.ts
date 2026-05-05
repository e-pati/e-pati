import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDietPlanDto } from './dto/create-diet-plan.dto';
import { CreateWeightLogDto } from './dto/create-weight-log.dto';

@Injectable()
export class OwnerHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: TokenPayload) {
    this.ensureOwner(user);
    const [pets, weightLogs, dietPlans] = await Promise.all([
      this.prisma.pet.findMany({
        where: { ownerId: user.sub, deletedAt: null },
        orderBy: { name: 'asc' },
      }),
      this.prisma.weightLog.findMany({
        where: { ownerId: user.sub },
        include: { pet: { select: { name: true } } },
        orderBy: { loggedAt: 'desc' },
        take: 100,
      }),
      this.prisma.dietPlan.findMany({
        where: { ownerId: user.sub, isActive: true },
        include: { pet: { select: { name: true } } },
        orderBy: { startedAt: 'desc' },
      }),
    ]);

    return {
      pets,
      selectedPetHealthSummary: pets[0]
        ? {
            petId: pets[0].id,
            latestWeightKg: weightLogs.find((log) => log.petId === pets[0].id)
              ?.weightKg,
          }
        : undefined,
      weightLogs: weightLogs.map((log) => ({
        ...log,
        petName: log.pet.name,
      })),
      dietPlans: dietPlans.map((plan) => ({
        ...plan,
        petName: plan.pet.name,
      })),
      activeDietPlan: dietPlans[0],
    };
  }

  async createWeightLog(dto: CreateWeightLogDto, user: TokenPayload) {
    await this.ensureOwnsPet(dto.petId, user);
    const log = await this.prisma.weightLog.create({
      data: {
        ownerId: user.sub,
        petId: dto.petId,
        weightKg: dto.weightKg,
        bodyConditionScore: dto.bodyConditionScore,
        notes: dto.notes,
      },
      include: { pet: { select: { name: true } } },
    });

    return { ...log, petName: log.pet.name };
  }

  async createDietPlan(dto: CreateDietPlanDto, user: TokenPayload) {
    await this.ensureOwnsPet(dto.petId, user);
    await this.prisma.dietPlan.updateMany({
      where: { ownerId: user.sub, petId: dto.petId, isActive: true },
      data: { isActive: false },
    });
    const plan = await this.prisma.dietPlan.create({
      data: {
        ownerId: user.sub,
        petId: dto.petId,
        foodName: dto.foodName,
        dailyAmountGrams: dto.dailyAmountGrams,
        mealsPerDay: dto.mealsPerDay,
        notes: dto.notes,
      },
      include: { pet: { select: { name: true } } },
    });

    return { ...plan, petName: plan.pet.name };
  }

  private async ensureOwnsPet(petId: string, user: TokenPayload) {
    this.ensureOwner(user);
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, ownerId: user.sub, deletedAt: null },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found.');
    }
  }

  private ensureOwner(user: TokenPayload): void {
    if (user.role !== Role.OWNER) {
      throw new ForbiddenException('Owner access is required.');
    }
  }
}

import { ForbiddenException } from '@nestjs/common';
import { Examination, Pet, PetSex, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExaminationsService } from './examinations.service';

describe('ExaminationsService', () => {
  const createdAt = new Date('2026-07-31T10:00:00.000Z');
  const pet: Pet = {
    id: 'pet-1',
    ownerId: 'owner-1',
    clinicId: 'clinic-1',
    name: 'Misket',
    species: 'Cat',
    breed: null,
    sex: PetSex.UNKNOWN,
    birthDate: null,
    microchipNo: null,
    photoUrl: null,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
  const examination: Examination & {
    pet: Pet;
    clinic: { id: string; name: string };
    veterinarian: { id: string; fullName: string };
  } = {
    id: 'exam-1',
    petId: pet.id,
    clinicId: 'clinic-1',
    veterinarianId: 'vet-1',
    complaint: 'Kontrol',
    findings: 'Normal',
    assessment: 'Stabil',
    plan: 'Takip',
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    pet,
    clinic: { id: 'clinic-1', name: 'Demo Klinik' },
    veterinarian: { id: 'vet-1', fullName: 'Ayse Demir' },
  };

  type ExaminationFindManyArgs = {
    where: Record<string, unknown>;
    include: Record<string, unknown>;
    orderBy?: Record<string, string>;
    skip?: number;
    take?: number;
  };
  type ExaminationFindFirstArgs = {
    where: Record<string, unknown>;
    include: Record<string, unknown>;
  };

  const examinationFindMany = jest.fn<
    Promise<(typeof examination)[]>,
    [ExaminationFindManyArgs]
  >();
  const examinationCount = jest.fn<
    Promise<number>,
    [{ where: Record<string, unknown> }]
  >();
  const examinationFindFirst = jest.fn<
    Promise<typeof examination | null>,
    [ExaminationFindFirstArgs]
  >();
  const prisma = {
    examination: {
      findMany: examinationFindMany,
      count: examinationCount,
      findFirst: examinationFindFirst,
    },
  } as unknown as PrismaService;
  const notificationsService = {} as NotificationsService;
  const auditService = {
    record: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  function createService() {
    return new ExaminationsService(
      prisma,
      notificationsService,
      auditService as never,
    );
  }

  it('lists examinations with veterinarian contract fields', async () => {
    const service = createService();
    examinationFindMany.mockResolvedValue([examination]);
    examinationCount.mockResolvedValue(1);

    const result = await service.findAll(
      { page: 1, limit: 20, petId: pet.id },
      {
        sub: 'vet-1',
        email: 'vet@example.com',
        role: Role.VETERINARIAN,
        type: 'veterinarian',
        clinicId: 'clinic-1',
      },
    );

    const findManyArg = examinationFindMany.mock.calls[0][0];
    expect(findManyArg.include.veterinarian).toEqual({
      select: { id: true, fullName: true },
    });
    expect(findManyArg.where.petId).toBe(pet.id);
    expect(findManyArg.where.clinicId).toBe('clinic-1');
    expect(result.items[0]).toMatchObject({
      id: examination.id,
      date: createdAt,
      vet: { id: 'vet-1', fullName: 'Ayse Demir', title: 'Dr.' },
    });
  });

  it('returns examination details with veterinarian alias', async () => {
    const service = createService();
    examinationFindFirst.mockResolvedValue(examination);

    const result = await service.findOne(examination.id, {
      sub: 'owner-1',
      email: 'owner@example.com',
      role: Role.OWNER,
      type: 'owner',
    });

    expect(result).toMatchObject({
      id: examination.id,
      vet: { id: 'vet-1', fullName: 'Ayse Demir', title: 'Dr.' },
    });
  });

  it('rejects another clinic reading examination details', async () => {
    const service = createService();
    examinationFindFirst.mockResolvedValue(examination);

    await expect(
      service.findOne(examination.id, {
        sub: 'vet-2',
        email: 'other@example.com',
        role: Role.VETERINARIAN,
        type: 'veterinarian',
        clinicId: 'clinic-2',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

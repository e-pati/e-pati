import {
  AdoptionListingStatus,
  AnimalClass,
  AnimalStatus,
  MunicipalityCaseStatus,
  MovementReason,
  PremiseType,
  Role,
  SterilizationStatus,
} from '@prisma/client';
import { MunicipalityService } from './municipality.service';

describe('MunicipalityService', () => {
  const prisma = {
    animal: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    premise: {
      findFirst: jest.fn(),
    },
    animalMovement: {
      create: jest.fn(),
    },
    municipalityAnimalCase: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    sterilizationRecord: {
      create: jest.fn(),
    },
    adoptionListing: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const auditService = {
    record: jest.fn(),
  };

  const clinicUser = {
    sub: 'vet-1',
    email: 'vet@example.com',
    role: Role.VETERINARIAN,
    type: 'veterinarian' as const,
    clinicId: 'clinic-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  it('opens a clinic scoped municipality intake case and records shelter intake movement', async () => {
    prisma.animal.findFirst.mockResolvedValue({
      id: 'animal-1',
      currentPremiseId: 'street-area',
    });
    prisma.premise.findFirst.mockResolvedValue({ id: 'shelter-1' });
    prisma.municipalityAnimalCase.create.mockResolvedValue({ id: 'case-1' });
    const service = new MunicipalityService(
      prisma as never,
      auditService as never,
    );

    await service.createCase(
      {
        animalId: 'animal-1',
        shelterPremiseId: 'shelter-1',
        municipalityName: 'Cankaya Belediyesi',
        intakeAt: '2026-07-31T10:00:00.000Z',
        foundProvince: 'Ankara',
        foundDistrict: 'Cankaya',
      },
      clinicUser,
    );

    expect(prisma.animal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'animal-1',
          class: AnimalClass.STRAY,
          OR: [
            { clinicId: 'clinic-1' },
            { currentPremise: { clinicId: 'clinic-1' } },
          ],
        }),
      }),
    );
    expect(prisma.premise.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'shelter-1',
          type: PremiseType.SHELTER,
          clinicId: 'clinic-1',
        }),
      }),
    );
    expect(prisma.animalMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          animalId: 'animal-1',
          fromPremiseId: 'street-area',
          toPremiseId: 'shelter-1',
          reason: MovementReason.SHELTER_INTAKE,
        }),
      }),
    );
    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'municipality.case.create',
        resourceType: 'MunicipalityAnimalCase',
        resourceId: 'case-1',
      }),
    );
  });

  it('marks the case sterilized when a completed sterilization is recorded', async () => {
    prisma.municipalityAnimalCase.findFirst.mockResolvedValue({ id: 'case-1' });
    prisma.sterilizationRecord.create.mockResolvedValue({ id: 'ster-1' });
    const service = new MunicipalityService(
      prisma as never,
      auditService as never,
    );

    await service.createSterilization(
      'case-1',
      {
        performedAt: '2026-07-31T11:00:00.000Z',
        veterinarianName: 'Dr. Ayse Demir',
        status: SterilizationStatus.COMPLETED,
      },
      clinicUser,
    );

    expect(prisma.municipalityAnimalCase.update).toHaveBeenCalledWith({
      where: { id: 'case-1' },
      data: { status: MunicipalityCaseStatus.STERILIZED },
    });
    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'municipality.sterilization.create',
        resourceType: 'SterilizationRecord',
        resourceId: 'ster-1',
      }),
    );
  });

  it('marks adopted listing, case and animal together', async () => {
    prisma.adoptionListing.findFirst.mockResolvedValue({
      id: 'listing-1',
      publishedAt: new Date('2026-07-31T12:00:00.000Z'),
      adoptedAt: null,
      case: {
        id: 'case-1',
        animalId: 'animal-1',
      },
    });
    prisma.adoptionListing.update.mockResolvedValue({ id: 'listing-1' });
    const service = new MunicipalityService(
      prisma as never,
      auditService as never,
    );

    await service.updateAdoptionListingStatus(
      'listing-1',
      { status: AdoptionListingStatus.ADOPTED },
      clinicUser,
    );

    expect(prisma.municipalityAnimalCase.update).toHaveBeenCalledWith({
      where: { id: 'case-1' },
      data: { status: MunicipalityCaseStatus.ADOPTED },
    });
    expect(prisma.animal.update).toHaveBeenCalledWith({
      where: { id: 'animal-1' },
      data: { status: AnimalStatus.ADOPTED },
    });
    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'municipality.adoptionListing.status.update',
        resourceType: 'AdoptionListing',
        resourceId: 'listing-1',
      }),
    );
  });
});

import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Pet, PetSex, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  const pet: Pet = {
    id: 'pet-1',
    ownerId: 'owner-1',
    clinicId: null,
    name: 'Misket',
    species: 'Cat',
    breed: null,
    sex: PetSex.UNKNOWN,
    birthDate: null,
    microchipNo: null,
    photoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  function createService(findFirstResult: Pet | null) {
    const petCreate = jest.fn<
      Promise<Pet>,
      [{ data: Record<string, unknown> }]
    >();
    const petUpdate = jest.fn<
      Promise<Pet>,
      [{ where: { id: string }; data: Record<string, unknown> }]
    >();
    const ownerFindFirst = jest.fn();
    const ownerCreate = jest.fn<
      Promise<{ id: string }>,
      [{ data: Record<string, unknown>; select: { id: true } }]
    >();
    const prisma = {
      pet: {
        findFirst: jest.fn().mockResolvedValue(findFirstResult),
        create: petCreate,
        update: petUpdate,
      },
      owner: {
        findFirst: ownerFindFirst,
        create: ownerCreate,
      },
    } as unknown as PrismaService;

    return {
      service: new PetsService(prisma, new JwtService(), new ConfigService()),
      prisma,
      petCreate,
      petUpdate,
      ownerFindFirst,
      ownerCreate,
    };
  }

  it('allows an owner to read their own pet', async () => {
    const { service } = createService(pet);

    await expect(
      service.findOne(pet.id, {
        sub: pet.ownerId,
        email: 'owner@example.com',
        role: Role.OWNER,
        type: 'owner',
      }),
    ).resolves.toEqual(pet);
  });

  it('rejects an owner reading another owner pet', async () => {
    const { service } = createService(pet);

    await expect(
      service.findOne(pet.id, {
        sub: 'owner-2',
        email: 'other@example.com',
        role: Role.OWNER,
        type: 'owner',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows clinic staff to create a pet for their clinic', async () => {
    const { service, petCreate, ownerCreate } = createService(null);
    let createArgs: { data: Record<string, unknown> } | undefined;
    ownerCreate.mockResolvedValue({ id: 'generated-owner-1' });
    petCreate.mockImplementation((args) => {
      createArgs = args;
      return Promise.resolve({
        ...pet,
        ownerId: 'generated-owner-1',
        clinicId: 'clinic-1',
      });
    });

    await expect(
      service.create(
        {
          sub: 'vet-1',
          email: 'vet@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
          clinicId: 'clinic-1',
        },
        {
          name: 'Misket',
          species: 'Cat',
        },
      ),
    ).resolves.toMatchObject({
      ownerId: 'generated-owner-1',
      clinicId: 'clinic-1',
    });
    if (!createArgs) {
      throw new Error('Pet create was not called.');
    }

    expect(createArgs.data.ownerId).toBe('generated-owner-1');
    expect(createArgs.data.clinicId).toBe('clinic-1');
  });

  it('allows clinic staff to update a pet in their clinic', async () => {
    const clinicPet = { ...pet, clinicId: 'clinic-1' };
    const { service, petUpdate } = createService(clinicPet);
    petUpdate.mockResolvedValue({ ...clinicPet, name: 'Misket Jr.' });

    await expect(
      service.update(
        clinicPet.id,
        {
          sub: 'vet-1',
          email: 'vet@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
          clinicId: 'clinic-1',
        },
        { name: 'Misket Jr.' },
      ),
    ).resolves.toMatchObject({ name: 'Misket Jr.' });
  });

  it('rejects clinic staff updating another clinic pet', async () => {
    const clinicPet = { ...pet, clinicId: 'clinic-1' };
    const { service } = createService(clinicPet);

    await expect(
      service.update(
        clinicPet.id,
        {
          sub: 'vet-2',
          email: 'other@example.com',
          role: Role.VETERINARIAN,
          type: 'veterinarian',
          clinicId: 'clinic-2',
        },
        { name: 'Blocked' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

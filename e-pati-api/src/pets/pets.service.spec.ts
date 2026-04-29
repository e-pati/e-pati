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
    const prisma = {
      pet: {
        findFirst: jest.fn().mockResolvedValue(findFirstResult),
      },
    } as unknown as PrismaService;

    return new PetsService(prisma, new JwtService(), new ConfigService());
  }

  it('allows an owner to read their own pet', async () => {
    const service = createService(pet);

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
    const service = createService(pet);

    await expect(
      service.findOne(pet.id, {
        sub: 'owner-2',
        email: 'other@example.com',
        role: Role.OWNER,
        type: 'owner',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

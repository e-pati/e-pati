import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AnimalClass,
  AnimalIdentifierType,
  AnimalSex,
  MovementReason,
  NotificationChannel,
  NotificationStatus,
  PetSex,
  PremiseType,
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const ids = {
  clinic: 'seed-clinic-ankara-pati',
  veterinarian: 'seed-vet-ayse-demir',
  owner: 'seed-owner-burak-yilmaz',
  pet: 'seed-pet-misket',
  examination: 'seed-exam-misket-2026-04-30',
  vaccination: 'seed-vaccine-misket-rabies',
  prescription: 'seed-prescription-misket',
  medication: 'seed-medication-misket-amoxicillin',
  labResult: 'seed-lab-misket-blood-panel',
  notification: 'seed-notification-vaccine-reminder',
  auditLog: 'seed-audit-log-demo',
  cattlePremise: 'seed-premise-cankaya-farm',
  shelterPremise: 'seed-premise-cankaya-shelter',
  cattleAnimal: 'seed-animal-cow-001',
  strayAnimal: 'seed-animal-stray-dog-001',
  cattleMovement: 'seed-movement-cow-birth',
  strayMovement: 'seed-movement-shelter-intake',
};

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass123', 12);
  const now = new Date('2026-04-30T09:00:00.000Z');
  const nextYear = new Date('2027-04-30T09:00:00.000Z');

  await prisma.clinic.upsert({
    where: { id: ids.clinic },
    update: {
      name: 'Ankara Pati Veteriner Klinigi',
      email: 'klinik@example.com',
      phone: '+903121112233',
      address: 'Cankaya, Ankara',
      isApproved: true,
      deletedAt: null,
    },
    create: {
      id: ids.clinic,
      name: 'Ankara Pati Veteriner Klinigi',
      email: 'klinik@example.com',
      phone: '+903121112233',
      address: 'Cankaya, Ankara',
      isApproved: true,
    },
  });

  await prisma.veterinarian.upsert({
    where: { id: ids.veterinarian },
    update: {
      clinicId: ids.clinic,
      email: 'vet@example.com',
      phone: '+905551110001',
      passwordHash,
      fullName: 'Dr. Ayse Demir',
      licenseNumber: 'VET-ANK-0001',
      role: Role.VETERINARIAN,
      deletedAt: null,
    },
    create: {
      id: ids.veterinarian,
      clinicId: ids.clinic,
      email: 'vet@example.com',
      phone: '+905551110001',
      passwordHash,
      fullName: 'Dr. Ayse Demir',
      licenseNumber: 'VET-ANK-0001',
      role: Role.VETERINARIAN,
    },
  });

  await prisma.owner.upsert({
    where: { id: ids.owner },
    update: {
      email: 'sahip@example.com',
      phone: '+905551112233',
      passwordHash,
      fullName: 'Burak Yilmaz',
      role: Role.OWNER,
      emailVerifiedAt: now,
      deletedAt: null,
    },
    create: {
      id: ids.owner,
      email: 'sahip@example.com',
      phone: '+905551112233',
      passwordHash,
      fullName: 'Burak Yilmaz',
      role: Role.OWNER,
      emailVerifiedAt: now,
    },
  });

  await prisma.pet.upsert({
    where: { id: ids.pet },
    update: {
      ownerId: ids.owner,
      clinicId: ids.clinic,
      name: 'Misket',
      species: 'Cat',
      breed: 'British Shorthair',
      sex: PetSex.FEMALE,
      birthDate: new Date('2021-04-12T00:00:00.000Z'),
      microchipNo: '900182000123456',
      photoUrl: 'https://example.com/pets/misket.jpg',
      deletedAt: null,
    },
    create: {
      id: ids.pet,
      ownerId: ids.owner,
      clinicId: ids.clinic,
      name: 'Misket',
      species: 'Cat',
      breed: 'British Shorthair',
      sex: PetSex.FEMALE,
      birthDate: new Date('2021-04-12T00:00:00.000Z'),
      microchipNo: '900182000123456',
      photoUrl: 'https://example.com/pets/misket.jpg',
    },
  });

  await prisma.examination.upsert({
    where: { id: ids.examination },
    update: {
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      complaint: 'Appetite loss and fatigue',
      findings: 'Mild dehydration, normal temperature',
      assessment: 'Suspected gastrointestinal irritation',
      plan: 'Diet change and follow-up in 3 days',
      deletedAt: null,
    },
    create: {
      id: ids.examination,
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      complaint: 'Appetite loss and fatigue',
      findings: 'Mild dehydration, normal temperature',
      assessment: 'Suspected gastrointestinal irritation',
      plan: 'Diet change and follow-up in 3 days',
    },
  });

  await prisma.vaccination.upsert({
    where: { id: ids.vaccination },
    update: {
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      name: 'Rabies',
      lotNumber: 'LOT-2026-TR',
      appliedAt: now,
      dueAt: nextYear,
      notes: 'Annual rabies vaccination completed.',
      deletedAt: null,
    },
    create: {
      id: ids.vaccination,
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      name: 'Rabies',
      lotNumber: 'LOT-2026-TR',
      appliedAt: now,
      dueAt: nextYear,
      notes: 'Annual rabies vaccination completed.',
    },
  });

  await prisma.prescription.upsert({
    where: { id: ids.prescription },
    update: {
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      diagnosis: 'Upper respiratory infection',
      notes: 'Give medication after meals.',
      deletedAt: null,
    },
    create: {
      id: ids.prescription,
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      diagnosis: 'Upper respiratory infection',
      notes: 'Give medication after meals.',
    },
  });

  await prisma.medication.upsert({
    where: { id: ids.medication },
    update: {
      prescriptionId: ids.prescription,
      name: 'Amoxicillin',
      dose: '50mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Give after meals.',
    },
    create: {
      id: ids.medication,
      prescriptionId: ids.prescription,
      name: 'Amoxicillin',
      dose: '50mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Give after meals.',
    },
  });

  await prisma.labResult.upsert({
    where: { id: ids.labResult },
    update: {
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      title: 'Blood panel',
      fileUrl: 'https://example.com/lab-results/misket-blood-panel.pdf',
      mimeType: 'application/pdf',
      notes: 'Values are within expected range.',
      collectedAt: now,
      deletedAt: null,
    },
    create: {
      id: ids.labResult,
      petId: ids.pet,
      clinicId: ids.clinic,
      veterinarianId: ids.veterinarian,
      title: 'Blood panel',
      fileUrl: 'https://example.com/lab-results/misket-blood-panel.pdf',
      mimeType: 'application/pdf',
      notes: 'Values are within expected range.',
      collectedAt: now,
    },
  });

  await prisma.notification.upsert({
    where: { id: ids.notification },
    update: {
      ownerId: ids.owner,
      channel: NotificationChannel.PUSH,
      status: NotificationStatus.SENT,
      title: 'Misket icin asi hatirlatmasi',
      body: 'Kuduz asisinin bir sonraki dozu yaklasiyor.',
      payload: { petId: ids.pet, vaccinationId: ids.vaccination },
      scheduledAt: nextYear,
      sentAt: now,
      readAt: null,
    },
    create: {
      id: ids.notification,
      ownerId: ids.owner,
      channel: NotificationChannel.PUSH,
      status: NotificationStatus.SENT,
      title: 'Misket icin asi hatirlatmasi',
      body: 'Kuduz asisinin bir sonraki dozu yaklasiyor.',
      payload: { petId: ids.pet, vaccinationId: ids.vaccination },
      scheduledAt: nextYear,
      sentAt: now,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: ids.auditLog },
    update: {
      veterinarianId: ids.veterinarian,
      action: 'seed.demo_data_created',
      resourceType: 'Pet',
      resourceId: ids.pet,
      metadata: { source: 'prisma/seed.ts' },
    },
    create: {
      id: ids.auditLog,
      veterinarianId: ids.veterinarian,
      action: 'seed.demo_data_created',
      resourceType: 'Pet',
      resourceId: ids.pet,
      metadata: { source: 'prisma/seed.ts' },
    },
  });

  await prisma.premise.upsert({
    where: { id: ids.cattlePremise },
    update: {
      type: PremiseType.FARM,
      name: 'Cankaya Demo Isletmesi',
      ownerId: ids.owner,
      province: 'Ankara',
      district: 'Cankaya',
      neighborhood: 'Alacaatli',
      address: 'Demo uretici isletmesi',
      ministryCode: 'TR-06-CNK-0001',
      capacity: 120,
      deletedAt: null,
    },
    create: {
      id: ids.cattlePremise,
      type: PremiseType.FARM,
      name: 'Cankaya Demo Isletmesi',
      ownerId: ids.owner,
      province: 'Ankara',
      district: 'Cankaya',
      neighborhood: 'Alacaatli',
      address: 'Demo uretici isletmesi',
      ministryCode: 'TR-06-CNK-0001',
      capacity: 120,
    },
  });

  await prisma.premise.upsert({
    where: { id: ids.shelterPremise },
    update: {
      type: PremiseType.SHELTER,
      name: 'Cankaya Belediyesi Gecici Bakimevi',
      clinicId: ids.clinic,
      province: 'Ankara',
      district: 'Cankaya',
      neighborhood: 'Mimar Sinan',
      address: 'Demo belediye bakimevi',
      ministryCode: 'TR-06-CNK-SHL-001',
      capacity: 450,
      deletedAt: null,
    },
    create: {
      id: ids.shelterPremise,
      type: PremiseType.SHELTER,
      name: 'Cankaya Belediyesi Gecici Bakimevi',
      clinicId: ids.clinic,
      province: 'Ankara',
      district: 'Cankaya',
      neighborhood: 'Mimar Sinan',
      address: 'Demo belediye bakimevi',
      ministryCode: 'TR-06-CNK-SHL-001',
      capacity: 450,
    },
  });

  await prisma.animal.upsert({
    where: { id: ids.cattleAnimal },
    update: {
      hkn: 'HKN-2026-0000000001',
      class: AnimalClass.CATTLE,
      species: 'Cattle',
      breed: 'Holstein',
      name: 'Anka-001',
      sex: AnimalSex.FEMALE,
      birthDate: new Date('2025-02-15T00:00:00.000Z'),
      birthPlace: 'Ankara / Cankaya',
      ownerId: ids.owner,
      currentPremiseId: ids.cattlePremise,
      deletedAt: null,
    },
    create: {
      id: ids.cattleAnimal,
      hkn: 'HKN-2026-0000000001',
      class: AnimalClass.CATTLE,
      species: 'Cattle',
      breed: 'Holstein',
      name: 'Anka-001',
      sex: AnimalSex.FEMALE,
      birthDate: new Date('2025-02-15T00:00:00.000Z'),
      birthPlace: 'Ankara / Cankaya',
      ownerId: ids.owner,
      currentPremiseId: ids.cattlePremise,
    },
  });

  await prisma.animalIdentifier.upsert({
    where: {
      type_value: {
        type: AnimalIdentifierType.HKN,
        value: 'HKN-2026-0000000001',
      },
    },
    update: { animalId: ids.cattleAnimal, isPrimary: true },
    create: {
      animalId: ids.cattleAnimal,
      type: AnimalIdentifierType.HKN,
      value: 'HKN-2026-0000000001',
      issuedBy: 'VetCep Registry',
      issuedAt: now,
      isPrimary: true,
    },
  });

  await prisma.animalIdentifier.upsert({
    where: {
      type_value: {
        type: AnimalIdentifierType.EAR_TAG,
        value: 'TR060000000001',
      },
    },
    update: { animalId: ids.cattleAnimal },
    create: {
      animalId: ids.cattleAnimal,
      type: AnimalIdentifierType.EAR_TAG,
      value: 'TR060000000001',
      issuedBy: 'Demo HAYBIS',
      issuedAt: now,
    },
  });

  await prisma.animal.upsert({
    where: { id: ids.strayAnimal },
    update: {
      hkn: 'HKN-2026-STRAY-0001',
      class: AnimalClass.STRAY,
      species: 'Dog',
      breed: 'Mixed',
      name: 'Tarcin',
      sex: AnimalSex.MALE,
      birthDate: new Date('2023-08-01T00:00:00.000Z'),
      color: 'Brown',
      clinicId: ids.clinic,
      currentPremiseId: ids.shelterPremise,
      deletedAt: null,
    },
    create: {
      id: ids.strayAnimal,
      hkn: 'HKN-2026-STRAY-0001',
      class: AnimalClass.STRAY,
      species: 'Dog',
      breed: 'Mixed',
      name: 'Tarcin',
      sex: AnimalSex.MALE,
      birthDate: new Date('2023-08-01T00:00:00.000Z'),
      color: 'Brown',
      clinicId: ids.clinic,
      currentPremiseId: ids.shelterPremise,
    },
  });

  await prisma.animalIdentifier.upsert({
    where: {
      type_value: {
        type: AnimalIdentifierType.HKN,
        value: 'HKN-2026-STRAY-0001',
      },
    },
    update: { animalId: ids.strayAnimal, isPrimary: true },
    create: {
      animalId: ids.strayAnimal,
      type: AnimalIdentifierType.HKN,
      value: 'HKN-2026-STRAY-0001',
      issuedBy: 'VetCep Registry',
      issuedAt: now,
      isPrimary: true,
    },
  });

  await prisma.animalIdentifier.upsert({
    where: {
      type_value: {
        type: AnimalIdentifierType.MICROCHIP,
        value: '900182000654321',
      },
    },
    update: { animalId: ids.strayAnimal },
    create: {
      animalId: ids.strayAnimal,
      type: AnimalIdentifierType.MICROCHIP,
      value: '900182000654321',
      issuedBy: 'Demo PETVET',
      issuedAt: now,
    },
  });

  await prisma.animalMovement.upsert({
    where: { id: ids.cattleMovement },
    update: {
      animalId: ids.cattleAnimal,
      toPremiseId: ids.cattlePremise,
      reason: MovementReason.BIRTH,
      occurredAt: new Date('2025-02-15T00:00:00.000Z'),
      notes: 'Demo birth registration.',
    },
    create: {
      id: ids.cattleMovement,
      animalId: ids.cattleAnimal,
      toPremiseId: ids.cattlePremise,
      reason: MovementReason.BIRTH,
      occurredAt: new Date('2025-02-15T00:00:00.000Z'),
      notes: 'Demo birth registration.',
    },
  });

  await prisma.animalMovement.upsert({
    where: { id: ids.strayMovement },
    update: {
      animalId: ids.strayAnimal,
      toPremiseId: ids.shelterPremise,
      reason: MovementReason.SHELTER_INTAKE,
      occurredAt: new Date('2026-04-29T10:30:00.000Z'),
      notes: 'Citizen report followed by municipal intake.',
    },
    create: {
      id: ids.strayMovement,
      animalId: ids.strayAnimal,
      toPremiseId: ids.shelterPremise,
      reason: MovementReason.SHELTER_INTAKE,
      occurredAt: new Date('2026-04-29T10:30:00.000Z'),
      notes: 'Citizen report followed by municipal intake.',
    },
  });

  console.log('Seed completed.');
  console.log('Owner login: sahip@example.com / DemoPass123');
  console.log('Clinic login: vet@example.com / DemoPass123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

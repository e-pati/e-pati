import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  NotificationChannel,
  NotificationStatus,
  PetSex,
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

import { AppointmentStatus, Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const startsAt = new Date('2026-08-03T09:00:00.000Z');
  const appointment = {
    id: 'appointment-1',
    petId: 'pet-1',
    ownerId: 'owner-1',
    clinicId: 'clinic-1',
    veterinarianId: 'vet-1',
    startsAt,
    requestedDate: null,
    requestedTime: null,
    durationMinutes: 30,
    status: AppointmentStatus.CONFIRMED,
    reason: 'Kontrol',
    notes: null,
    notifyOwner: true,
    deletedAt: null,
    createdAt: startsAt,
    updatedAt: startsAt,
    pet: {
      id: 'pet-1',
      name: 'Misket',
      species: 'Cat',
      breed: null,
      owner: {
        id: 'owner-1',
        fullName: 'Erol Tabakoglu',
        email: 'owner@example.com',
        phone: null,
      },
    },
    clinic: {
      id: 'clinic-1',
      name: 'Demo Klinik',
      phone: null,
      address: null,
      city: 'Ankara',
      district: 'Cankaya',
    },
    veterinarian: {
      id: 'vet-1',
      fullName: 'Ayse Demir',
      email: 'vet@example.com',
    },
  };
  const prisma = {
    pet: {
      findFirst: jest.fn(),
    },
    veterinarian: {
      count: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const notifications = {
    createOwnerNotification: jest.fn(),
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
  const ownerUser = {
    sub: 'owner-1',
    email: 'owner@example.com',
    role: Role.OWNER,
    type: 'owner' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.pet.findFirst.mockResolvedValue({
      id: 'pet-1',
      ownerId: 'owner-1',
      clinicId: 'clinic-1',
    });
    prisma.veterinarian.count.mockResolvedValue(1);
    prisma.appointment.create.mockResolvedValue(appointment);
    prisma.appointment.findFirst.mockResolvedValue(appointment);
    prisma.appointment.update.mockResolvedValue(appointment);
    notifications.createOwnerNotification.mockResolvedValue({ id: 'notif-1' });
    auditService.record.mockResolvedValue({ id: 'audit-1' });
  });

  function createService() {
    return new AppointmentsService(
      prisma as never,
      notifications as never,
      auditService as never,
    );
  }

  it('records audit log when a clinic creates an appointment', async () => {
    const service = createService();

    await service.create(
      {
        petId: 'pet-1',
        startsAt: startsAt.toISOString(),
        durationMinutes: 30,
        veterinarianId: 'vet-1',
        reason: 'Kontrol',
      },
      clinicUser,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'appointment.create',
        resourceType: 'Appointment',
        resourceId: 'appointment-1',
        metadata: expect.objectContaining({
          petId: 'pet-1',
          clinicId: 'clinic-1',
          veterinarianId: 'vet-1',
          status: AppointmentStatus.CONFIRMED,
        }),
      }),
    );
  });

  it('records audit log when a clinic updates appointment status', async () => {
    const service = createService();
    prisma.appointment.findFirst.mockResolvedValue({
      ...appointment,
      status: AppointmentStatus.CONFIRMED,
    });
    prisma.appointment.update.mockResolvedValue({
      ...appointment,
      status: AppointmentStatus.CANCELLED,
    });

    await service.update(
      'appointment-1',
      { status: 'cancelled', notes: 'Hasta sahibi erteledi' },
      clinicUser,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'appointment.update',
        resourceType: 'Appointment',
        resourceId: 'appointment-1',
        metadata: expect.objectContaining({
          previousStatus: AppointmentStatus.CONFIRMED,
          newStatus: AppointmentStatus.CANCELLED,
          changedFields: ['status', 'notes'],
        }),
      }),
    );
  });

  it('records audit log when a pending appointment is confirmed', async () => {
    const service = createService();
    prisma.appointment.findFirst.mockResolvedValue({
      ...appointment,
      status: AppointmentStatus.PENDING,
    });

    await service.confirm('appointment-1', clinicUser);

    expect(auditService.record).toHaveBeenCalledWith(
      clinicUser,
      expect.objectContaining({
        action: 'appointment.confirm',
        resourceType: 'Appointment',
        resourceId: 'appointment-1',
        metadata: expect.objectContaining({
          previousStatus: AppointmentStatus.PENDING,
          newStatus: AppointmentStatus.CONFIRMED,
        }),
      }),
    );
  });

  it('records audit log when an owner requests an appointment', async () => {
    const service = createService();
    prisma.appointment.create.mockResolvedValue({
      ...appointment,
      veterinarianId: null,
      status: AppointmentStatus.PENDING,
    });

    await service.request(
      {
        petId: 'pet-1',
        preferredDate: '2026-08-03',
        preferredTime: '09:00',
        reason: 'Kontrol',
      },
      ownerUser,
    );

    expect(auditService.record).toHaveBeenCalledWith(
      ownerUser,
      expect.objectContaining({
        action: 'appointment.request',
        resourceType: 'Appointment',
        resourceId: 'appointment-1',
        metadata: expect.objectContaining({
          preferredDate: '2026-08-03',
          preferredTime: '09:00',
          status: AppointmentStatus.PENDING,
        }),
      }),
    );
  });
});

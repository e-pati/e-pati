import type { Pet, Examination, Vaccination, Prescription, LabResult, AppNotification } from '@/types'

export const mockPets: Pet[] = [
  {
    id: '1',
    ownerId: 'o1',
    name: 'Pamuk',
    species: 'cat',
    breed: 'Van Kedisi',
    gender: 'female',
    birthDate: '2021-03-15',
    microchipNo: '941000024681357',
    weight: 4.2,
  },
  {
    id: '2',
    ownerId: 'o1',
    name: 'Karabaş',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    birthDate: '2020-07-22',
    weight: 32.5,
  },
]

export const mockExaminations: Examination[] = [
  {
    id: 'e1',
    petId: '1',
    vetName: 'Dr. Selin Yılmaz',
    date: '2026-04-20',
    complaint: 'İştahsızlık ve letarji',
    findings: 'Ağırlık 4.0 kg, ateş 39.8°C, karın palpasyonunda hassasiyet',
    assessment: 'Gastroenterit şüphesi',
    plan: 'Probiyotik ve mide koruyucu başlandı',
    followUpDate: '2026-04-23',
  },
  {
    id: 'e2',
    petId: '1',
    vetName: 'Dr. Selin Yılmaz',
    date: '2026-01-15',
    complaint: 'Yıllık kontrol',
    findings: 'Genel durum iyi',
    assessment: 'Sağlıklı',
    plan: 'Rutin aşılar yapıldı',
  },
]

export const mockVaccinations: Vaccination[] = [
  { id: 'v1', petId: '1', vaccineName: 'Kuduz', appliedDate: '2026-01-15', nextDate: '2027-01-15', manufacturer: 'Nobivac' },
  { id: 'v2', petId: '1', vaccineName: 'Karma (FVRCP)', appliedDate: '2026-01-15', nextDate: '2027-01-15', manufacturer: 'Purevax' },
  { id: 'v3', petId: '2', vaccineName: 'Kuduz', appliedDate: '2025-11-10', nextDate: '2026-05-10', manufacturer: 'Nobivac' },
  { id: 'v4', petId: '2', vaccineName: 'Karma (DHPPiL)', appliedDate: '2025-11-10', nextDate: '2026-11-10', manufacturer: 'Eurican' },
]

export const mockPrescriptions: Prescription[] = [
  {
    id: 'p1',
    petId: '1',
    vetName: 'Dr. Selin Yılmaz',
    date: '2026-04-20',
    medications: [
      { id: 'm1', drugName: 'Metronidazol 250mg', dose: '1/4 tablet', frequency: '2x1', duration: '5 gün', instructions: 'Yemekle' },
      { id: 'm2', drugName: 'Synbiotic DC (Probiyotik)', dose: '1 saşe', frequency: '1x1', duration: '10 gün' },
    ],
  },
]

export const mockLabResults: LabResult[] = [
  { id: 'l1', petId: '1', testType: 'Tam Kan Sayımı', date: '2026-04-20', comment: 'Hafif lökositoz — enfeksiyonla uyumlu' },
]

export const mockNotifications: AppNotification[] = [
  { id: 'n1', type: 'examination', title: 'Muayene Kaydedildi', message: "Pamuk'un muayene notları eklendi", petName: 'Pamuk', sentAt: '2026-04-20T14:30:00', isRead: false },
  { id: 'n2', type: 'vaccination', title: 'Aşı Hatırlatması', message: "Karabaş'ın kuduz aşısı 10 gün içinde yapılmalı", petName: 'Karabaş', sentAt: '2026-04-28T09:00:00', isRead: false },
  { id: 'n3', type: 'prescription', title: 'Yeni Reçete', message: "Pamuk için reçete oluşturuldu", petName: 'Pamuk', sentAt: '2026-04-20T14:31:00', isRead: true },
]

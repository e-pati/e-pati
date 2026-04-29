import type { Pet, Examination, Vaccination, Prescription, LabResult, DashboardStats } from '@/types'

export const mockPets: Pet[] = [
  {
    id: '1',
    ownerId: 'o1',
    owner: { id: 'o1', firstName: 'Ayşe', lastName: 'Kaya', phone: '0532 111 2233', email: 'ayse@mail.com' },
    name: 'Pamuk',
    species: 'cat',
    breed: 'Van Kedisi',
    gender: 'female',
    birthDate: '2021-03-15',
    microchipNo: '941000024681357',
    weight: 4.2,
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    ownerId: 'o2',
    owner: { id: 'o2', firstName: 'Mehmet', lastName: 'Demir', phone: '0533 222 3344', email: 'mehmet@mail.com' },
    name: 'Karabaş',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    birthDate: '2020-07-22',
    microchipNo: '941000024681358',
    weight: 32.5,
    createdAt: '2022-08-05',
  },
  {
    id: '3',
    ownerId: 'o3',
    owner: { id: 'o3', firstName: 'Zeynep', lastName: 'Arslan', phone: '0541 333 4455', email: 'zeynep@mail.com' },
    name: 'Boncuk',
    species: 'dog',
    breed: 'Labrador',
    gender: 'female',
    birthDate: '2022-01-10',
    weight: 28.0,
    createdAt: '2023-03-20',
  },
  {
    id: '4',
    ownerId: 'o4',
    owner: { id: 'o4', firstName: 'Ali', lastName: 'Yıldız', phone: '0542 444 5566', email: 'ali@mail.com' },
    name: 'Minnoş',
    species: 'cat',
    breed: 'British Shorthair',
    gender: 'male',
    birthDate: '2023-05-01',
    weight: 5.1,
    createdAt: '2024-01-15',
  },
  {
    id: '5',
    ownerId: 'o5',
    owner: { id: 'o5', firstName: 'Fatma', lastName: 'Çelik', phone: '0543 555 6677', email: 'fatma@mail.com' },
    name: 'Pamukkale',
    species: 'rabbit',
    breed: 'Hollanda Tavşanı',
    gender: 'female',
    birthDate: '2023-09-12',
    weight: 1.8,
    createdAt: '2024-02-01',
  },
]

export const mockExaminations: Examination[] = [
  {
    id: 'e1',
    petId: '1',
    vetId: 'v1',
    vet: { id: 'v1', clinicId: 'c1', firstName: 'Selin', lastName: 'Yılmaz', title: 'Dr.', licenseNo: 'VET-001' },
    date: '2026-04-20',
    complaint: 'İştahsızlık ve letarji, 2 gündür yemek yemek istemiyor.',
    findings: 'Ağırlık: 4.0 kg. Dehidrasyon yok. Karın palpasyonunda hafif hassasiyet. Ateş: 39.8°C.',
    assessment: 'Gastroenterit şüphesi. Stres kaynaklı iştahsızlık dışlanamaz.',
    plan: 'Probiyotik ve mide koruyucu başlandı. 3 gün sonra kontrol önerildi.',
    followUpDate: '2026-04-23',
    createdAt: '2026-04-20',
  },
  {
    id: 'e2',
    petId: '1',
    vetId: 'v1',
    vet: { id: 'v1', clinicId: 'c1', firstName: 'Selin', lastName: 'Yılmaz', title: 'Dr.', licenseNo: 'VET-001' },
    date: '2026-01-15',
    complaint: 'Yıllık kontrol muayenesi.',
    findings: 'Genel durum iyi. Diş eti sağlığı normal. Kulak temiz.',
    assessment: 'Sağlıklı. Aşı takvimi güncel.',
    plan: 'Rutin aşılar yapıldı. 1 yıl sonra tekrar çağrılacak.',
    createdAt: '2026-01-15',
  },
  {
    id: 'e3',
    petId: '2',
    vetId: 'v1',
    vet: { id: 'v1', clinicId: 'c1', firstName: 'Selin', lastName: 'Yılmaz', title: 'Dr.', licenseNo: 'VET-001' },
    date: '2026-04-25',
    complaint: 'Arka bacakta topallama, 3 gündür fark ediliyor.',
    findings: 'Sol arka bacak stifle eklemi palpasyonunda ağrı. Hareket kısıtlılığı var.',
    assessment: 'Ligament zorlanması. Röntgen önerildi.',
    plan: 'NSAID başlandı. Dinlenme önerildi. 1 hafta sonra röntgen için gelecek.',
    followUpDate: '2026-05-02',
    createdAt: '2026-04-25',
  },
]

export const mockVaccinations: Vaccination[] = [
  { id: 'v1', petId: '1', vetId: 'v1', vaccineName: 'Kuduz', appliedDate: '2026-01-15', nextDate: '2027-01-15', serialNo: 'RB2024-001', manufacturer: 'Nobivac' },
  { id: 'v2', petId: '1', vetId: 'v1', vaccineName: 'Karma (FVRCP)', appliedDate: '2026-01-15', nextDate: '2027-01-15', serialNo: 'FC2024-002', manufacturer: 'Purevax' },
  { id: 'v3', petId: '2', vetId: 'v1', vaccineName: 'Kuduz', appliedDate: '2025-11-10', nextDate: '2026-05-10', serialNo: 'RB2025-015', manufacturer: 'Nobivac' },
  { id: 'v4', petId: '2', vetId: 'v1', vaccineName: 'Karma (DHPPiL)', appliedDate: '2025-11-10', nextDate: '2026-11-10', serialNo: 'DH2025-016', manufacturer: 'Eurican' },
]

export const mockPrescriptions: Prescription[] = [
  {
    id: 'p1',
    examinationId: 'e1',
    vetId: 'v1',
    date: '2026-04-20',
    notes: 'Yemek sonrası verilmeli.',
    medications: [
      { id: 'm1', prescriptionId: 'p1', drugName: 'Metronidazol 250mg', dose: '1/4 tablet', frequency: '2x1', duration: '5 gün', instructions: 'Yemekle birlikte' },
      { id: 'm2', prescriptionId: 'p1', drugName: 'Synbiotic DC (Probiyotik)', dose: '1 saşe', frequency: '1x1', duration: '10 gün', instructions: '' },
    ],
  },
]

export const mockLabResults: LabResult[] = [
  { id: 'l1', petId: '1', vetId: 'v1', testType: 'Tam Kan Sayımı', date: '2026-04-20', comment: 'Hafif lökositoz. Enfeksiyon ile uyumlu.' },
  { id: 'l2', petId: '2', vetId: 'v1', testType: 'Röntgen (Sol arka bacak)', date: '2026-04-25', comment: 'Kemik yapısında patoloji yok. Yumuşak doku şişliği mevcut.' },
]

export const mockDashboardStats: DashboardStats = {
  todayExaminations: 12,
  todayVaccinations: 5,
  weekFollowUps: 8,
  totalPatients: 247,
  pendingLabResults: 3,
}

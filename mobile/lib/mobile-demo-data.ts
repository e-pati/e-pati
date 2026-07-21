import type { Examination, LabResult, Pet, Prescription, Vaccination } from '@/types'

export const DEMO_PET_ID = 'demo-pamuk'

export const demoPetProfile: {
  hkn: string
  integrationLabel: string
  pet: Pet
  examinations: Examination[]
  vaccinations: Vaccination[]
  prescriptions: Prescription[]
  labResults: LabResult[]
} = {
  hkn: 'HKN-TR-2026-0001842',
  integrationLabel: 'PETVET entegrasyon simülasyonu',
  pet: {
    id: DEMO_PET_ID,
    ownerId: 'demo-owner-burak',
    name: 'Pamuk',
    species: 'cat',
    breed: 'Van Kedisi',
    gender: 'female',
    birthDate: '2021-03-15',
    microchipNo: '941000024681357',
    weight: 4.2,
  },
  examinations: [
    {
      id: 'demo-exam-pamuk-1',
      petId: DEMO_PET_ID,
      vetName: 'Uzm. Vet. Hek. Selin Yılmaz',
      clinicName: 'VetCep Ankara Pilot Kliniği',
      date: '2026-06-18',
      complaint: 'Yıllık genel kontrol ve aşı takvimi değerlendirmesi.',
      findings: 'Genel durum iyi. Ağırlık 4,2 kg. Kalp ve solunum muayenesi normal.',
      assessment: 'Sağlıklı. Aşı programı güncel, diş taşı açısından yıllık takip önerildi.',
      plan: 'Karma aşı rapeli Ağustos 2026 için planlandı.',
      followUpDate: '2026-08-10',
    },
    {
      id: 'demo-exam-pamuk-2',
      petId: DEMO_PET_ID,
      vetName: 'Vet. Hek. Deniz Kaya',
      clinicName: 'VetCep Ankara Pilot Kliniği',
      date: '2026-01-12',
      complaint: 'Rutin kontrol.',
      findings: 'Vital bulgular normal. Tüy ve deri sağlığı iyi.',
      assessment: 'Sağlıklı.',
      plan: 'Rutin koruyucu hekimlik programına devam.',
    },
  ],
  vaccinations: [
    {
      id: 'demo-vaccine-pamuk-1',
      petId: DEMO_PET_ID,
      vaccineName: 'Kuduz',
      appliedDate: '2026-01-12',
      nextDate: '2027-01-12',
      manufacturer: 'Nobivac · Seri RB-260112',
      clinicName: 'VetCep Ankara Pilot Kliniği',
    },
    {
      id: 'demo-vaccine-pamuk-2',
      petId: DEMO_PET_ID,
      vaccineName: 'Karma (FVRCP)',
      appliedDate: '2025-08-10',
      nextDate: '2026-08-10',
      manufacturer: 'Purevax · Seri FV-250810',
      clinicName: 'VetCep Ankara Pilot Kliniği',
    },
  ],
  prescriptions: [
    {
      id: 'demo-prescription-pamuk-1',
      petId: DEMO_PET_ID,
      vetName: 'Uzm. Vet. Hek. Selin Yılmaz',
      date: '2026-06-18',
      medications: [
        {
          id: 'demo-medication-pamuk-1',
          drugName: 'Omega-3 deri ve tüy desteği',
          dose: '1 kapsül',
          frequency: 'Günde 1',
          duration: '30 gün',
          instructions: 'Mama ile birlikte verilecek.',
        },
      ],
    },
  ],
  labResults: [
    {
      id: 'demo-lab-pamuk-1',
      petId: DEMO_PET_ID,
      testType: 'Tam Kan Sayımı',
      date: '2026-06-18',
      comment: 'Tüm parametreler referans aralığında. Kontrol sonucu normal.',
      clinicName: 'VetCep Ankara Pilot Kliniği',
    },
  ],
}

export interface DemoCattleVaccination {
  id: string
  name: string
  appliedDate: string
  nextDate: string
  lotNumber: string
  status: 'current' | 'upcoming'
}

export interface DemoCattleEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'health' | 'movement' | 'registration'
}

export const demoCattleProfile = {
  id: 'producer-demo',
  hkn: 'HKN-TR-2026-3400741',
  earTag: 'TR 06 458921',
  name: 'Sarıkız',
  breed: 'Simental',
  sex: 'Dişi',
  birthDate: '2022-04-08',
  purpose: 'Süt sığırı',
  enterprise: {
    name: 'Güneş Süt İşletmesi',
    registrationNo: 'TR-06-ÇBK-00482',
    city: 'Ankara',
    district: 'Çubuk',
  },
  healthStatus: 'Sağlıklı',
  vaccinationCoverage: 100,
  vaccinations: [
    {
      id: 'demo-cattle-vaccine-1',
      name: 'Şap Aşısı',
      appliedDate: '2026-03-14',
      nextDate: '2026-09-14',
      lotNumber: 'SAP-26-0314-88',
      status: 'current',
    },
    {
      id: 'demo-cattle-vaccine-2',
      name: 'Nodüler Ekzantem (LSD)',
      appliedDate: '2026-04-02',
      nextDate: '2027-04-02',
      lotNumber: 'LSD-26-0402-17',
      status: 'current',
    },
    {
      id: 'demo-cattle-vaccine-3',
      name: 'Brusella Kontrolü',
      appliedDate: '2025-10-21',
      nextDate: '2026-10-21',
      lotNumber: 'BRU-25-1021-43',
      status: 'upcoming',
    },
  ] satisfies DemoCattleVaccination[],
  events: [
    {
      id: 'demo-cattle-event-1',
      date: '2026-06-24',
      title: 'Rutin sağlık kontrolü',
      description: 'Genel muayene normal; vücut kondisyon skoru 3,5/5.',
      type: 'health',
    },
    {
      id: 'demo-cattle-event-2',
      date: '2026-03-14',
      title: 'Şap aşısı uygulandı',
      description: 'İlçe aşılama programı kapsamında kayıt doğrulandı.',
      type: 'health',
    },
    {
      id: 'demo-cattle-event-3',
      date: '2025-11-03',
      title: 'İşletmeye giriş',
      description: 'Polatlı işletmesinden Güneş Süt İşletmesi’ne hareket tamamlandı.',
      type: 'movement',
    },
    {
      id: 'demo-cattle-event-4',
      date: '2022-04-10',
      title: 'Kimliklendirme kaydı',
      description: 'Küpe ve doğum kaydı HAYBİS kaynak sistemiyle eşleştirildi.',
      type: 'registration',
    },
  ] satisfies DemoCattleEvent[],
}

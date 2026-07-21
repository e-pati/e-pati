export interface DemoEnterprise {
  id: string
  registrationNo: string
  name: string
  city: string
  district: string
  type: string
  capacity: number
  animalCount: number
  status: 'active' | 'demo'
}

export interface DemoLivestockEvent {
  id: string
  date: string
  title: string
  description: string
  location: string
  type: 'registration' | 'health' | 'movement'
}

export interface DemoLivestockAnimal {
  id: string
  hkn: string
  earTag: string
  name: string
  species: string
  breed: string
  sex: string
  birthDate: string
  purpose: string
  vaccinationCoverage: number
  currentEnterpriseId: string
}

export const sourceEnterprise: DemoEnterprise = {
  id: 'enterprise-gunes',
  registrationNo: 'TR-06-CBK-00482',
  name: 'Güneş Süt İşletmesi',
  city: 'Ankara',
  district: 'Çubuk',
  type: 'Süt sığırcılığı',
  capacity: 180,
  animalCount: 146,
  status: 'active',
}

export const destinationEnterprise: DemoEnterprise = {
  id: 'enterprise-bereket',
  registrationNo: 'TR-06-PLT-00193',
  name: 'Bereket Besi Çiftliği',
  city: 'Ankara',
  district: 'Polatlı',
  type: 'Besi sığırcılığı',
  capacity: 240,
  animalCount: 198,
  status: 'active',
}

export const demoLivestockAnimal: DemoLivestockAnimal = {
  id: 'sarıkız',
  hkn: 'HKN-TR-2026-3400741',
  earTag: 'TR 06 458921',
  name: 'Sarıkız',
  species: 'Büyükbaş',
  breed: 'Simental',
  sex: 'Dişi',
  birthDate: '2022-04-08',
  purpose: 'Süt sığırı',
  vaccinationCoverage: 100,
  currentEnterpriseId: sourceEnterprise.id,
}

export const initialLivestockEvents: DemoLivestockEvent[] = [
  {
    id: 'event-health-check',
    date: '2026-06-24T09:30:00.000Z',
    title: 'Rutin sağlık kontrolü',
    description: 'Genel muayene normal; vücut kondisyon skoru 3,5/5 olarak kaydedildi.',
    location: sourceEnterprise.name,
    type: 'health',
  },
  {
    id: 'event-vaccination',
    date: '2026-03-14T11:00:00.000Z',
    title: 'Şap aşısı uygulandı',
    description: 'İlçe aşılama programı kapsamında seri ve uygulama kaydı doğrulandı.',
    location: sourceEnterprise.name,
    type: 'health',
  },
  {
    id: 'event-registration',
    date: '2022-04-10T08:15:00.000Z',
    title: 'Kimliklendirme kaydı oluşturuldu',
    description: 'Küpe numarası HKN ile eşleştirildi ve kaynak sistem kaydı doğrulandı.',
    location: sourceEnterprise.name,
    type: 'registration',
  },
]

export const livestockDemoStats = {
  totalAnimals: 344,
  vaccinationDue: 18,
  activeMovements: 3,
  healthAlerts: 2,
}


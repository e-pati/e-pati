export interface MunicipalityDemoEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'intake' | 'health' | 'adoption'
}

export const demoMunicipality = {
  name: 'Ankara Büyükşehir Belediyesi',
  unit: 'Veteriner İşleri · Demo Birimi',
  shelter: 'VetCep Pilot Geçici Bakımevi',
  city: 'Ankara',
  district: 'Keçiören',
}

export const demoStrayAnimal = {
  id: 'dost',
  hkn: 'HKN-TR-2026-STR-00842',
  microchipNo: '991001000843216',
  name: 'Dost',
  species: 'Köpek',
  breed: 'Melez',
  sex: 'Erkek',
  estimatedAge: '3 yaş',
  color: 'Karamel / beyaz',
  foundDistrict: 'Keçiören',
  admissionDate: '2026-07-21',
  healthStatus: 'Genel durumu iyi',
  temperament: ['İnsan canlısı', 'Sakin', 'Tasmalı yürüyüşe uygun'],
  adoptionSummary: 'Sosyal, insanlarla iletişimi güçlü ve apartman yaşamına uyum sağlayabilecek sakin bir dost.',
}

export const demoSterilization = {
  operationDate: '2026-07-21',
  veterinarian: 'Vet. Hek. Selin Yılmaz',
  procedure: 'Erkek köpek kısırlaştırma operasyonu',
  result: 'Komplikasyonsuz tamamlandı',
  followUpDate: '2026-07-28',
  protocolNo: 'KSR-2026-ANK-01842',
}

export const initialMunicipalityEvents: MunicipalityDemoEvent[] = [
  {
    id: 'event-field-intake',
    date: '2026-07-21T08:40:00.000Z',
    title: 'Saha ekibi tarafından teslim alındı',
    description: 'Keçiören ilçesindeki saha taramasında bulundu; hassas konum bilgisi kaydedilmedi.',
    type: 'intake',
  },
]

export const municipalityDemoStats = {
  shelterAnimals: 184,
  awaitingSterilization: 12,
  readyForAdoption: 28,
  adoptedThisMonth: 16,
}

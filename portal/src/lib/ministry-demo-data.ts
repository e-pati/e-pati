export type MinistryRiskLevel = 'low' | 'medium' | 'high'

export interface MinistryProvince {
  plateCode: number
  name: string
  region: string
  mapX: number
  mapY: number
  cattle: number
  smallRuminants: number
  pets: number
  streetAnimals: number
  vaccinationCoverage: number
  registeredBusinesses: number
  activeVeterinarians: number
  monthlyChange: number
  riskLevel: MinistryRiskLevel
  activeAlerts: number
}

export interface MinistryAlert {
  id: string
  province: string
  district: string
  title: string
  description: string
  level: 'warning' | 'critical'
  source: string
  occurredAt: string
  recommendedAction: string
}

type ProvinceSeed = readonly [
  plateCode: number,
  name: string,
  region: string,
  mapX: number,
  mapY: number,
]

const provinceSeeds: ProvinceSeed[] = [
  [1, 'Adana', 'Akdeniz', 380, 245],
  [2, 'Adıyaman', 'Güneydoğu Anadolu', 515, 220],
  [3, 'Afyonkarahisar', 'Ege', 235, 190],
  [4, 'Ağrı', 'Doğu Anadolu', 745, 125],
  [5, 'Amasya', 'Karadeniz', 465, 120],
  [6, 'Ankara', 'İç Anadolu', 340, 145],
  [7, 'Antalya', 'Akdeniz', 260, 260],
  [8, 'Artvin', 'Karadeniz', 700, 55],
  [9, 'Aydın', 'Ege', 140, 220],
  [10, 'Balıkesir', 'Marmara', 125, 130],
  [11, 'Bilecik', 'Marmara', 225, 125],
  [12, 'Bingöl', 'Doğu Anadolu', 630, 175],
  [13, 'Bitlis', 'Doğu Anadolu', 700, 190],
  [14, 'Bolu', 'Karadeniz', 300, 105],
  [15, 'Burdur', 'Akdeniz', 245, 235],
  [16, 'Bursa', 'Marmara', 185, 115],
  [17, 'Çanakkale', 'Marmara', 80, 125],
  [18, 'Çankırı', 'İç Anadolu', 375, 110],
  [19, 'Çorum', 'Karadeniz', 430, 120],
  [20, 'Denizli', 'Ege', 190, 220],
  [21, 'Diyarbakır', 'Güneydoğu Anadolu', 620, 225],
  [22, 'Edirne', 'Marmara', 65, 55],
  [23, 'Elazığ', 'Doğu Anadolu', 575, 190],
  [24, 'Erzincan', 'Doğu Anadolu', 590, 135],
  [25, 'Erzurum', 'Doğu Anadolu', 690, 115],
  [26, 'Eskişehir', 'İç Anadolu', 280, 150],
  [27, 'Gaziantep', 'Güneydoğu Anadolu', 465, 260],
  [28, 'Giresun', 'Karadeniz', 575, 85],
  [29, 'Gümüşhane', 'Karadeniz', 620, 105],
  [30, 'Hakkâri', 'Doğu Anadolu', 800, 245],
  [31, 'Hatay', 'Akdeniz', 390, 300],
  [32, 'Isparta', 'Akdeniz', 260, 225],
  [33, 'Mersin', 'Akdeniz', 330, 265],
  [34, 'İstanbul', 'Marmara', 140, 70],
  [35, 'İzmir', 'Ege', 110, 190],
  [36, 'Kars', 'Doğu Anadolu', 760, 80],
  [37, 'Kastamonu', 'Karadeniz', 380, 75],
  [38, 'Kayseri', 'İç Anadolu', 455, 175],
  [39, 'Kırklareli', 'Marmara', 85, 50],
  [40, 'Kırşehir', 'İç Anadolu', 405, 160],
  [41, 'Kocaeli', 'Marmara', 190, 85],
  [42, 'Konya', 'İç Anadolu', 340, 210],
  [43, 'Kütahya', 'Ege', 225, 165],
  [44, 'Malatya', 'Doğu Anadolu', 530, 195],
  [45, 'Manisa', 'Ege', 145, 180],
  [46, 'Kahramanmaraş', 'Akdeniz', 465, 220],
  [47, 'Mardin', 'Güneydoğu Anadolu', 650, 265],
  [48, 'Muğla', 'Ege', 155, 260],
  [49, 'Muş', 'Doğu Anadolu', 675, 170],
  [50, 'Nevşehir', 'İç Anadolu', 420, 185],
  [51, 'Niğde', 'İç Anadolu', 405, 220],
  [52, 'Ordu', 'Karadeniz', 535, 85],
  [53, 'Rize', 'Karadeniz', 665, 65],
  [54, 'Sakarya', 'Marmara', 225, 95],
  [55, 'Samsun', 'Karadeniz', 480, 85],
  [56, 'Siirt', 'Güneydoğu Anadolu', 730, 215],
  [57, 'Sinop', 'Karadeniz', 425, 55],
  [58, 'Sivas', 'İç Anadolu', 520, 145],
  [59, 'Tekirdağ', 'Marmara', 105, 70],
  [60, 'Tokat', 'Karadeniz', 485, 115],
  [61, 'Trabzon', 'Karadeniz', 625, 75],
  [62, 'Tunceli', 'Doğu Anadolu', 585, 165],
  [63, 'Şanlıurfa', 'Güneydoğu Anadolu', 540, 265],
  [64, 'Uşak', 'Ege', 190, 185],
  [65, 'Van', 'Doğu Anadolu', 770, 180],
  [66, 'Yozgat', 'İç Anadolu', 430, 145],
  [67, 'Zonguldak', 'Karadeniz', 310, 75],
  [68, 'Aksaray', 'İç Anadolu', 385, 195],
  [69, 'Bayburt', 'Karadeniz', 650, 120],
  [70, 'Karaman', 'İç Anadolu', 350, 245],
  [71, 'Kırıkkale', 'İç Anadolu', 380, 145],
  [72, 'Batman', 'Güneydoğu Anadolu', 680, 225],
  [73, 'Şırnak', 'Güneydoğu Anadolu', 745, 250],
  [74, 'Bartın', 'Karadeniz', 345, 70],
  [75, 'Ardahan', 'Doğu Anadolu', 740, 55],
  [76, 'Iğdır', 'Doğu Anadolu', 805, 105],
  [77, 'Yalova', 'Marmara', 175, 95],
  [78, 'Karabük', 'Karadeniz', 345, 90],
  [79, 'Kilis', 'Güneydoğu Anadolu', 440, 275],
  [80, 'Osmaniye', 'Akdeniz', 420, 255],
  [81, 'Düzce', 'Karadeniz', 270, 95],
]

export const ministryAlerts: MinistryAlert[] = [
  {
    id: 'alert-konya-01',
    province: 'Konya',
    district: 'Karatay',
    title: 'Şap hastalığı şüpheli vaka kümesi',
    description: 'Son 48 saatte üç işletmeden benzer klinik bulgu bildirildi.',
    level: 'critical',
    source: 'Saha veterineri bildirimleri',
    occurredAt: '14 dk önce',
    recommendedAction: '10 km izlem alanı oluştur ve numune ekiplerini yönlendir.',
  },
  {
    id: 'alert-kars-01',
    province: 'Kars',
    district: 'Selim',
    title: 'Solunum vakalarında olağandışı artış',
    description: 'Yedi günlük hareketli ortalamanın %31 üzerinde vaka gözlendi.',
    level: 'warning',
    source: 'Klinik kayıt analizi',
    occurredAt: '38 dk önce',
    recommendedAction: 'İl müdürlüğü saha doğrulaması başlatsın.',
  },
  {
    id: 'alert-sanliurfa-01',
    province: 'Şanlıurfa',
    district: 'Viranşehir',
    title: 'Aşılama kapsamı eşik altında',
    description: 'Büyükbaş şap aşılama kapsamı hedefin 9 puan altında kaldı.',
    level: 'warning',
    source: 'Aşılama programı',
    occurredAt: '1 sa önce',
    recommendedAction: 'Mobil aşılama ekibi kapasitesini artır.',
  },
  {
    id: 'alert-izmir-01',
    province: 'İzmir',
    district: 'Buca',
    title: 'Sokak hayvanı kuduz aşısı gecikmesi',
    description: 'Planlanan 420 uygulamanın 116 adedi zamanında tamamlanmadı.',
    level: 'warning',
    source: 'Belediye entegrasyon simülasyonu',
    occurredAt: '2 sa önce',
    recommendedAction: 'Belediye programı için telafi takvimi oluştur.',
  },
]

const alertCountByProvince = ministryAlerts.reduce<Record<string, number>>((counts, alert) => {
  counts[alert.province] = (counts[alert.province] ?? 0) + 1
  return counts
}, {})

export const ministryProvinces: MinistryProvince[] = provinceSeeds.map((seed) => {
  const [plateCode, name, region, mapX, mapY] = seed
  const activeAlerts = alertCountByProvince[name] ?? 0
  const vaccinationCoverage = activeAlerts > 0
    ? 72 + ((plateCode * 5) % 13)
    : 84 + ((plateCode * 7) % 14)
  const riskLevel: MinistryRiskLevel = activeAlerts > 0
    ? (name === 'Konya' ? 'high' : 'medium')
    : vaccinationCoverage < 88 ? 'medium' : 'low'

  return {
    plateCode,
    name,
    region,
    mapX,
    mapY,
    cattle: 82_000 + ((plateCode * 19_873) % 690_000),
    smallRuminants: 126_000 + ((plateCode * 31_337) % 940_000),
    pets: 28_000 + ((plateCode * 12_983) % 490_000),
    streetAnimals: 7_500 + ((plateCode * 3_719) % 118_000),
    vaccinationCoverage,
    registeredBusinesses: 420 + ((plateCode * 887) % 11_800),
    activeVeterinarians: 38 + ((plateCode * 97) % 1_180),
    monthlyChange: Number((((plateCode * 13) % 41) / 10 - 1.2).toFixed(1)),
    riskLevel,
    activeAlerts,
  }
})

export const ministryNationalSummary = ministryProvinces.reduce(
  (summary, province) => {
    summary.totalAnimals += province.cattle + province.smallRuminants + province.pets + province.streetAnimals
    summary.registeredBusinesses += province.registeredBusinesses
    summary.activeVeterinarians += province.activeVeterinarians
    summary.weightedVaccination += province.vaccinationCoverage
    return summary
  },
  {
    totalAnimals: 0,
    registeredBusinesses: 0,
    activeVeterinarians: 0,
    weightedVaccination: 0,
  },
)

export const nationalVaccinationCoverage = Math.round(
  ministryNationalSummary.weightedVaccination / ministryProvinces.length,
)

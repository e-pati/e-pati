export interface DrugTemplate {
  name: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export const DRUG_DATABASE: DrugTemplate[] = [
  { name: 'Amoksisilin', dose: '10-20 mg/kg', frequency: '2x1', duration: '7-14 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Metronidazol', dose: '7.5-15 mg/kg', frequency: '2x1', duration: '5-7 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Doksisiklin', dose: '5-10 mg/kg', frequency: '2x1', duration: '7-14 gün', instructions: 'Bol su ile verin, güneşten koruyun' },
  { name: 'Klindamisin', dose: '5-11 mg/kg', frequency: '2x1', duration: '7-14 gün' },
  { name: 'Enrofloksasin', dose: '5-10 mg/kg', frequency: '1x1', duration: '7-10 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Sefaleksin', dose: '10-30 mg/kg', frequency: '2x1-3x1', duration: '7-14 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Prednizolon', dose: '1-2 mg/kg', frequency: '1x1', duration: '7-14 gün', instructions: 'Yemekle birlikte verin, ani bırakmayın' },
  { name: 'Deksametazon', dose: '0.1-0.2 mg/kg', frequency: '1x1', duration: '3-5 gün' },
  { name: 'Meloksikam', dose: '0.1 mg/kg', frequency: '1x1', duration: '3-5 gün', instructions: 'Yemekle birlikte verin, su içimini artırın' },
  { name: 'Ketoprofen', dose: '1 mg/kg', frequency: '1x1', duration: '3-5 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Tramadol', dose: '2-5 mg/kg', frequency: '2x1-3x1', duration: '5-7 gün', instructions: 'Sersemlik yapabilir' },
  { name: 'Gabapentin', dose: '5-10 mg/kg', frequency: '2x1', duration: 'Süresiz', instructions: 'Ani bırakmayın' },
  { name: 'Furosemid', dose: '1-4 mg/kg', frequency: '1x1-2x1', duration: 'Süresiz', instructions: 'Bol su içirin' },
  { name: 'Enalapril', dose: '0.25-0.5 mg/kg', frequency: '1x1-2x1', duration: 'Süresiz', instructions: 'Böbrek takibi yapın' },
  { name: 'Omeprazol', dose: '0.5-1 mg/kg', frequency: '1x1', duration: '4-8 hafta', instructions: 'Yemekten 30 dk önce verin' },
  { name: 'Famotidin', dose: '0.5-1 mg/kg', frequency: '1x1-2x1', duration: '2-4 hafta' },
  { name: 'Metoklopramid', dose: '0.2-0.5 mg/kg', frequency: '3x1', duration: '5-7 gün', instructions: 'Yemekten 30 dk önce verin' },
  { name: 'Ondansetron', dose: '0.1-0.2 mg/kg', frequency: '2x1-3x1', duration: '3-5 gün' },
  { name: 'Difenhidramin', dose: '1-2 mg/kg', frequency: '2x1-3x1', duration: '5-7 gün', instructions: 'Uyku yapabilir' },
  { name: 'Setirizin', dose: '5-10 mg/hayvan', frequency: '1x1', duration: '14-30 gün' },
  { name: 'Klorfeniramin', dose: '0.5-2 mg/kg', frequency: '2x1-3x1', duration: '5-14 gün' },
  { name: 'Fenbendazol', dose: '50 mg/kg', frequency: '1x1', duration: '3 gün', instructions: 'Yemekle birlikte verin' },
  { name: 'Pirantel', dose: '5-10 mg/kg', frequency: 'Tek doz', duration: '1 gün' },
  { name: 'Milbemisim', dose: '0.5-1 mg/kg', frequency: 'Ayda 1', duration: 'Süresiz' },
  { name: 'Doksisiklin (Heartworm)', dose: '10 mg/kg', frequency: '2x1', duration: '28 gün' },
]

export const VACCINATION_TEMPLATES: Record<string, Array<{ name: string; intervalMonths: number; notes?: string }>> = {
  Cat: [
    { name: 'Kuduz', intervalMonths: 12, notes: 'Yasal zorunluluk — 3 aydan büyük kedilere' },
    { name: 'Karma (FVRCP)', intervalMonths: 12, notes: 'Temel aşı: Panlosöpeni, Herpes, Kalisi' },
    { name: 'Lösemi (FeLV)', intervalMonths: 12, notes: 'Dış ortama çıkan kediler için önerilen' },
    { name: 'Klamidya', intervalMonths: 12, notes: 'Çok kedili ortamlar için' },
    { name: 'FIP (kedi enfeksiyöz peritonit)', intervalMonths: 12, notes: 'İç mekan kedileri için opsiyonel' },
  ],
  Dog: [
    { name: 'Kuduz', intervalMonths: 12, notes: 'Yasal zorunluluk — 3 aydan büyük köpeklere' },
    { name: 'Karma (DHPPiL)', intervalMonths: 12, notes: 'Temel aşı: Distemper, Hepatit, Parvo, Para, Leptospira' },
    { name: 'Bordetella', intervalMonths: 6, notes: 'Sosyal köpekler, köpek oteli gidenler için' },
    { name: 'Lyme', intervalMonths: 12, notes: 'Kırsal alanda yaşayan köpekler için' },
    { name: 'Kanin Influenza', intervalMonths: 6, notes: 'Çok köpekli ortamlar için' },
  ],
  Rabbit: [
    { name: 'Miyomatozis', intervalMonths: 6, notes: 'Dış mekan tavşanları için zorunlu' },
    { name: 'VHD / RHD', intervalMonths: 12, notes: 'Tavşan Hemorajik Hastalığı' },
    { name: 'VHD2 (RHDV2)', intervalMonths: 12, notes: 'Yeni tip RHD virüsü, ayrı aşı gerekir' },
  ],
  Bird: [
    { name: 'Polyomavirus', intervalMonths: 12, notes: 'Yavru kuşlar için kritik' },
    { name: 'PBFD', intervalMonths: 12, notes: 'Papağanlarda tüy ve gaga hastalığı' },
  ],
  Other: [
    { name: 'Kuduz', intervalMonths: 12, notes: 'Tüm memeli evcil hayvanlar için önerilen' },
  ],
}

const DEMO_CLINICAL_TRANSLATIONS: Record<string, string> = {
  'Annual rabies vaccination completed.': 'Yıllık kuduz aşısı tamamlandı.',
  'Appetite loss and fatigue': 'İştahsızlık ve halsizlik',
  Amoxicillin: 'Amoksisilin',
  'Blood panel': 'Kan paneli',
  'Diet change and follow-up in 3 days': 'Beslenme düzeni değişikliği ve 3 gün sonra kontrol',
  'Give after meals.': 'Yemeklerden sonra verin.',
  'Give medication after meals.': 'İlacı yemeklerden sonra verin.',
  'Mild dehydration, normal temperature': 'Hafif dehidrasyon, vücut sıcaklığı normal',
  Rabies: 'Kuduz',
  'Suspected gastrointestinal irritation': 'Gastrointestinal irritasyon şüphesi',
  'Twice daily': 'Günde iki kez',
  'Values are within expected range.': 'Değerler beklenen aralıkta.',
  '7 days': '7 gün',
}

export function localizeDemoClinicalText(value?: string): string | undefined {
  if (!value) return value
  return DEMO_CLINICAL_TRANSLATIONS[value] ?? value
}

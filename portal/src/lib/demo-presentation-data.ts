export interface DemoPresentationLink {
  label: string
  href: string
}

export interface DemoPresentationStage {
  id: string
  order: number
  title: string
  timeRange: string
  durationMinutes: number
  audienceMessage: string
  presenterNote: string
  href?: string
  actionLabel?: string
  supportingLinks?: DemoPresentationLink[]
  checkpoints: string[]
  tone: 'slate' | 'red' | 'violet' | 'emerald' | 'cyan' | 'blue' | 'amber'
}

export const DEMO_TOTAL_MINUTES = 25

export const demoPresentationStages: DemoPresentationStage[] = [
  {
    id: 'opening',
    order: 1,
    title: 'Açılış ve konumlandırma',
    timeRange: '00:00–02:00',
    durationMinutes: 2,
    audienceMessage: 'VetCep mevcut kamu kayıt sistemlerinin yerine değil, üzerinde çalışan deneyim, klinik derinlik ve karar-destek katmanıdır.',
    presenterNote: 'HAYBİS, PETVET, İTS ve e-Devlet’i ilk iki dakikada açıkça adlandır; “yerine geçmek” ifadesini kullanma.',
    checkpoints: ['Entegrasyon katmanı', 'Tek HKN vizyonu', 'Demo verisinin sentetik olduğu'],
    tone: 'slate',
  },
  {
    id: 'citizen',
    order: 2,
    title: 'Vatandaş girişi ve mobil kayıtlar',
    timeRange: '02:00–05:00',
    durationMinutes: 3,
    audienceMessage: 'Vatandaş, e-Devlet deneyimi üzerinden hayvanlarının kimlik ve sağlık kayıtlarına tek noktadan erişir.',
    presenterNote: 'Simülasyon etiketini göster; ardından mobil cihazda Pamuk ve Sarıkız profillerini aç.',
    href: '/vatandas-giris',
    actionLabel: 'Vatandaş girişini aç',
    supportingLinks: [{ label: 'Mobil geçiş sayfası', href: '/get-app?source=edevlet-demo' }],
    checkpoints: ['Simülasyon etiketi', 'Pamuk aşı kartı', 'Sarıkız üretici görünümü'],
    tone: 'red',
  },
  {
    id: 'clinic',
    order: 3,
    title: 'Veteriner klinik derinliği',
    timeRange: '05:00–09:00',
    durationMinutes: 4,
    audienceMessage: 'Klinik ekipleri muayene, aşı, reçete ve laboratuvar kayıtlarını aynı hayvan profili altında işler.',
    presenterNote: 'Lokal seed veteriner kullanıcısıyla giriş yap; Misket profilinde muayene ve aşı geçmişini göster.',
    href: '/login',
    actionLabel: 'Klinik girişini aç',
    supportingLinks: [
      { label: 'Hasta kayıtları', href: '/patients' },
      { label: 'Aşı kayıtları', href: '/vaccinations' },
      { label: 'Ulusal registry', href: '/registry' },
    ],
    checkpoints: ['Misket profili', 'Muayene geçmişi', 'Aşı kaydı'],
    tone: 'violet',
  },
  {
    id: 'producer',
    order: 4,
    title: 'Üretici ve hayvan hareketi',
    timeRange: '09:00–14:00',
    durationMinutes: 5,
    audienceMessage: 'Üretici işletme kaydından küpe doğrulamaya ve iki işletme arasındaki harekete kadar izlenebilir bir deneyim kullanır.',
    presenterNote: 'Güneş Süt → Bereket Besi hareketini tamamla; olay geçmişinde güncel işletmenin değiştiğini göster.',
    href: '/hayvancilik',
    actionLabel: 'Hayvancılık demosunu aç',
    checkpoints: ['İşletme kaydı', 'Küpe–HKN eşleşmesi', 'Hareket olay geçmişi'],
    tone: 'emerald',
  },
  {
    id: 'municipality',
    order: 5,
    title: 'Belediye yaşam döngüsü',
    timeRange: '14:00–18:00',
    durationMinutes: 4,
    audienceMessage: 'Sahipsiz hayvanın barınak kabulü, kısırlaştırması ve sahiplendirilmesi tek yaşam döngüsünde kayıt altına alınır.',
    presenterNote: 'Dost için üç adımı tamamla; hassas konum paylaşılmadığını ve ilan sağlık bilgilerinin doğrulandığını vurgula.',
    href: '/belediye',
    actionLabel: 'Belediye demosunu aç',
    checkpoints: ['Barınak kabulü', 'Kısırlaştırma', 'Yayında ilan önizlemesi'],
    tone: 'cyan',
  },
  {
    id: 'ministry',
    order: 6,
    title: 'Bakanlık karar-destek katmanı',
    timeRange: '18:00–24:00',
    durationMinutes: 6,
    audienceMessage: 'Operasyonlardan gelen veriler ulusal aşılama, popülasyon ve erken-uyarı karar desteğine dönüşür.',
    presenterNote: '81 il görünümü, il drill-down, aşılama kapsamı ve erken uyarı akışını sırayla göster.',
    href: '/bakanlik',
    actionLabel: 'Bakanlık konsolunu aç',
    checkpoints: ['81 il haritası', 'Aşılama ve popülasyon', 'Erken uyarı sinyali'],
    tone: 'blue',
  },
  {
    id: 'closing',
    order: 7,
    title: 'Pilot önerisi ve kapanış',
    timeRange: '24:00–25:00',
    durationMinutes: 1,
    audienceMessage: 'Önerimiz mevcut sistemlerle resmî entegrasyon protokolü altında ölçülebilir bir pilot başlatmaktır.',
    presenterNote: 'Ulusal dönüşüm taahhüdü verme; sınırlı pilot, entegrasyon erişimi ve başarı ölçütleriyle kapat.',
    checkpoints: ['Pilot kapsamı', 'Resmî entegrasyon bağımlılığı', 'Sonraki teknik çalışma oturumu'],
    tone: 'amber',
  },
]

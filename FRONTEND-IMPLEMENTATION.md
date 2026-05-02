# VetCep — Frontend & Mobile Implementation Planı

> Rekabet analizi sonuçlarına dayalı öncelikli geliştirme planı.  
> **Son güncelleme:** Mayıs 2026  
> **Kapsam:** Portal (Next.js) + Mobil (React Native/Expo)

---

## Öncelik Sıralaması

| Öncelik | Açıklama |
|---|---|
| 🔴 P0 | Gelir için zorunlu — bu olmadan para kazanılamaz |
| 🟠 P1 | Klinik satışı için kritik — bu olmadan klinik ikna edilemez |
| 🟡 P2 | Rekabet avantajı — rakiplerden öne geçirir |
| 🟢 P3 | Büyüme özellikleri — 6+ ay |

---

## 🔴 P0 — Ödeme ve Abonelik Sistemi

### Portal: Klinik Abonelik Akışı

**Neden kritik:** Para toplanamadan iş yoktur. Şu an klinik kaydı manueldir.

**Kullanılacak servis:** iyzico (Türkiye'de yaygın, BSMV uyumlu) veya Stripe (uluslararası)

**Portal'da yapılacaklar:**

```
/clinic-onboarding → mevcut form
  ↓
/billing → yeni sayfa (abonelik seçimi)
  ↓
/billing/checkout → iyzico/Stripe ödeme formu
  ↓
/dashboard → otomatik yönlendirme (deneme veya aktif)
```

**`portal/src/app/(auth)/billing/page.tsx`** — yeni sayfa:
- Plan kartları (tek plan: 1.500₺/ay)
- "14 gün ücretsiz, kart bilgisi girilmez" seçeneği
- Yıllık ödeme seçeneği (2 ay bedava = 16.500₺/yıl)
- iyzico embed checkout formu

**`portal/src/app/(auth)/billing/checkout/page.tsx`** — ödeme sayfası:
- iyzico JS SDK entegrasyonu
- Kredi kartı formu (iyzico hosted veya embedded)
- Ödeme başarılı/başarısız sayfaları

**`portal/src/hooks/use-subscription.ts`** — yeni hook:
```typescript
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getCurrent(),
  })
}

export function useIsSubscribed() {
  const { data } = useSubscription()
  return data?.status === 'active' || data?.status === 'trialing'
}
```

**`portal/src/middleware.ts`** güncelleme:
- Aboneliği olmayan klinikler `/billing`'e yönlendirilsin
- 14 günlük deneme durumu kontrol edilsin

**`portal/src/components/shared/subscription-guard.tsx`** — yeni:
```typescript
// Dashboard sayfalarını saran wrapper
// Abonelik bitmişse "Aboneliğiniz sona erdi" banner'ı gösterir
```

---

## 🔴 P0 — 14 Gün Ücretsiz Deneme Onboarding'i

**Neden kritik:** Kolayvet ve BulutVet'in en etkili müşteri kazanım silahı.

**Mevcut durum:** Klinik kaydı manuel, demo talep formu var.

**Hedef akış:**
```
Landing page → "14 Gün Ücretsiz Başla" butonu
  ↓
/clinic-onboarding (form: ad, klinik adı, e-posta, şifre)
  ↓
E-posta doğrulama (OTP — zaten var)
  ↓
Dashboard (deneme başladı — 14 gün banner'ı göster)
  ↓
Gün 11: "3 gün kaldı" e-postası + banner
  ↓
Gün 14: Ödeme sayfasına yönlendirme
```

**Portal değişiklikleri:**

`portal/src/app/page.tsx` (landing) — CTA butonunu güncelle:
```tsx
// Şu an: "Ücretsiz Demo İste" → /clinic-onboarding
// Yeni: "14 Gün Ücretsiz Başla" → /clinic-onboarding
// Alt yazı: "Kredi kartı gerekmez · Kurulum yok · Anında başla"
```

`portal/src/components/layout/header.tsx` — deneme banner'ı:
```tsx
// Deneme modundaysa sticky top banner:
// "⏰ Deneme sürenizde 11 gün kaldı — Aboneliği aktifleştirin"
// [Aboneliği Başlat] butonu
```

`portal/src/app/(dashboard)/billing/page.tsx`:
```tsx
// Deneme durumu kartı + kalan gün sayısı
// Aboneliği aktifleştir formu
// Yıllık/aylık seçeneği
```

---

## 🟠 P1 — WhatsApp Entegrasyonu

**Neden kritik:** Kolayvet'in en çok sevilen özelliği. Türkiye'de vet-sahip iletişiminin büyük çoğunluğu WhatsApp üzerinden. Bu olmadan klinik kararı geciktirir.

**Kullanılacak servis:** WhatsApp Business API — Meta'dan doğrudan veya Twilio/360dialog üzerinden

**Nasıl çalışır:**
1. Klinik, hasta sahibine muayene özeti/aşı hatırlatması WhatsApp mesajı gönderir
2. Mesaj template (Meta onaylı) olarak gönderilir
3. Sahip yanıt veremez (broadcast modeli), sadece bildirim alır

**Portal değişiklikleri:**

`portal/src/app/(dashboard)/settings/whatsapp/page.tsx` — yeni sayfa:
```tsx
// WhatsApp Business entegrasyon kurulumu
// Telefon numarası doğrulama
// Mesaj template seçimi
// Test mesajı gönder
```

`portal/src/components/patients/send-whatsapp-modal.tsx` — yeni:
```tsx
interface Props {
  petId: string
  ownerId: string
  ownerPhone: string
  type: 'exam_summary' | 'vaccine_reminder' | 'appointment_reminder' | 'custom'
}
// Hasta detay sayfasından "WhatsApp Gönder" butonu açar
// Template seçimi + önizleme + gönder
```

Hasta detay sayfasına (`patients/[id]/page.tsx`) eklenecekler:
```tsx
// Sahip bilgileri bölümünde:
<Button variant="outline" size="sm" onClick={() => setWhatsappOpen(true)}>
  <MessageCircle className="w-4 h-4 text-green-500" />
  WhatsApp Gönder
</Button>
```

Muayene kaydedildiğinde otomatik WhatsApp seçeneği:
```tsx
// examinations/new sayfasına:
// "Kaydet" butonunun yanına checkbox:
// ☑ Muayene özetini WhatsApp ile sahibine gönder
```

---

## 🟠 P1 — Randevu Sistemi

**Neden kritik:** Kliniklerin %90'ı telefon + defter ile randevu alıyor. Bu tek başına en büyük ağrı noktası.

**Portal'da yapılacaklar:**

`portal/src/app/(dashboard)/appointments/page.tsx` — yeni sayfa:
```
Takvim görünümü (haftalık/günlük)
Randevu listesi (bugün/yakında)
Renk kodlaması: onaylı (yeşil) / bekleyen (sarı) / iptal (kırmızı)
```

`portal/src/app/(dashboard)/appointments/new/page.tsx`:
```
Hasta seçimi (mevcut veya yeni)
Tarih + saat seçici
Veteriner ataması
Not alanı
→ Kaydet → sahibe otomatik SMS/push bildirim
```

`portal/src/components/layout/sidebar.tsx` güncelleme:
```tsx
// NavItems'e ekle:
{ href: '/appointments', label: 'Randevular', icon: CalendarDays },
```

`portal/src/components/shared/appointment-calendar.tsx` — yeni bileşen:
```tsx
// react-big-calendar veya @fullcalendar/react kullan
// Drag & drop randevu taşıma
// Klinik çalışma saatleri engeli
```

**Mobil'de yapılacaklar:**

`mobile/app/(tabs)/appointments/index.tsx` — yeni ekran:
```tsx
// Sahip kendi randevularını görür
// "Randevu Talep Et" butonu
// Yaklaşan randevular listesi
// Push bildirimiyle hatırlatma
```

`mobile/app/(tabs)/_layout.tsx` güncelleme:
```tsx
// Tab bar'a randevu sekmesi ekle (CalendarCheck ikonu)
```

---

## 🟠 P1 — Admin Paneli (Bizim İçin)

**Neden kritik:** Kaç klinik var, kim ödedi, kim iptal etti göremeden iş yönetilemiyor.

`portal/src/app/(admin)/` — yeni route grubu:
```
/admin/dashboard    → MRR, klinik sayısı, churn
/admin/clinics      → tüm klinikler, abonelik durumu
/admin/revenue      → gelir grafiği, ödeme geçmişi
```

`portal/src/app/(admin)/dashboard/page.tsx`:
```tsx
const adminStats = [
  { label: 'Toplam Klinik', value: data.totalClinics },
  { label: 'Aktif Abonelik', value: data.activeSubscriptions },
  { label: 'Aylık Gelir (MRR)', value: `₺${data.mrr.toLocaleString()}` },
  { label: 'Bu Ay Yeni', value: data.newThisMonth },
  { label: 'Churn (Bu Ay)', value: data.churnThisMonth },
  { label: 'Deneme Süreci', value: data.trialing },
]
```

`portal/src/middleware.ts` güncelleme:
```typescript
// /admin/* route'larını sadece SUPER_ADMIN rolüne aç
if (pathname.startsWith('/admin') && user.role !== 'SUPER_ADMIN') {
  return NextResponse.redirect('/dashboard')
}
```

---

## 🟡 P2 — Klinik Keşif (Sahip Uygulaması)

**Neden önemli:** Sahip uygulamasına bağımsız değer katar. Klinik tarafını büyütür.

`mobile/app/(tabs)/discover/index.tsx` — yeni ekran:
```tsx
// Google Maps entegrasyonu (react-native-maps)
// Yakınımdaki e-Pati kullanan klinikler
// Filtreler: mesafe, tür (kedi/köpek/kuş uzmanı)
// Klinik kartı: ad, adres, telefon, randevu al
```

`mobile/app/(tabs)/_layout.tsx` güncelleme:
```tsx
{ name: 'discover', title: 'Keşfet', icon: 'map-outline' }
```

---

## 🟡 P2 — Yeni Hekim İndirimi Akışı

**Neden önemli:** Kolayvet'in etkili müşteri kazanım taktiği.

`portal/src/app/(auth)/clinic-onboarding/page.tsx` güncelleme:
```tsx
// "Yeni mezun veya yeni açılan klinik misiniz?" checkbox
// İşaretlenirse: lisans yıl doğrulama alanı
// İlk 3 ay %50 indirim kodu otomatik uygulanır
// Coupon: YENIKINIK2026

// Banner:
// "🎉 Yeni kliniklere özel: İlk 3 ay %50 indirim — sadece ₺750/ay"
```

---

## 🟡 P2 — Gelişmiş Klinik Analitiği

**Neden önemli:** "Bu yazılım bana para kazandırıyor" dedirtir, churn önler.

`portal/src/app/(dashboard)/analytics/page.tsx` — yeni sayfa:
```tsx
// Klinikle ilgili metrikler:
// - En çok hangi tür hasta geliyor? (pasta grafik)
// - Hangi aylar yoğun? (bar chart)
// - Kayıp müşteriler: Son 6 ayda gelmeyen hastalar
// - Popüler aşılar / reçete edilen ilaçlar
// - Ortalama muayene sayısı (günlük/haftalık)
```

`portal/src/components/shared/analytics-chart.tsx` — yeni:
```tsx
// recharts veya mevcut DashboardChart'ı genişlet
// Tarih filtresi: Bu hafta / Bu ay / Son 3 ay / Özel
```

---

## 🟡 P2 — Kayıp Hasta Kampanyası

**Neden önemli:** Kliniklerin gelirini direkt etkiler.

`portal/src/app/(dashboard)/patients/campaigns/page.tsx` — yeni sayfa:
```tsx
// "Son 6 ayda gelmeyen hastalar" otomatik listesi
// Toplu WhatsApp / SMS / push bildirim gönder
// Mesaj template: "Merhaba {sahip_adi}, {hayvan_adi}'nın son ziyaretinden
//                 {süre} geçti. Kontrol randevusu almak ister misiniz?"
// Gönderim zamanlaması (şimdi / yarın sabah 9:00)
```

---

## 🟡 P2 — Sahip Uygulaması Premium

**Neden önemli:** İkinci gelir kanalı.

`mobile/app/(tabs)/profile/premium.tsx` — yeni ekran:
```tsx
// Ücretsiz: 3 hayvan, temel kayıtlar, push bildirimler
// Premium (29₺/ay): Sınırsız hayvan, dosya yedekleme,
//                   diyet takibi, sigorta belgesi saklama
// iyzico in-app purchase entegrasyonu
```

`mobile/app/(tabs)/pets/diet.tsx` — yeni ekran (premium):
```tsx
// Kilo takibi (grafik)
// Mama miktarı hesaplayıcı (tür + kilo bazlı)
// Su tüketimi hatırlatması
```

---

## 🟢 P3 — Gelecek Özellikler (6+ Ay)

### Telemedicine (Video Muayene)
```
mobile/app/(tabs)/telemedicine/
  ├── index.tsx       — veteriner listesi + randevu al
  ├── session.tsx     — video görüşme (WebRTC / Daily.co)
  └── history.tsx     — geçmiş görüşmeler
```

### Sigorta Entegrasyonu
```
mobile/app/(tabs)/insurance/
  ├── index.tsx       — mevcut sigorta bilgileri
  ├── offers.tsx      — sigorta teklifleri (Allianz, AXA)
  └── claim.tsx       — hasar bildirimi
```

### AI Semptom Asistanı
```
mobile/app/(tabs)/ai-assistant/
  ├── index.tsx       — "Hayvanınızda ne gözlemlediniz?" chat
  └── result.tsx      — "Veterinere gitmenizi öneririz çünkü..."
```

### Hayvan Marketplace
```
portal/src/app/(dashboard)/shop/
  ├── page.tsx        — klinik ürün kataloğu
  ├── orders/         — sipariş yönetimi
  └── inventory/      — stok takibi
```

---

## Teknik Borç ve Altyapı

### Kısa Vadeli

- [ ] `portal/src/services/subscription.service.ts` — abonelik API çağrıları
- [ ] `portal/src/services/whatsapp.service.ts` — WhatsApp API çağrıları  
- [ ] `portal/src/services/appointments.service.ts` — randevu CRUD
- [ ] `mobile/services/appointments.service.ts` — mobil randevu
- [ ] `portal/src/hooks/use-appointments.ts` — TanStack Query hooks
- [ ] iyzico SDK kurulumu: `npm install iyzipay`
- [ ] react-big-calendar kurulumu: `npm install react-big-calendar`

### Orta Vadeli

- [ ] Analytics için chart kütüphanesi genişletmesi (recharts mevcut)
- [ ] react-native-maps kurulumu (klinik keşif için)
- [ ] WebRTC altyapısı (telemedicine için)
- [ ] In-app purchase (RevenueCat veya doğrudan App Store/Play)

### Test Gereksinimleri

- [ ] Ödeme akışı E2E testi (iyzico sandbox)
- [ ] Randevu CRUD unit testleri
- [ ] WhatsApp template gönderim testi
- [ ] Abonelik durumu middleware testi

---

## Öncelik Sırası Özeti

```
Ay 1:  Abonelik/ödeme sistemi + 14 gün deneme akışı
Ay 2:  Randevu sistemi + Admin paneli
Ay 3:  WhatsApp entegrasyonu
Ay 4:  Klinik analitiği + Kayıp hasta kampanyası
Ay 5:  Klinik keşif + Sahip premium
Ay 6+: Telemedicine / AI / Marketplace
```

---

## Notlar

- WhatsApp Business API için Meta Business hesabı ve onaylı işletme doğrulaması gerekiyor (~1-2 hafta süreç)
- iyzico entegrasyonu için sandbox hesabı açıp test edilebilir: dev.iyzipay.com
- Randevu sistemi backend'de yeni bir `appointments` modülü gerektiriyor (Erol)
- Admin paneli için backend'de `/admin/*` endpoint'leri gerekiyor (Erol)

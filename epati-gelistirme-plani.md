# e-Pati — Evcil Hayvan Sağlık Uygulaması: Kapsamlı Geliştirme Planı

> Türkiye'nin e-Nabız sisteminden ilham alınarak tasarlanan, veteriner kliniklerindeki tüm sağlık verilerinin evcil hayvan sahiplerinin telefonuna güvenli biçimde aktarıldığı mobil uygulama.

---

## İçindekiler

1. [Proje Vizyonu ve Pazar Analizi](#1-proje-vizyonu-ve-pazar-analizi)
2. [Ürün Mimarisi](#2-ürün-mimarisi)
3. [Aşama 1 — Keşif ve Tasarım](#3-aşama-1--keşif-ve-tasarım)
4. [Aşama 2 — Backend ve API](#4-aşama-2--backend-ve-api)
5. [Aşama 3 — Mobil Uygulama (Sahip Tarafı)](#5-aşama-3--mobil-uygulama-sahip-tarafı)
6. [Aşama 4 — Klinik Web Portalı](#6-aşama-4--klinik-web-portalı)
7. [Aşama 5 — Güvenlik, KVKK ve Uyumluluk](#7-aşama-5--güvenlik-kvkk-ve-uyumluluk)
8. [Aşama 6 — Test, Beta ve Yayın](#8-aşama-6--test-beta-ve-yayın)
9. [Aşama 7 — Büyüme ve Monetizasyon](#9-aşama-7--büyüme-ve-monetizasyon)
10. [Ekip ve Kaynak Planlaması](#10-ekip-ve-kaynak-planlaması)
11. [Zaman Çizelgesi](#11-zaman-çizelgesi)
12. [Risk Analizi](#12-risk-analizi)
13. [Teknoloji Referans Kartı](#13-teknoloji-referans-kartı)

---

## 1. Proje Vizyonu ve Pazar Analizi

### Vizyon

e-Pati, bir evcil hayvanın doğumundan ömrünün sonuna kadar tüm sağlık geçmişini dijital ortamda tutmayı, her veteriner ziyaretinden sonra sahibin telefonuna anlık olarak yansıtmayı ve aşı-ilaç takvimlerini otomatik olarak yönetmeyi hedefler. Tıpkı e-Nabız'ın insan sağlığında yaptığı gibi, evcil hayvan sağlığında da kurumsal hafıza oluşturur.

### Pazar Fırsatı

Türkiye'de yaklaşık 15 milyon kayıtlı evcil hayvan bulunmakta, yılda 40 milyonun üzerinde veteriner muayenesi gerçekleşmektedir. Mevcut klinik yazılımlarının büyük çoğunluğu yalnızca klinik içi kullanıma yönelik olup hasta sahibiyle hiçbir dijital köprü kurmamaktadır. Sektörde mobil-first, sahip odaklı bir çözüm boşluğu bulunmaktadır.

### Rakip Analiz Özeti

| Çözüm | Sahip Uygulaması | Veteriner Entegrasyonu | Türkiye Odaklı |
|---|---|---|---|
| VetPocket (global) | Var | Kısmi | Hayır |
| PetDesk (ABD) | Var | Yüksek | Hayır |
| Mevcut TR Klinik Yazılımları | Yok | İç kullanım | Evet |
| **e-Pati (hedef)** | **Var** | **Tam** | **Evet** |

### Değer Önerisi

Veteriner klinikleri için: hasta takibini kolaylaştırır, sahiplerle güvenilir iletişim kanalı sağlar, klinik imajını güçlendirir.

Evcil hayvan sahipleri için: tüm sağlık geçmişi tek ekranda, aşı takvimi otomatik hatırlatmalı, acil durumda hızlı erişim.

---

## 2. Ürün Mimarisi

### Bileşenler

```
┌─────────────────────────────────────────────────────┐
│                   İstemci Katmanı                   │
│  [Mobil Uygulama]        [Klinik Web Portalı]       │
│  iOS + Android            Next.js — veteriner UI    │
└──────────────────┬────────────────────┬─────────────┘
                   │                    │
┌──────────────────▼────────────────────▼─────────────┐
│                    API Gateway                      │
│    Kimlik doğrulama · Rate limiting · TLS 1.3       │
└─────┬────────┬──────────┬──────────┬────────────────┘
      │        │          │          │
   [Auth]  [Sağlık    [Bildirim  [Dosya
   Servis   API]      Servisi]   Servisi]
      │        │          │          │
┌─────▼────────▼──────────▼──────────▼────────────────┐
│                   Veri Katmanı                      │
│    PostgreSQL     Redis Cache      S3 / Blob        │
│    Ana kayıtlar   Oturum/Cache     PDF · Görüntü    │
└─────────────────────────────────────────────────────┘
```

### Veri Modeli (Ana Tablolar)

```sql
-- Temel varlıklar
Owner         (id, ad, soyad, telefon, email, adres, kvkk_onay_tarihi)
Pet           (id, owner_id, ad, tur, cins, cinsiyet, dogum_tarihi, mikrocip_no, fotograf_url)
Clinic        (id, ad, adres, telefon, lisans_no, aktif)
Veterinarian  (id, clinic_id, ad, unvan, lisans_no)

-- Sağlık kayıtları
Examination   (id, pet_id, vet_id, tarih, sikayet, bulgular, tani, notlar, takip_tarihi)
Vaccination   (id, pet_id, vet_id, asi_adi, uygulanma_tarihi, sonraki_tarih, seri_no, uretici)
Prescription  (id, examination_id, vet_id, tarih, notlar)
Medication    (id, prescription_id, ilac_adi, doz, frekans, sure, talimat)
LabResult     (id, pet_id, vet_id, test_tipi, tarih, sonuc_dosya_url, yorum)

-- Sistem
Notification  (id, pet_id, owner_id, tip, baslik, mesaj, gonderim_tarihi, okundu)
AuditLog      (id, kullanici_id, aksiyon, kaynak_tip, kaynak_id, timestamp, ip_adresi)
```

---

## 3. Aşama 1 — Keşif ve Tasarım

**Süre:** Hafta 1–4  
**Hedef:** Ürünün temellerini sağlamlaştırmak; gerçek kullanıcı ihtiyaçlarını belgelemek.

### 1.1 Kullanıcı Araştırması

Aşağıdaki iki ana kullanıcı grubundan veri toplanmalıdır:

**Veteriner klinikleri ile görüşmeler (en az 8 klinik)**

Keşfedilmesi gereken konular:
- Mevcut hasta kayıt sistemi nasıl çalışıyor? (kağıt mı, yazılım mı?)
- Sahiplerle nasıl iletişim kuruluyor? (telefon, WhatsApp?)
- Hangi bilgileri dijital olarak paylaşmak isterlerdi?
- Yeni bir sisteme geçiş için hangi engeller var?

**Evcil hayvan sahipleriyle görüşmeler (en az 20 kişi)**

- Evcil hayvanlarının sağlık geçmişini nasıl takip ediyorlar?
- Bir veteriner ziyaretinden sonra hangi bilgilere ihtiyaç duyuyorlar?
- Aşı hatırlatmalarını nasıl yönetiyorlar?
- Veri gizliliği konusundaki hassasiyetleri neler?

### 1.2 Kullanıcı Hikayeleri (User Stories)

**Evcil Hayvan Sahibi:**

- Bir kullanıcı olarak, köpeğimin tüm aşı geçmişini tek ekranda görmek istiyorum; böylece seyahat belgelerini hazırlarken zaman kaybetmeyeyim.
- Bir kullanıcı olarak, veteriner muayenesi bittikten sonra doktorun notlarını telefonumda okumak istiyorum; sözlü açıklamaları unutmayalım.
- Bir kullanıcı olarak, kedimin ilaç saatlerinde bildirim almak istiyorum; dozu kaçırmayayım.
- Bir kullanıcı olarak, hayvanımın sağlık özetini başka bir veterinere QR kod ile göstermek istiyorum.

**Veteriner:**

- Bir veteriner olarak, hastanın geçmiş muayene notlarına hızla erişmek istiyorum; anamnez toplama sürecini kısaltayım.
- Bir veteriner olarak, yazdığım reçeteyi otomatik olarak sahibin telefonuna iletmek istiyorum.
- Bir veteriner olarak, takip zamanı gelen hastalara sistem tarafından otomatik hatırlatma gönderilmesini istiyorum.

### 1.3 UX Tasarımı

**Araç: Figma**

Tasarım sürecinde şu akışlar öncelikli olarak çalışılmalıdır:

Mobil uygulama akışları:
- Kayıt ve kimlik doğrulama akışı
- Evcil hayvan profili oluşturma
- Ana sayfa ve sağlık özeti
- Aşı takvimi görünümü
- Muayene geçmişi detay sayfası
- Bildirim merkezi
- QR kod paylaşım ekranı

Klinik portal akışları:
- Veteriner girişi
- Hasta arama ve profil görüntüleme
- Yeni muayene kaydı oluşturma (SOAP formatında)
- Aşı ve reçete yazma
- Laboratuvar sonucu yükleme

**Tasarım sistemi kuralları:**

Tutarlı bir ürün için baştan şunlar tanımlanmalıdır: renk paleti, tipografi skalası, spacing sistemi, bileşen kütüphanesi (buton, kart, form elemanları, modal), ikon seti. Mobil uygulama için iOS Human Interface Guidelines ve Android Material Design 3 kılavuzlarına uyulmalıdır.

### 1.4 KVKK Ön Analizi

Bir hukuk danışmanıyla birlikte aşağıdaki belgeler hazırlanmalıdır:

- Veri işleme envanteri: hangi veri toplanıyor, neden, ne kadar süre saklanıyor
- Gizlilik politikası taslağı
- Kliniklerle imzalanacak veri işleme sözleşmesi (VİS) taslağı
- Uygulama içi açık rıza metinleri

### 1.5 Teknik Mimari Kararları

Bu aşamada şu kararlar netleştirilmelidir:

- Monolith mi, mikroservis mi? (başlangıç için modüler monolit önerilir)
- Bulut sağlayıcı: AWS mi, GCP mi, Türkiye'de Yandex Cloud / yerel bir sağlayıcı mı? (KVKK açısından veri yerlilik değerlendirmesi yapılmalı)
- Mobil: React Native + Expo mu, Flutter mı?
- Gerçek zamanlı bildirim: WebSocket mi, SSE mi, yoksa yalnızca push mı?

---

## 4. Aşama 2 — Backend ve API

**Süre:** Hafta 5–12  
**Hedef:** Tüm iş mantığının çalıştığı sağlam, güvenli, ölçeklenebilir bir API katmanı.

### 4.1 Teknoloji Seçimi

```
Runtime:       Node.js 20 LTS
Framework:     NestJS (modüler yapı, TypeScript, decorator tabanlı)
ORM:           Prisma (tip güvenli sorgular, migration yönetimi)
Veritabanı:    PostgreSQL 15 (ACID, JSON desteği, tam metin arama)
Cache:         Redis 7 (oturum, rate limit, bildirim kuyruğu)
Dosya:         AWS S3 veya MinIO (self-hosted seçenek)
Kuyruk:        BullMQ + Redis (e-posta/SMS/push işleri)
Dökümantasyon: Swagger (OpenAPI 3.0) — otomatik oluşturulur
```

### 4.2 API Modülleri

**Auth Modülü**

```
POST /auth/register          → Yeni sahip kaydı
POST /auth/login             → JWT erişim + yenileme token
POST /auth/refresh           → Token yenileme
POST /auth/logout            → Token geçersizleştirme
POST /auth/clinic/login      → Klinik personel girişi (ayrı havuz)
POST /auth/forgot-password   → Şifre sıfırlama e-postası
POST /auth/reset-password    → Yeni şifre belirleme
```

**Pets Modülü**

```
GET    /pets                 → Sahibin hayvanları
POST   /pets                 → Yeni hayvan ekle
GET    /pets/:id             → Hayvan profili
PATCH  /pets/:id             → Profil güncelle
DELETE /pets/:id             → Hayvanı sil (soft delete)
GET    /pets/:id/summary     → Sağlık özeti (son muayene, aktif ilaçlar, yaklaşan aşılar)
GET    /pets/:id/qr          → QR kod verisi oluştur
```

**Examinations Modülü**

```
GET    /examinations?petId=  → Muayene listesi (sayfalandırmalı)
POST   /examinations         → Yeni muayene (vet yetkisi)
GET    /examinations/:id     → Muayene detayı
PATCH  /examinations/:id     → Muayene güncelle (vet yetkisi)
```

**Vaccinations Modülü**

```
GET    /vaccinations?petId=  → Aşı geçmişi
POST   /vaccinations         → Yeni aşı kaydı (vet yetkisi)
GET    /vaccinations/upcoming → Yaklaşan aşılar (7/30 gün filtresi)
PATCH  /vaccinations/:id     → Aşı güncelle
```

**Prescriptions & Medications Modülü**

```
POST   /prescriptions        → Reçete oluştur (vet yetkisi)
GET    /prescriptions/:id    → Reçete detayı + ilaçlar
GET    /prescriptions/:id/pdf → Reçete PDF indir
```

**Lab Results Modülü**

```
POST   /lab-results          → Tahlil sonucu yükle (dosya + yorum)
GET    /lab-results?petId=   → Tahlil listesi
GET    /lab-results/:id/file → Dosya indir (imzalı URL)
```

**Notifications Modülü**

```
GET    /notifications        → Kullanıcı bildirimleri
PATCH  /notifications/:id/read → Okundu işaretle
POST   /notifications/preferences → Bildirim tercihleri
```

**Clinics Modülü (Admin + Vet)**

```
GET    /clinics/:id/patients → Klinik hasta listesi
GET    /clinics/:id/dashboard → Günlük özet istatistikler
```

### 4.3 Kimlik Doğrulama ve Yetkilendirme

Sistemde üç farklı rol bulunmaktadır:

- `OWNER` — Yalnızca kendi hayvanlarının verilerini okuyabilir
- `VETERINARIAN` — Kliniğine kayıtlı hayvanların verilerini okuyabilir ve yazabilir
- `CLINIC_ADMIN` — Klinik personelini yönetir, raporlara erişir
- `SUPER_ADMIN` — Sistem geneli yönetim (platform operatörü)

Her endpoint, NestJS Guard'ları aracılığıyla rol kontrolü uygular. Bir sahibin başka bir sahibin hayvan verilerine erişmesi teknik olarak engellenmiş olmalıdır.

```typescript
// Örnek: Hayvan kaydına erişim kontrolü
@Get(':id')
@Roles(Role.OWNER, Role.VETERINARIAN)
async getPet(@Param('id') id: string, @CurrentUser() user: User) {
  return this.petsService.findOne(id, user);
  // Service katmanında: sahibi veya kliniği eşleşiyor mu kontrol edilir
}
```

### 4.4 Bildirim Sistemi

Üç kanallı bildirim mimarisi:

**Push Bildirimleri (Firebase Cloud Messaging)**

Aşağıdaki tetikleyicilerde gönderilir:
- Muayene notu eklendiğinde
- Reçete oluşturulduğunda
- Yeni laboratuvar sonucu yüklendiğinde
- Aşı tarihi yaklaştığında (7 gün, 1 gün önce)
- İlaç saati geldiğinde (kullanıcı isteğe bağlı ayarlar)

**SMS (Netgsm veya İleti Merkezi)**

Kritik hatırlatmalar için yedek kanal. Kullanıcı push bildirimi kapatsa bile aşı hatırlatması ulaşır.

**E-posta (Resend veya AWS SES)**

Reçete PDF'i, muayene özeti, hesap işlemleri.

### 4.5 Dosya Yönetimi

Yüklenen tüm dosyalar (laboratuvar sonuçları, röntgen görüntüleri, belgeler) doğrudan S3'e gider. İstemciye hiçbir zaman kalıcı URL dönmez; bunun yerine 15 dakika geçerli imzalı (presigned) URL kullanılır. Bu, yetkisiz erişimi teknik olarak engeller.

```
Yükleme akışı:
1. İstemci → API: "Bu dosyayı yükleyeceğim"
2. API → S3: Presigned upload URL al
3. API → İstemci: Upload URL'yi döndür
4. İstemci → S3: Dosyayı doğrudan yükle (API üzerinden geçmez)
5. İstemci → API: "Yükleme tamamlandı"
6. API: Veritabanına dosya referansını kaydet

İndirme akışı:
1. İstemci → API: Dosyayı istiyorum
2. API: Kullanıcı yetkisi kontrol et
3. API → S3: Presigned download URL al (15 dk geçerli)
4. API → İstemci: Geçici URL'yi döndür
5. İstemci → S3: Dosyayı doğrudan indir
```

### 4.6 TÜRKVET Entegrasyonu (Opsiyonel)

Tarım ve Orman Bakanlığı'nın TÜRKVET sistemi; hayvan tanımlama, mikro çip ve veteriner lisans kayıtlarını tutar. Bu entegrasyon sağlanabilirse:

- Mikro çip numarasıyla hayvan ve sahibi doğrulama
- Veteriner lisanslarını sistem üzerinden teyit etme
- Resmi sağlık sertifikası bağlantısı

Bu entegrasyonun teknik ve yasal gereksinimleri için Bakanlık ile yazışma süreci başlatılmalıdır.

---

## 5. Aşama 3 — Mobil Uygulama (Sahip Tarafı)

**Süre:** Hafta 9–18 (backend ile paralel)  
**Hedef:** Sahiplerin günlük hayatına giren, vazgeçilmez bir uygulama.

### 5.1 Teknoloji Seçimi

```
Framework:     React Native 0.74+ + Expo SDK 51
Dil:           TypeScript
Navigation:    React Navigation 6 (Stack + Tab + Modal)
State:         Zustand (global) + React Query (sunucu durumu)
Form:          React Hook Form + Zod
Stil:          NativeWind (Tailwind benzeri RN utility sınıfları)
Animasyon:     React Native Reanimated 3
Bildirim:      Expo Notifications
Kamera:        Expo Camera (hayvan fotoğrafı, QR okuma)
Dosya:         Expo Document Picker + expo-file-system
PDF:           react-native-pdf
Güvenli Depo:  expo-secure-store (token saklamak için — AsyncStorage yasak)
```

### 5.2 Ekran Yapısı

**Auth Akışı**

```
Splash Screen
  → Onboarding (3 sayfa — değer önermesi tanıtımı)
    → Kayıt (ad, soyad, telefon, e-posta, şifre)
      → Telefon doğrulama (OTP)
        → KVKK onay ekranı (açık rıza metni)
          → Ana akış

  → Giriş
    → Şifremi Unuttum → OTP → Yeni Şifre
```

**Ana Sekme Yapısı**

```
Tab 1 — Hayvanlarım
  ├── Hayvan listesi (kart görünümü)
  ├── Hayvan detay sayfası
  │     ├── Profil (fotoğraf, tür, cins, yaş, mikro çip)
  │     ├── Sağlık özeti (son muayene, aktif ilaçlar, aşı durumu)
  │     ├── Muayene geçmişi
  │     ├── Aşı kartı
  │     ├── Reçeteler ve ilaçlar
  │     └── Laboratuvar sonuçları
  └── Yeni hayvan ekle

Tab 2 — Takvim
  ├── Aşı tarihleri
  ├── İlaç takibi (günlük görünüm)
  └── Kontrol randevuları

Tab 3 — Bildirimler
  └── Tüm sistem bildirimleri (okunmuş/okunmamış)

Tab 4 — Profil
  ├── Hesap bilgileri
  ├── Bildirim tercihleri
  ├── KVKK ayarları
  └── Yardım ve destek
```

### 5.3 Öne Çıkan Özellikler

**Aşı Kartı ve QR Paylaşım**

Evcil hayvan sahibi, hayvanının aşı durumunu içeren dijital bir kart oluşturabilir. Bu kart QR kod olarak paylaşılır. Pet oteli, pansiyon veya bir başka veteriner klinikteki okuyucu uygulamasıyla taranan QR kod, o hayvanın aşı özetini gösterir. Kod şifreli ve süresi dolabilen bir token taşır; bu sayede kalıcı veri ifşası olmaz.

**Çevrimdışı Erişim**

Evcil hayvanın temel sağlık bilgileri (son muayene, aktif ilaçlar, acil durum notları) cihazda şifreli biçimde önbelleğe alınır. İnternet bağlantısı olmadığında da kritik bilgilere erişilebilir. Önbellek her oturumda yenilenir ve uygulama kapatıldığında hassas veriler bellekten temizlenir.

**Akıllı Hatırlatmalar**

Kullanıcı tercihine göre yapılandırılabilir bildirim sistemi: aşı tarihleri için 30 gün, 7 gün ve 1 gün öncesi; günlük ilaç hatırlatmaları seçilen saat(ler)de; takip muayenesi tarihleri için önceden uyarı. Bildirime tıklamak, ilgili hayvanın ilgili kaydını doğrudan açar.

**PDF Görüntüleyici**

Veteriner tarafından yüklenen laboratuvar sonuçları, röntgen görüntüleri ve muayene belgeleri uygulama içinde açılır. Kullanıcı isterse paylaşabilir, isterse cihazına kaydedebilir.

### 5.4 Performans ve Kalite Standartları

Mobil uygulamanın teslim kalitesi şu kriterleri karşılamalıdır:

- İlk ekran açılış süresi: soğuk başlangıçta 2 saniyenin altında
- Liste performansı: 1000 kayıt bulunan bir geçmiş listesini 60fps ile kaydırma
- Paket boyutu: başlangıç paketi 20MB'ın altında (Expo kodu bölme ile)
- Erişilebilirlik: VoiceOver (iOS) ve TalkBack (Android) uyumluluğu
- iOS ve Android'de aynı kullanıcı deneyimi

---

## 6. Aşama 4 — Klinik Web Portalı

**Süre:** Hafta 13–20  
**Hedef:** Veterinerlerin mevcut iş akışlarına sorunsuz entegre olan, pratik bir hasta yönetim arayüzü.

### 6.1 Teknoloji Seçimi

```
Framework:     Next.js 14 (App Router)
Dil:           TypeScript
Stil:          Tailwind CSS + shadcn/ui
Form:          React Hook Form + Zod
Veri:          React Query (TanStack Query)
Tablo:         TanStack Table
Editör:        TipTap (muayene notları için zengin metin)
PDF:           react-pdf/renderer (reçete oluşturma)
Grafik:        Recharts (hasta istatistikleri)
```

### 6.2 Portal Ekranları

**Giriş ve Pano**

Klinik yöneticisi veya veteriner giriş yaptığında karşılaştığı ana pano şunları gösterir:
- Bugünkü muayene sayısı
- Bugün aşı yapılan hayvan sayısı
- Bu hafta takip zamanı gelen hastalar
- Son eklenen kayıtlar
- Bekleyen laboratuvar sonuçları

**Hasta Arama**

Hasta listesi mikro çip numarası, hayvan adı, sahip adı veya soyadıyla aranabilir. Sonuçlar son muayene tarihine göre sıralanır. Her hasta kartında tür, cins, sahip adı ve son ziyaret tarihi görünür.

**Hasta Profili**

Seçilen hayvanın detay sayfasında sekme yapısıyla şunlara erişilir:

- Genel bilgiler ve profil fotoğrafı
- Kronolojik muayene geçmişi
- Aşı takibi ve takvim
- Aktif ve geçmiş reçeteler
- Laboratuvar sonuçları ve dosyalar
- Sahip iletişim bilgileri

**Yeni Muayene Kaydı**

Veterinere yönelik muayene formu SOAP formatında tasarlanır:

- Şikayet (Subjective): Sahip tarafından bildirilen belirtiler
- Bulgular (Objective): Fiziksel muayene bulguları, vital değerler
- Değerlendirme (Assessment): Tanı ve ayırıcı tanılar
- Plan (Plan): Tedavi planı, reçete, takip talimatları

Form, kısmi kaydetme destekler. Veteriner muayene sırasında not alabilir, muayene bittikten sonra tamamlar. Kayıt tamamlandığında sahibe otomatik push bildirimi gönderilir.

**Reçete Yazımı**

Veteriner reçete modülünde:

İlaç adı yazılırken otomatik tamamlama önerileri gelir. Her ilaca doz, frekans, süre ve özel talimat girilir. Reçete kaydedildiğinde hem veritabanına yazılır hem de PDF oluşturulur; PDF S3'e yüklenir ve sahibin telefonuna bildirim gider.

**Aşı Modülü**

Aşı kaydı; aşı adı (standart liste), uygulama tarihi, seri numarası, üretici ve bir sonraki doz tarihi alanlarını içerir. Kayıt tamamlandığında sistem, sonraki doz için otomatik hatırlatma planlar.

### 6.3 Klinik Onboarding Akışı

Yeni bir klinik platforma katılmak istediğinde şu adımlar izlenir:

1. Klinik yöneticisi kayıt formu doldurur (klinik bilgileri, lisans numarası)
2. Platform ekibi lisansı doğrular (TÜRKVET veya barolar üzerinden)
3. Klinik hesabı aktive edilir
4. Klinik yöneticisi veteriner hesapları oluşturur
5. Veterinerlere eğitim materyalleri (video + dokümantasyon) gönderilir
6. 30 günlük ücretsiz deneme başlar

---

## 7. Aşama 5 — Güvenlik, KVKK ve Uyumluluk

**Süre:** Tüm geliştirme boyunca paralel — yayın öncesi audit haftaları: Hafta 19–21

### 7.1 Teknik Güvenlik Önlemleri

**Veri Şifreleme**

Tüm veriler iki katmanda korunur:

Aktarım sırasında TLS 1.3 kullanılır; eski protokollere (TLS 1.0, 1.1) izin verilmez. HTTP istekleri HTTPS'e yönlendirilir.

Depolama sırasında veritabanındaki hassas alanlar (tanı notları, ilaç bilgileri, laboratuvar sonuçları) uygulama katmanında AES-256 ile şifrelenir. Şifreleme anahtarları veritabanında değil, ayrı bir anahtar yönetim servisinde (AWS KMS veya HashiCorp Vault) tutulur.

**Kimlik ve Erişim Güvenliği**

- JWT erişim tokenları kısa ömürlüdür (15 dakika)
- Yenileme tokenları HTTP-only cookie içinde tutulur (JavaScript erişimi yok)
- Başarısız giriş denemelerinde rate limiting (5 denemede geçici kilitleme)
- Veteriner hesapları için iki faktörlü doğrulama zorunlu
- Tüm API çağrıları için istek günlükleri tutulur

**Uygulama Güvenliği**

- SQL enjeksiyonu: Prisma ORM parametrik sorgularla otomatik engeller
- XSS: Next.js ve React varsayılan kaçış (escape) mekanizmaları
- CSRF: SameSite cookie + CSRF token double-submit
- API rate limiting: IP başına ve kullanıcı başına ayrı limitler
- Dosya yükleme güvenliği: MIME type kontrolü, boyut sınırı, virüs taraması (ClamAV)
- Bağımlılık güvenliği: `npm audit` + GitHub Dependabot otomatik tarama

### 7.2 KVKK Uyumluluk Çerçevesi

**Hukuki Dayanak**

6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında evcil hayvan sağlık verileri, sahibinin sağlık verisiyle dolaylı ilişkili olabileceğinden özel nitelikli kişisel veri kategorisine yakın değerlendirilebilir. Güçlü koruma önlemleri alınmalıdır.

**Açık Rıza Yönetimi**

Uygulama içinde kullanıcıya şu ayrımlar net biçimde sunulur:

- Temel hizmet için zorunlu veri işleme onayı
- Hatırlatma bildirimleri için ayrı onay
- Anonim analitik kullanım için ayrı onay
- Üçüncü taraf entegrasyonlar için ayrı onay

Her onay; tarih, saat ve metin sürümüyle birlikte loglanır. Kullanıcı istediği zaman onayı geri alabilir ve verilerinin silinmesini talep edebilir (unutulma hakkı).

**Kliniklerle Veri İşleme Sözleşmesi**

Platform, KVKK açısından veri işleyen konumundadır; klinikler ise veri sorumlusudur. Bu nedenle her klinikle imzalanacak sözleşmede şunlar yer almalıdır:

- İşlenecek veri kategorileri ve amaçları
- Veri saklama süreleri
- Güvenlik önlemleri taahhüdü
- Veri ihlali bildirim yükümlülükleri (72 saat kuralı)
- Veri silme ve imha prosedürleri

**Veri Saklama ve İmha**

- Aktif kullanıcı verileri: hesap aktif olduğu sürece
- Pasif hesaplar: son işlem tarihinden itibaren 5 yıl (veteriner kayıt gereksinimleri)
- Silme talebi: kullanıcı verisi 30 gün içinde kalıcı olarak silinir
- Yedekler: 90 günde otomatik imha

### 7.3 Güvenlik Denetimi

Yayın öncesinde üç aşamalı denetim:

1. Otomatik statik analiz: Semgrep, Snyk, OWASP Dependency Check
2. Manuel penetrasyon testi: bağımsız güvenlik firması (OWASP Top 10, API güvenliği, mobil güvenlik)
3. Kod incelemesi: kritik güvenlik modülleri (auth, şifreleme) başka bir kıdemli geliştirici tarafından gözden geçirilir

---

## 8. Aşama 6 — Test, Beta ve Yayın

**Süre:** Hafta 20–24

### 8.1 Test Stratejisi

Üç katmanlı test piramidi izlenir:

**Birim Testleri (Unit Tests)**

Her servis ve yardımcı fonksiyon için yazılır. Hedef kapsam: yüzde seksen ve üzeri. Araç: Jest.

```typescript
// Örnek: Aşı hatırlatma zamanlaması testi
describe('VaccinationReminderService', () => {
  it('7 gün kala hatırlatma gönderilmeli', async () => {
    const vaccination = { nextDate: addDays(new Date(), 7) };
    expect(service.shouldSendReminder(vaccination, 7)).toBe(true);
  });

  it('Tarihi geçmiş aşılar için hatırlatma gönderilmemeli', async () => {
    const vaccination = { nextDate: subDays(new Date(), 1) };
    expect(service.shouldSendReminder(vaccination, 7)).toBe(false);
  });
});
```

**Entegrasyon Testleri**

Tüm API endpoint'leri gerçek veritabanı bağlantısıyla test edilir (test veritabanı). Araç: Supertest + Jest.

Kritik akışlar:

- Kayıt → Giriş → Token yenileme döngüsü
- Muayene kaydı oluşturma ve sahibine bildirim ulaşması
- Yetkisiz erişim girişimlerinin engellenmesi
- Dosya yükleme ve presigned URL akışı

**Uçtan Uca Testler (E2E)**

Gerçek kullanıcı senaryoları otomatikleştirilir.

Mobil için Detox:

- Kullanıcı kaydı ve giriş akışı
- Hayvan profili oluşturma
- Bildirim alınması ve ilgili ekrana yönlendirme

Web portal için Playwright:

- Veteriner girişi ve hasta arama
- Muayene kaydı oluşturma
- Reçete yazma ve PDF indirme

### 8.2 Beta Programı

**Pilot klinik seçimi:**

İdeal beta katılımcısı: farklı büyüklüklerde (1 veteriner, 5 veteriner, 10+ veteriner) ve farklı şehirlerde (İstanbul, Ankara, İzmir) klinikler. Hedef: 10 klinik, toplam 500 evcil hayvan sahibi.

**Beta süreci:**

- Hafta 1–2: Klinik kurulumu ve veteriner eğitimi
- Hafta 3–6: Aktif kullanım
- Haftalık: 30 dakikalık geri bildirim görüşmeleri
- Hafta 7: Geri bildirim konsolidasyonu ve önceliklendirmesi
- Hafta 8: Kritik düzeltmeler ve son iyileştirmeler

**Başarı kriterleri:**

- Veterinerlerin yüzde sekseninin haftalık aktif kullanım
- Sahiplerin yüzde yetmişinin uygulama içinde en az bir bildirimi açması
- Kritik hata (crash) oranının yüzde birin altında kalması
- Ortalama kullanıcı memnuniyeti puanının 4,2 üzeri (5 üzerinden)

### 8.3 App Store ve Google Play Yayını

**Apple App Store gereksinimleri:**

- Gizlilik manifesti (Privacy Manifest) — iOS 17 sonrası zorunlu
- Uygulama takip şeffaflığı izni (ATT) — analitik kullanılıyorsa
- Sağlık ve tıp kategorisi kılavuz incelemeleri
- KVKK uyumlu gizlilik politikası URL'si

**Google Play gereksinimleri:**

- Veri güvenliği bölümü doldurulması (tam ve doğru)
- Hedef API seviyesi güncelliği
- 64-bit destek
- Uygulama içi satın alma varsa ödeme politikası uyumu

**Sürüm yönetimi:**

Semantik versiyonlama (MAJOR.MINOR.PATCH) kullanılır. Her yayın için değişiklik notları Türkçe ve İngilizce hazırlanır. Kritik hatalar için hızlı yama (hotfix) süreci tanımlanır.

---

## 9. Aşama 7 — Büyüme ve Monetizasyon

**Süre:** Yayın sonrası — devam eden

### 9.1 Monetizasyon Modeli

**Klinik Aboneliği (B2B — Ana Gelir Kaynağı)**

| Plan | Kapsam | Aylık Ücret (önerilen) |
|---|---|---|
| Starter | 1 veteriner, 200 aktif hasta | 299 TL |
| Professional | 5 veteriner, sınırsız hasta | 799 TL |
| Enterprise | Sınırsız veteriner, çoklu şube | Görüşmeye göre |

Yıllık ödemeye yüzde yirmi indirim. İlk 30 gün ücretsiz.

**Sahip Uygulaması (B2C — Freemium)**

Temel özellikler tamamen ücretsiz: kayıt görüntüleme, bildirim alma, QR kart. Premium özellikler aylık 29 TL: sınırsız hayvan, dosya yedekleme, gelişmiş ilaç takibi, veteriner randevu hatırlatması.

**Ek Gelir Fırsatları (Orta Vadeli)**

- Veteriner direktörü — yakındaki kliniği bul, randevu al (klinikten yönlendirme komisyonu)
- Evcil hayvan sigortası API entegrasyonu (sigorta şirketleriyle ortaklık)
- Anonim ve toplu veri analizi (veteriner akademisi, ilaç firmalarına raporlama — KVKK uyumlu, bireylere ulaşılamaz biçimde)

### 9.2 Büyüme Stratejisi

**İlk 6 Ay — Erken Benimseme**

Klinik odaklı büyüme: Veterinerlik dernekleriyle iş birliği, kongre sponsorlukları, veteriner okulu akademisyenlerle pilot. Her kliniğe katılan yeni veteriner, sahibi uygulamaya davet eder.

**6–18 Ay — Organik Büyüme**

Sahip odaklı özellikler: Sosyal medyada paylaşılabilir aşı kartı tasarımı, arkadaş davet programı. İçerik pazarlaması: evcil hayvan sağlığı blogu, veteriner ipuçları.

**18+ Ay — Platform Genişlemesi**

- Veteriner asistanı AI özellikleri (semptomlara göre ilk yönlendirme)
- Evcil hayvan sigortası entegrasyonu
- Zincir pet shop entegrasyonu
- Bölgesel genişleme (Azerbaycan, Orta Doğu)

### 9.3 Temel Metrikler (KPI)

- Aktif klinik sayısı (aylık)
- Kayıtlı evcil hayvan sayısı
- Mobil uygulama günlük aktif kullanıcı (DAU)
- Bildirim açma oranı
- Abonelik iptali (churn) oranı
- Ortalama klinik başına aylık kayıt sayısı
- Net Promoter Score (NPS)

---

## 10. Ekip ve Kaynak Planlaması

### Minimum Uygulanabilir Ekip (MVP için)

| Rol | Adet | Sorumluluk |
|---|---|---|
| Backend Geliştirici | 1–2 | NestJS API, veritabanı, güvenlik |
| Mobil Geliştirici | 1–2 | React Native uygulama |
| Frontend Geliştirici | 1 | Next.js klinik portalı |
| UI/UX Tasarımcı | 1 | Figma tasarımları, kullanıcı araştırması |
| Ürün Yöneticisi | 1 | Önceliklendirme, stakeholder yönetimi |
| DevOps (part-time) | 0,5 | Altyapı, CI/CD, monitoring |

### Dış Kaynaklar

- Hukuk danışmanı: KVKK uyumluluk belgelemeleri için
- Güvenlik danışmanı: yayın öncesi penetrasyon testi için
- Veteriner danışman: domain uzmanlığı, klinik iş akışı doğrulaması için

---

## 11. Zaman Çizelgesi

```
Ay 1        Ay 2        Ay 3        Ay 4        Ay 5        Ay 6
├────────────┼───────────┼───────────┼───────────┼───────────┤
│ Aşama 1   │           │           │           │           │
│ Keşif &   │           │           │           │           │
│ Tasarım   │           │           │           │           │
│           │ Aşama 2   │ Aşama 2   │           │           │
│           │ Backend   │ Backend   │           │           │
│           │           │ Aşama 3   │ Aşama 3   │           │
│           │           │ Mobil     │ Mobil     │           │
│           │           │ Aşama 4   │ Aşama 4   │           │
│           │           │ Portal    │ Portal    │           │
│           │           │           │ Aşama 5   │           │
│           │           │           │ Güvenlik  │           │
│           │           │           │           │ Aşama 6   │
│           │           │           │           │ Beta &    │
│           │           │           │           │ Yayın     │
└────────────┴───────────┴───────────┴───────────┴───────────┘
                                                 ↑
                                            Yayın: Ay 6
```

---

## 12. Risk Analizi

### Yüksek Riskler

**Klinik benimseme direnci**

Risk: Veterinerler mevcut alışkanlıklarını değiştirmek istemeyebilir.

Çözüm: Çok adımlı onboarding, kağıt tabanlı iş akışından dijitale geçişi kolaylaştıran içe aktarma araçları, ilk 3 ay ücretsiz destek.

**KVKK uyumsuzluk**

Risk: Veri ihlali veya regülasyon cezaları ürünü durdurabilir.

Çözüm: Baştan hukuk danışmanıyla çalışmak, privacy by design mimarisi, yayın öncesi bağımsız denetim.

**Veri bütünlüğü**

Risk: Veteriner hatalı kayıt girerse sahibi yanlış yönlendirebilir.

Çözüm: Tüm kayıtlarda giriş yapan veteriner ve zaman damgası, düzenleme geçmişi, sorumluluk reddi beyanı (platform aracı, tanı sorumluluğu veterinere ait).

### Orta Riskler

**Rekabet**

Risk: Büyük klinik yazılım sağlayıcıları benzer özellik ekleyebilir.

Çözüm: Sahip odaklı uygulama deneyimi farklılaştırıcı ana unsur; hız ve kullanıcı deneyimiyle öne geçmek.

**Teknik ölçeklenme**

Risk: Hızlı büyümede altyapı sorunları.

Çözüm: Baştan yatay ölçeklenebilir mimari, yük testleri, otomatik ölçekleme politikaları.

---

## 13. Teknoloji Referans Kartı

### Backend

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| NestJS | 10 | API framework |
| PostgreSQL | 15 | Ana veritabanı |
| Prisma | 5 | ORM |
| Redis | 7 | Cache ve kuyruk |
| BullMQ | 4 | İş kuyruğu |
| Firebase Admin | 11 | Push bildirim |
| AWS SDK | 3 | S3, SES |
| Passport.js | 0.6 | Kimlik doğrulama |
| class-validator | 0.14 | Girdi doğrulama |
| Swagger | 7 | API dökümantasyonu |
| Jest | 29 | Test |

### Mobil

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| React Native | 0.74 | Mobil framework |
| Expo SDK | 51 | Geliştirme ortamı |
| TypeScript | 5 | Dil |
| React Navigation | 6 | Ekran yönetimi |
| Zustand | 4 | Global state |
| TanStack Query | 5 | Sunucu state |
| React Hook Form | 7 | Form yönetimi |
| Zod | 3 | Şema doğrulama |
| NativeWind | 4 | Stil sistemi |
| Reanimated | 3 | Animasyon |
| Expo Secure Store | 13 | Güvenli depolama |
| Detox | 20 | E2E test |

### Web Portalı

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| Next.js | 14 | Web framework |
| TypeScript | 5 | Dil |
| Tailwind CSS | 3 | Stil |
| shadcn/ui | latest | Bileşen kütüphanesi |
| TanStack Query | 5 | Veri yönetimi |
| TanStack Table | 8 | Tablo bileşeni |
| React Hook Form | 7 | Form yönetimi |
| TipTap | 2 | Zengin metin editörü |
| Recharts | 2 | Grafikler |
| Playwright | 1.4 | E2E test |

### DevOps ve Altyapı

| Teknoloji | Kullanım Amacı |
|---|---|
| AWS / GCP | Bulut altyapısı |
| Docker | Konteynerizasyon |
| Kubernetes | Orkestrasyon |
| GitHub Actions | CI/CD pipeline |
| Sentry | Hata izleme |
| Datadog | Performans izleme |
| Terraform | Altyapı kodu |
| Vault / KMS | Anahtar yönetimi |

---

*Bu belge yaşayan bir döküman olarak tasarlanmıştır. Her aşamanın tamamlanmasının ardından ilgili bölümler gerçek kararlar ve öğrenimlerle güncellenmesi önerilir.*

*Son güncelleme: Nisan 2026*

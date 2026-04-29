# e-Pati — Geliştirici 2: Frontend & Mobil

> **Rol:** React Native mobil uygulama (sahip tarafı) + Next.js klinik web portalı  
> **Branch stratejisi:** `dev/frontend` → PR → `main`  
> **Yatırımcı öncesi kapsam:** Aşama 1 (UX tasarım) + Aşama 3 (mobil) + Aşama 4 (web portal) + Aşama 6 (testler)

---

## Sıfır Bütçeyle Kullanılacak Araçlar

| İhtiyaç | Ücretli Alternatif (plan) | Ücretsiz Alternatif (şimdi kullan) |
|---|---|---|
| Tasarım | Figma Professional | Figma ücretsiz (3 proje sınırı, yeterli) |
| Mobil test | TestFlight + Google Play | Expo Go uygulaması (fiziksel cihazda anlık test) |
| Web hosting | Vercel Pro | Vercel ücretsiz tier (sınırsız deploy) |
| Analitik | Mixpanel | Yatırım sonrasına ertele |
| App Store | Apple Developer ($99/yıl) | Yatırım sonrasına ertele — önce Expo Go ile test |
| Ikon/görseller | Stock fotoğraf | Undraw.co, Unsplash (ücretsiz) |
| Yazı tipi | Ticari fontlar | Google Fonts (Inter önerilen) |

---

## Aşama 1 — UX Tasarım (Hafta 1–3)

### 1.1 Figma Kurulumu
- [ ] Figma'da `e-Pati` organizasyonu oluştur, Geliştirici 1'i davet et (görüntüleyici)
- [ ] Tasarım sistemi dosyası aç:
  - Renk paleti belirle (ana renk: sağlık/güven çağrışımlı — yeşil veya mavi ton önerilir)
  - Tipografi skalası: başlık, gövde, küçük metin için boyutlar
  - Spacing sistemi: 4px grid
  - Bileşen kütüphanesi: Button, Card, Input, Modal, Badge, Avatar

### 1.2 Mobil Uygulama Wireframe'leri
**Auth akışı:**
- [ ] Splash ekranı
- [ ] Onboarding (3 sayfa — değer önermesi)
- [ ] Kayıt formu (ad, soyad, telefon, e-posta, şifre)
- [ ] OTP doğrulama ekranı
- [ ] KVKK onay ekranı
- [ ] Giriş ekranı + Şifremi unuttum

**Ana uygulama:**
- [ ] Tab bar yapısı (Hayvanlarım, Takvim, Bildirimler, Profil)
- [ ] Hayvan listesi (kart görünümü)
- [ ] Hayvan detay sayfası (sekmeli: Özet, Muayene, Aşı, Reçete, Lab)
- [ ] Muayene detay sayfası
- [ ] Aşı kartı + QR kod ekranı
- [ ] Takvim görünümü (aşı + ilaç + kontrol)
- [ ] Bildirim merkezi
- [ ] Profil ve ayarlar

### 1.3 Klinik Web Portalı Wireframe'leri
- [ ] Giriş ekranı
- [ ] Ana pano (dashboard)
- [ ] Hasta arama ve liste
- [ ] Hasta profili (sekmeli)
- [ ] Yeni muayene formu (SOAP formatı)
- [ ] Reçete yazma ekranı
- [ ] Aşı kaydı modali
- [ ] Lab sonucu yükleme

### 1.4 Prototype
- [ ] Mobil akış için tıklanabilir prototype oluştur (Figma)
- [ ] En az 3 kişiye göster, geri bildirim topla
- [ ] Kritik sorunları düzelt, Geliştirici 1 ile paylaş

---

## Aşama 3 — Mobil Uygulama (Hafta 4–12)

### 2.1 Proje Kurulumu
- [ ] `npx create-expo-app e-pati-mobile --template` (TypeScript şablonu)
- [ ] Klasör yapısını oluştur:
  ```
  app/
  ├── (auth)/            ← login, register, otp
  ├── (tabs)/            ← ana sekmeler
  │     ├── pets/
  │     ├── calendar/
  │     ├── notifications/
  │     └── profile/
  ├── _layout.tsx
  └── index.tsx
  
  components/            ← yeniden kullanılabilir bileşenler
  hooks/                 ← custom hooks
  services/              ← API çağrıları
  stores/                ← Zustand store'ları
  utils/
  constants/             ← renkler, tipografi, spacing
  ```
- [ ] EAS kurulumu: `npx eas-cli init` (ücretsiz, Expo Go ile test için gerekli değil)
- [ ] ESLint + Prettier
- [ ] GitHub Actions: PR'da `expo doctor` çalıştır

### 2.2 Bağımlılık Kurulumu
```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack

# State
npx expo install zustand @tanstack/react-query

# Form
npx expo install react-hook-form zod @hookform/resolvers

# Stil
npx expo install nativewind tailwindcss

# Animasyon
npx expo install react-native-reanimated

# Güvenli depo (token için — AsyncStorage KULLANMA)
npx expo install expo-secure-store

# Bildirim
npx expo install expo-notifications

# Kamera (QR okuma)
npx expo install expo-camera expo-barcode-scanner

# Dosya ve PDF
npx expo install expo-document-picker expo-file-system react-native-pdf
```

### 2.3 API Servisi Katmanı
- [ ] `services/api.ts` — temel Axios instance oluştur:
  - Base URL `.env`'den al
  - Request interceptor: Authorization header ekle
  - Response interceptor: 401'de refresh token akışı
- [ ] Her modül için ayrı servis dosyası:
  - `services/auth.service.ts`
  - `services/pets.service.ts`
  - `services/examinations.service.ts`
  - `services/vaccinations.service.ts`
  - `services/notifications.service.ts`

### 2.4 Auth Akışı
- [ ] `stores/auth.store.ts` — Zustand ile auth state yönetimi
- [ ] Token'ları `expo-secure-store`'da sakla (AsyncStorage yasak — şifresiz)
- [ ] Splash ekranında token kontrolü → auth veya ana akışa yönlendir
- [ ] Kayıt ekranı: form validasyonu (Zod şeması)
- [ ] OTP ekranı: 6 haneli giriş, 60 saniye geri sayım, yeniden gönder
- [ ] KVKK onay ekranı: scrollable metin, onay butonu (metin okunmadan aktif olmaz)
- [ ] Giriş ekranı

### 2.5 Hayvanlarım Sekmesi
- [ ] Hayvan listesi: FlatList, her kart fotoğraf + ad + tür + son muayene
- [ ] Yeni hayvan ekle: form + fotoğraf çekme/seçme (expo-camera + expo-image-picker)
- [ ] Hayvan detay: scrollable sekme yapısı
  - **Özet sekmesi:** sağlık özeti kartı, aktif ilaçlar, yaklaşan aşılar
  - **Muayene sekmesi:** kronolojik liste → detay sayfası
  - **Aşı sekmesi:** tablo görünümü, geçmiş + yaklaşan
  - **Reçete sekmesi:** liste → PDF görüntüleyici
  - **Lab sekmesi:** liste → dosya/görüntü görüntüleyici

### 2.6 QR Kod Özelliği
- [ ] `GET /pets/:id/qr` endpoint'inden token al
- [ ] `react-native-qrcode-svg` ile QR görüntüle (ücretsiz)
- [ ] Paylaş butonu: `expo-sharing` ile görseli paylaş
- [ ] QR okuma: `expo-barcode-scanner` ile tarama ekranı (ileride veteriner için)

### 2.7 Takvim Sekmesi
- [ ] `react-native-calendars` (ücretsiz, MIT lisans)
- [ ] Aşı tarihleri: kırmızı nokta
- [ ] İlaç saatleri: mavi nokta
- [ ] Kontrol randevuları: yeşil nokta
- [ ] Güne tıklayınca o günün etkinlikleri listelenir

### 2.8 Bildirimler
- [ ] `expo-notifications` ile push token kaydet, backend'e gönder
- [ ] Bildirime tıklama → ilgili hayvan/ekrana derin bağlantı (deep link)
- [ ] Uygulama içi bildirim listesi ekranı (okunmuş/okunmamış)

### 2.9 Çevrimdışı Destek
- [ ] TanStack Query cache ayarları: `staleTime: 5 dakika`, `cacheTime: 24 saat`
- [ ] Kritik veriler (son muayene, aktif ilaçlar) `expo-secure-store`'da önbelleğe al
- [ ] Bağlantı durumu kontrolü: `@react-native-community/netinfo`
- [ ] Çevrimdışı modda bilgilendirme banner'ı göster

---

## Aşama 4 — Klinik Web Portalı (Hafta 8–14, mobil ile paralel)

### 3.1 Proje Kurulumu
- [ ] `npx create-next-app e-pati-portal --typescript --tailwind --app`
- [ ] Klasör yapısı:
  ```
  app/
  ├── (auth)/
  │     └── login/
  ├── (dashboard)/
  │     ├── layout.tsx        ← sidebar + header
  │     ├── page.tsx          ← ana pano
  │     ├── patients/
  │     │     ├── page.tsx    ← hasta listesi
  │     │     └── [id]/
  │     │           └── page.tsx
  │     ├── examinations/
  │     └── settings/
  └── layout.tsx
  
  components/
  ├── ui/                     ← shadcn/ui bileşenleri
  ├── patients/               ← hasta spesifik bileşenler
  └── examinations/
  ```
- [ ] shadcn/ui kurulumu: `npx shadcn-ui@latest init`
  - Gerekli bileşenler ekle: `button card input table dialog form badge avatar tabs`
- [ ] TanStack Query kurulumu
- [ ] Axios ile API servisi (mobil ile aynı yapı)

### 3.2 Auth
- [ ] `/login` sayfası — veteriner/admin giriş formu
- [ ] `middleware.ts` — JWT kontrolü, `/login`'e yönlendir
- [ ] Cookie tabanlı token yönetimi (HTTP-only, `js-cookie` yerine `cookies-next`)

### 3.3 Ana Pano
- [ ] İstatistik kartları: bugünkü muayene, aşı, takip sayıları
- [ ] Son eklenen kayıtlar tablosu
- [ ] Recharts ile basit haftalık muayene grafiği

### 3.4 Hasta Arama ve Listesi
- [ ] TanStack Table ile sayfalandırmalı tablo
- [ ] Canlı arama: debounced input → API sorgusu
- [ ] Arama parametreleri: mikro çip no, hayvan adı, sahip adı
- [ ] Her satırda: hayvan fotoğrafı, ad, tür, sahip, son ziyaret

### 3.5 Hasta Profili
- [ ] Sekme navigasyonu (shadcn Tabs bileşeni):
  - Genel Bilgiler
  - Muayene Geçmişi (TanStack Table, kronolojik)
  - Aşı Takibi (tablo + durum badge'leri)
  - Reçeteler (PDF indir butonu)
  - Lab Sonuçları (dosya listesi)
  - Sahip Bilgileri

### 3.6 Yeni Muayene Formu
- [ ] SOAP formatında React Hook Form:
  - `complaint` (Şikayet)
  - `findings` (Bulgular)
  - `assessment` (Değerlendirme — TipTap zengin metin editörü)
  - `plan` (Tedavi planı)
  - `followUpDate` (Takip tarihi, opsiyonel)
- [ ] Kısmi kaydet (taslak olarak `localStorage`'a)
- [ ] Kaydet → API çağrısı → başarıda sahibe push bildirimi gittiğini göster

### 3.7 Reçete Modülü
- [ ] İlaç arama: debounced input, backend'den öneri listesi
- [ ] Her ilaç için: doz, frekans, süre, özel talimat alanları
- [ ] İlaç ekle/çıkar dinamik form alanı (React Hook Form `useFieldArray`)
- [ ] Kaydet → PDF oluştur (backend tarafında) → indir butonu

### 3.8 Aşı Modülü
- [ ] shadcn Dialog içinde form: aşı adı, tarih, seri no, üretici, sonraki doz
- [ ] Aşı adı için önerilen liste (standart aşılar dropdown)
- [ ] Kaydet → sonraki doz için backend otomatik hatırlatma planlıyor (log göster)

### 3.9 Lab Sonucu Yükleme
- [ ] Drag & drop dosya yükleme alanı (`react-dropzone`, ücretsiz MIT)
- [ ] Desteklenen formatlar: PDF, PNG, JPG, DICOM (ileride)
- [ ] Yorum alanı (serbest metin)
- [ ] İlerleme çubuğu ile yükleme durumu

---

## Aşama 6 — Testler (Hafta 13–14)

### 4.1 Mobil E2E Testleri (Detox)
- [ ] Detox kurulumu (Expo ile uyumlu)
- [ ] Temel akış testleri:
  - Kullanıcı kaydı ve giriş
  - Hayvan profili oluşturma
  - Bildirim alındığında yönlendirme

### 4.2 Web Portal E2E Testleri (Playwright — Ücretsiz)
- [ ] `npx playwright install`
- [ ] Test dosyaları:
  - `tests/auth.spec.ts` — giriş ve oturum
  - `tests/patients.spec.ts` — hasta arama ve profil
  - `tests/examination.spec.ts` — muayene kaydı oluşturma

### 4.3 CI/CD (GitHub Actions)
- [ ] `.github/workflows/ci.yml`:
  ```
  - PR açıldığında: TypeScript check + lint + Playwright testleri
  - main'e merge: build + Vercel'e otomatik deploy (preview URL)
  ```

---

## Teslim Kriteri (Yatırımcı Demo için Minimum)

- [ ] Mobil uygulama Expo Go ile çalışıyor (iOS + Android)
- [ ] Kullanıcı kayıt/giriş akışı çalışıyor
- [ ] Hayvan profili + muayene geçmişi görüntülenebiliyor
- [ ] Push bildirimi alınabiliyor
- [ ] Klinik portalı Vercel'de canlı URL'de çalışıyor
- [ ] Veteriner giriş yapıp muayene kaydı oluşturabiliyor
- [ ] Temel Playwright testleri geçiyor
- [ ] Figma'da tüm ekranların tasarımı tamamlanmış

---

## GitHub İş Akışı

```
main
  └── dev/frontend              ← bu branch'te çalış
        ├── feature/mobile-auth
        ├── feature/mobile-pets
        ├── feature/portal-dashboard
        ├── feature/portal-examination
        └── ...

dev/frontend hazır → PR → main (Geliştirici 1 ile birlikte review)
```

**Commit mesaj formatı:**
```
feat(mobile): add QR code sharing screen
feat(portal): implement SOAP examination form
fix(mobile): fix notification deep link routing
style(portal): align patient table with design system
```

---

## Geliştirici 1 ile Koordinasyon Noktaları

| Ne zaman | Ne yapılır |
|---|---|
| Backend auth endpoint'leri hazır | Mobil login ekranını backend'e bağla |
| Pets API hazır | Hayvan listesi ve detay ekranlarını bağla |
| Notifications servisi hazır | Push token kaydetmeyi test et |
| QR endpoint hazır | QR kod ekranını bağla |
| Her hafta Cuma | Kısa senkronizasyon — blocker var mı, API şemasında değişiklik var mı |

**Mock data:** Backend hazır olmadan önce `services/mock-data.ts` içinde sahte veri kullan, hazır olunca gerçek API ile değiştir.

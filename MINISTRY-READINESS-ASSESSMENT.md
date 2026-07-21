# VetCep (e-pati) — Ulusal Hayvan Kimlik ve Sağlık Altyapısı
## Bakanlık Sunum Dosyası, Ürün Kapsamı, Teknik Denetim ve Yürütme Planı

**Hazırlayan:** Teknik Direktör / Stratejik Danışman
**Ekip:** Erol (Backend), Burak (Frontend)
**Tarih:** 21 Temmuz 2026
**Sınıflandırma:** İç kullanım — ticari açıdan hassas değerlendirme içerir. "İç Değerlendirme" olarak etiketli bölümler dışarıya verilecek sürümden çıkarılmalıdır.

> **Bu belgenin okunuşu hakkında.** Belge iki katmandan oluşur ve etiketler bilinçlidir:
> - **[TESPİT]** = kod tabanında veya kamuya açık kaynaklarda doğrudan gözlemlenmiş olgu.
> - **[DEĞERLENDİRME]** = danışman mesleki kanaati.
> - **[VARSAYIM]** = doğrulanması gereken, henüz teyit edilmemiş bilgi (⚠ ile de işaretlenir).
>
> **Ürün kapsamı bölümleri (Bölüm 4–5)** doğrudan Bakanlığa sunulabilecek dille yazılmıştır. **İç Değerlendirme bölümleri (Bölüm 1, 2, 3, 6–13)** ekibin karar alması içindir ve olduğu gibi dışarıya verilmemelidir.

---

## İçindekiler

1. [Yönetici Özeti — Önce Bunu Oku (İç Değerlendirme)](#1-yönetici-özeti)
2. [Mevcut Kod Tabanı Denetimi (İç Değerlendirme)](#2-mevcut-kod-tabanı-denetimi)
3. [Mevcut Kamu Sistemleri — Bakanlığın Zaten Sahip Olduğu (İç Değerlendirme)](#3-mevcut-kamu-sistemleri)
4. [Hedef Ürün — Ulusal Hayvan Kimlik ve Sağlık Altyapısı](#4-hedef-ürün)
   - 4.1 [Vizyon ve Konumlandırma](#41-vizyon)
   - 4.2 [Modül 1 — Hayvancılık Yönetim Sistemi (Büyükbaş & Küçükbaş)](#42-modül-1)
   - 4.3 [Modül 2 — Evcil Hayvan Dijital Kimlik ve Sağlık Sistemi](#43-modül-2)
   - 4.4 [Modül 3 — Sokak Hayvanları Dijital Yönetim Sistemi](#44-modül-3)
   - 4.5 [Modül 4 — Ulusal Hayvan Veri ve Analitik Merkezi](#45-modül-4)
   - 4.6 [Modül 5 — Görev Hayvanları ve Afet Hazırlığı](#46-modül-5)
5. [Devlet Neden Bu Sisteme İhtiyaç Duyar — Değer Önerisi ve Sunum Mesajı](#5-devlet-neden)
6. [Roller, Çok-Kiracılı Mimari, Entegrasyon ve Mevzuat](#6-roller-mevzuat)
7. [Boşluk Analizi — Neredeyiz vs. Nerede Olmalıyız (İç Değerlendirme)](#7-boşluk-analizi)
8. [Mimari Karar — Devam mı, Yeniden Yazım mı (İç Değerlendirme)](#8-mimari-karar)
9. [Fazlı Yol Haritası ve Görev Kırılımı (İç Değerlendirme)](#9-yol-haritası)
10. [Efor Tahminleri ve Takvim (İç Değerlendirme)](#10-efor-takvim)
11. [Risk Kaydı (İç Değerlendirme)](#11-risk-kaydı)
12. [Toplantı Öncesi Kontrol Listesi (İç Değerlendirme)](#12-toplantı-öncesi)
13. [Ticari Çerçeve ve ₺20M Sorusu (İç Değerlendirme)](#13-ticari-çerçeve)
14. [Sunum Stratejisi ve Ana Mesaj](#14-sunum-stratejisi)
15. [Acil Sonraki Adımlar](#15-sonraki-adımlar)

---

## 1. Yönetici Özeti

**[İÇ DEĞERLENDİRME — GİZLİ]**

Her şeyden önce üç gerçeği net olarak söylemem gerekiyor.

**Birincisi: teknik gerçek.** Elinizdeki şey, yetkin ve modern, **küçük ölçekli bir evcil hayvan/veteriner klinik yazılımıdır (SaaS)**. Teknoloji seçimleri (NestJS + Prisma + PostgreSQL, Next.js, Expo) sağlam ve yeniden kullanılabilir. Ancak bu ~27.000 satır uygulama koduna (≈6.700 backend, ≈12.300 portal, ≈7.900 mobil), 3 backend test dosyasına, altyapı-kod (IaC) olmayan, Docker'sız, yabancı bulutlarda ücretsiz/hobi katmanlarda barınan bir sistemdir; ve veri modeli büyükbaş/küçükbaş, sürü, işletme, küpe, hastalık ihbarı veya devlet yönetimi hakkında **hiçbir şey bilmiyor.** Klinik SaaS prototipi olarak saygıdeğer. Ulusal altyapı adayı olarak ise **bir demo tohumu, bir temel değil** — kapsam olarak hedeflenen sistemin yaklaşık %5–8'i.

**İkincisi: ticari gerçek — aracınızın size söylemediği şey.** Tarım ve Orman Bakanlığı, size satacağı söylenen sistemlerin **büyük kısmına zaten sahip, onları işletiyor ve kullanımını zorunlu kılıyor.** TÜRKVET (büyükbaş) ve KKKS (küçükbaş) **HAYBİS altında tek sistemde birleştirildi** (hbs.tarbil.gov.tr). PETVET, Bakanlığın kendi evcil hayvan kayıt sistemidir; **e-Devlet** ve **TarımCebimde** ile entegre, kedi/köpek/gelincik için mikroçip yasal zorunluluğu var (son tarih 31 Aralık 2025 geçti, 1,1M+ hayvan kayıtlı). Zorunlu bir **veteriner e-reçete ve İlaç Takip Sistemi (İTS)** de mevcut. Yani bir boşluğu doldurmuyorsunuz; canlı, yasal olarak zorunlu devlet sistemlerini değiştirmeyi veya onlara eklemlenmeyi teklif ediyorsunuz. Bu imkânsız değil — devletler mevcut sistemleri değiştirir — ama sunumu tamamen değiştirir.

**Üçüncüsü: kamu ihalesi gerçeği.** Türk devleti ₺20M'lik yazılım sistemlerini iyi bir toplantıdan sonra el sıkışarak almaz. Kamu alımları 4734 sayılı Kanun (ihaleler), çerçeve anlaşmalar veya TÜBİTAK/bakanlık BT birimleri eliyle iç geliştirme üzerinden yürür. Kişisel bir aracı üzerinden, gereksinimler ortaya çıkmadan fiyatlanan bir anlaşma en iyi ihtimalle uzun bir resmi sürecin başlangıcıdır. **Toplantıyı bir satış sürecinin kapanışı değil, açılışı olarak görün** — ve herhangi bir şey imzalamadan ya da aracıya ödeme yapmadan önce kamu ihalesi hukukunu bilen bir avukatla çalışın.

**Sonuç ve tavsiye:** Toplantıyı yapın — size 8–10 haftalık odaklı demo çalışması maliyeti çıkarır ve gerçek bir kapı açabilir (pilot, bakanlığın entegratörüne alt-yüklenici olma, ya da geri-çekilme planı olarak belediye anlaşmaları). Ama odaya **"HAYBİS/PETVET ile entegre çalışan, vatandaş ve veteriner odaklı modern deneyim katmanı ve klinik iş akışı platformu"** olarak girin; **"ulusal kayıt sisteminin yerine geçen sistem"** olarak değil. İki kişi ikincisini inşa edemez; 15–25 kişilik bir ekip, sözleşme imzalandıktan sonra 24–36 ayda inşa edebilir — asla öncesinde değil.

---

## 2. Mevcut Kod Tabanı Denetimi

**[İÇ DEĞERLENDİRME — GİZLİ]** — Bu bölümdeki her madde, `/Users/gemici/Documents/e-pati` deposunda doğrudan gözlemlenmiştir.

### 2.1 Depo yapısı ve araçlar
- **[TESPİT]** Sözde monorepo: üç bağımsız uygulama — `e-pati-api/` (NestJS), `portal/` (Next.js), `mobile/` (Expo) — **workspace orkestrasyonu yok** (Turborepo/Nx yok; `pnpm-workspace.yaml` dosyaları var ama commit edilmemiş, paket yöneticileri karışık: API için pnpm, portal/mobil için npm).
- **[TESPİT]** Kök dizinde AI destekli handoff prompt'larıyla sürülmüş planlama dosyaları var (`BACKEND-IMPLEMENTATION.md`, `HANDOFF-PROMPT.md`, `epati-gelistirme-plani.md`, `complated.md`). Faydalı geçmiş, ama bakanlık değerlendiricisinin okuyabileceği mimari dokümantasyon değil.
- **[TESPİT]** Son önemli özellik commit'i: `77d588a` ("ilaç DB, aşı şablonları, faturalar, aşı kartı PDF, ilaç hatırlatıcıları, acil durum düğmesi") — çalışmanın ~1 ay önce (Temmuz 2026 başı) durduğu ifadesiyle tutarlı.

### 2.2 Backend — `e-pati-api/`
- **[TESPİT] Yığın:** NestJS 11, Prisma 7 + PostgreSQL (Supabase pooler, AWS eu-west-1), Redis (Upstash), JWT + passport-jwt, bcrypt (12 tur), Resend (e-posta OTP), Firebase Admin (push), Meta WhatsApp Cloud API, Cloudflare R2 (dosya), Helmet, global `ValidationPipe`, `@nestjs/throttler` (100 istek/dk), `/docs`'ta Swagger.
- **[TESPİT] 19 modül** (~6.700 satır): auth, pets, examinations, vaccinations, prescriptions, lab-results, notifications, clinics, uploads, appointments, billing, admin, whatsapp, analytics, campaigns, owner-health, owners, privacy, prisma.
- **[TESPİT] Veri modeli** (`prisma/schema.prisma`, 508 satır, 4 migrasyon): Roller yalnızca `OWNER, VETERINARIAN, CLINIC_ADMIN, SUPER_ADMIN`. Çekirdek varlıklar: Owner, Clinic, Veterinarian, Pet, Appointment, Examination (SOAP yapısı), Vaccination, Prescription+Medication, LabResult, WeightLog, DietPlan, Notification, AuditLog, RefreshToken, Subscription/Payment, WhatsApp, Campaign, PrivacyRequest. **`Pet.species` serbest metin (String).** İşletme/premises varlığı yok, sürü yok, küpe yok, hareket kaydı yok, hastalık/ihbar varlığı yok, TCKN bağı yok.
- **[DEĞERLENDİRME]** Kod temiz, deyimsel NestJS; DTO doğrulaması her yerde; yumuşak silme (`deletedAt`) ve denetim günlüğü (`AuditLog`) gibi iyi içgüdüler var. **Ama:** kiracı izolasyonu uygulama kodunda servis-servis yapılıyor (satır-seviyesi güvenlik/politika katmanı yok); tek bir eksik `where` = klinikler arası veri sızıntısı. Test kapsamı yok denecek kadar az (3 spec + 1 e2e), **backend için CI hiç yok** (`.github/workflows/ci.yml` yalnızca portalı kapsıyor). Yapısal loglama, izleme (tracing), metrik, health-check gözlemlenmedi.
- **[TESPİT] Güvenlik bulguları (kritik):**
  - `e-pati-api/.env.example` içinde **gerçek görünen bir Upstash Redis kimlik bilgisi** ve gerçek bir Supabase host adı var. Bu Redis OTP deposudur — kimlik bilgisi canlıysa, depoya erişen biri OTP okuyup **herhangi bir hesabı ele geçirebilir. Derhal rotasyon + git geçmişinden temizlik.**
  - Portal, erişim token'ını `localStorage`'da tutuyor (`portal/src/lib/api.ts`) — XSS ile sızdırılabilir. Devlet sistemi güvenlik incelemesinden geçemez.

### 2.3 Web Portal — `portal/`
- **[TESPİT] Yığın:** Next.js 16.2 (App Router), React 19, TypeScript, Tailwind 4 + shadcn tarzı UI, TanStack Query, Zustand, react-hook-form + Zod, Recharts, Axios (401-refresh interceptor), Playwright (5 spec). ~12.300 satır, 31 sayfa.
- **[TESPİT] Kapsam:** landing + get-app; auth (login, klinik onboarding); veteriner paneli — hastalar, randevular, muayeneler, aşılar, reçeteler (statik ilaç DB'si `src/lib/drug-database.ts`), lab sonuçları, faturalar, bildirimler, analitik, kampanyalar, WhatsApp, SaaS faturalama; ve bir `(admin)` alanı (SaaS operatörü için — **bakanlık katmanı değil**).
- **[DEĞERLENDİRME]** Demo için en güçlü varlık. Akışlar gerçekten backend'e bağlı. `src/lib/mock-data.ts` mevcut — bazı ekranlar hâlâ sahte veri gösteriyor olabilir; **[VARSAYIM] her ekran demo öncesi sahte/canlı veri açısından denetlenmeli.** Tasarım çağdaş ama özel-sektör SaaS estetiğinde; e-Devlet görsel kuralları, WCAG erişilebilirlik çalışması yok.

### 2.4 Mobil — `mobile/`
- **[TESPİT]** Expo SDK 54 / RN 0.81, expo-router, Zustand + TanStack Query, SecureStore (token için doğru seçim), push, QR üretimi, PDF yazdır/paylaş. ~7.900 satır. Sadece hayvan sahibi tarafı. Mağazada yayınlanmamış ([VARSAYIM] mağaza hazırlığı doğrulanmalı).

### 2.5 DevOps / Altyapı
- **[TESPİT]** Portal Vercel; API Render; DB Supabase (AB); Redis Upstash; dosya Cloudflare R2; e-posta Resend; push Firebase; WhatsApp Meta. Tek bir CI (yalnızca portal). **Docker yok, IaC yok, staging yok, gözlemlenebilirlik yok, yedekleme/DR politikası yok, secret yöneticisi yok.**
- **[DEĞERLENDİRME]** Altı yabancı SaaS'a yayılmış hobi seviyesi bir topoloji. **Kişisel verinin her baytı Türkiye dışında.** KVKK'lı ulusal sistem için bu bir sertleştirme değil, tam bir yeniden-platformlama gerektirir.

---

## 3. Mevcut Kamu Sistemleri

**[İÇ DEĞERLENDİRME — GİZLİ]** — Toplantı stratejinizin en önemli girdisi budur. ⚠ işaretliler resmi kanaldan (tercihen toplantıda, akıllı sorular olarak) teyit edilmeli.

| Sistem | Nedir | Durum | VetCep ile ilişkisi |
|---|---|---|---|
| **HAYBİS / TÜRKVET** | Bakanlığın Hayvancılık Bilgi Sistemi. TÜRKVET (büyükbaş) ve KKKS (küçükbaş) tek sistemde **birleştirildi** (hbs.tarbil.gov.tr). Destek, ithalat, hareket kontrolünün yasal dayanağı. | **Canlı, zorunlu, yerleşik.** | **Büyükbaş/küçükbaşta yerleşik sistem.** Dışarıdan yerine geçilmez. Gerçekçi oyun: entegrasyon ya da (uzun ihtimal) modernizasyon ihalesi kazanmak. |
| **PETVET** | Bakanlığın Ev Hayvanı Kayıt Sistemi: mikroçip kimliği, pasaport no, sahip, aşı, sahip değişikliği, kayıp/bulundu, operasyon. | **Canlı, zorunlu.** Mikroçip yasal (son tarih 31.12.2025 geçti); 1,1M+ kayıt; veri **e-Devlet** ve **TarımCebimde**'de görünür. | **Tam da orijinal ürününüzün yerleşik hali.** Değiştirdiğiniz kâğıt aşı karnesini devlet zaten dijitalleştiriyor. Farkınız kayıt değil; **deneyim, klinik derinlik, sahip etkileşimi.** |
| **Veteriner e-Reçete + İTS** | Zorunlu veteriner e-reçete ve ilaç izlenebilirliği (kılavuz v3; 2022'den mobil uygulama). | **Canlı, zorunlu.** | `prescriptions` modülünüz yasal bir sistemi tekrarlıyor. **Rekabet değil, entegrasyon.** |
| **e-Devlet** | Ulusal kimlik/hizmet kapısı; "Hayvan Bilgi Sistemi" sorgularını zaten sunuyor. | Canlı. | Zorunlu entegrasyon hedefi: giriş e-Devlet Kapısı ile; kimlik omurgası TCKN. |
| **e-Nabız** | Sağlık Bakanlığı emsali — "ulusal kayıt + vatandaş uygulaması" modelinin siyaseten işlediğinin kanıtı. | Canlı. | Sunumunuzun anlatı varlığı ("hayvanlar için e-Nabız") ve mimari referans. |
| ⚠ **Belediye barınak/sokak sistemleri** | Belediyeler 5199 sayılı Kanun (2024 değişikliği) kapsamında barınak işletiyor; kayıt pratikleri değişken. | Parçalı — **araştırma görevi.** | Gerçekten yetersiz hizmet alan tek segment. **Belediye barınak/sokak yönetimi olası giriş noktanız.** |

**[DEĞERLENDİRME] — dürüst rekabet okuması:** Bakanlığın sorunu kayıtların *var olmaması* değil; eski bir platformda **parçalı** olmaları, saha veterineri ve vatandaş için hantal olmaları, evcil/sokak/klinik kayıtlarının büyükbaştan **daha zayıf** olması. Kazanılabilir sunum: **"devletin kayıtlarının üzerinde çalışan modern deneyim ve klinik-veri katmanı"** — e-Nabız kalıbı. Kayıt devletin, deneyim/uygulama/klinik derinlik/bakanlık paneli sizin. TÜRKVET'i yapanlara "TÜRKVET'i değiştiririz" demek, toplantıyı erken bitirir.

---

## 4. Hedef Ürün

> **Bu bölüm doğrudan Bakanlığa sunulabilir.** Ürün vizyonunu ve beş modülü kurumsal dille tanımlar. Proje yöneticisinin taslağı, danışman tarafından yapılandırılıp devlet sistemleriyle hizalanmıştır.

### 4.1 Vizyon ve Konumlandırma <a name="41-vizyon"></a>

**Türkiye Ulusal Hayvan Kimlik ve Sağlık Altyapısı**, ülkedeki tüm hayvanların — büyükbaş, küçükbaş, evcil, sokak ve görev hayvanları — doğumdan yaşam döngüsünün sonuna kadar tüm kimlik, sağlık, üretim ve sahiplik bilgilerini **tek bir dijital kimlik** altında toplayan; vatandaşın, veteriner hekimin, belediyenin ve Bakanlığın ortak çalıştığı ulusal bir platformdur.

Her hayvanın değişmeyen bir **Hayvan Kimlik Numarası (HKN)** bulunur; mevcut mikroçip ve küpe numaraları bu kimlikle eşleştirilir. Sistem, **insanlar için e-Nabız ne ise hayvanlar için odur** — ancak dört ayrı hayvan sınıfını ve Bakanlık düzeyinde yönetim katmanını da kapsar.

**Konumlandırma ilkesi:** Sistem, devletin mevcut kayıt sistemlerinin (HAYBİS, PETVET, İTS) **yerine değil, üzerine** inşa edilir. Kayıt devletin; modern deneyim, klinik derinlik ve karar destek katmanı platformun sorumluluğundadır. HKN, mikroçip, QR kod ve zorunlu kayıt gibi uygulamalar **mevcut mevzuat çerçevesinde veya gerekli yasal düzenlemelerle desteklenerek** uygulanabilir.

Sistem beş modülden oluşur:

1. **Hayvancılık Yönetim Sistemi** (Büyükbaş & Küçükbaş)
2. **Evcil Hayvan Dijital Kimlik ve Sağlık Sistemi**
3. **Sokak Hayvanları Dijital Yönetim Sistemi**
4. **Ulusal Hayvan Veri ve Analitik Merkezi** (dört modülü birbirine bağlayan karar destek katmanı)
5. **Görev Hayvanları ve Afet Hazırlığı**

---

### 4.2 Modül 1 — Hayvancılık Yönetim Sistemi (Büyükbaş & Küçükbaş) <a name="42-modül-1"></a>

**Amaç.** Büyükbaş ve küçükbaş hayvanların doğumundan yaşam döngüsünün sonuna kadar tüm bilgilerinin tek bir dijital kimlik altında kayıt altına alınmasını sağlayan ulusal takip sistemi. Her hayvanın değişmeyen bir HKN'si bulunur; tüm sağlık, üretim ve sahiplik bilgileri bu kimlik altında tutulur.

**Kayıt edilecek bilgiler.**

| Kategori | İçerik |
|---|---|
| **Kimlik** | HKN · küpe numarası · QR kod · mikroçip (uygunsa) · tür · ırk · cinsiyet · doğum tarihi · doğum yeri · anne · baba · soy ağacı · sahip bilgileri |
| **Fiziksel** | güncel ağırlık · boy · renk · fotoğraflar · gebelik durumu · kısırlaştırma bilgisi · üretim amacı (et / süt / damızlık / yün) |
| **Sağlık** | tüm aşılar · yaklaşan aşılar · hastalık geçmişi · kronik hastalıklar · veteriner muayeneleri · kullanılan ilaçlar · ameliyatlar · laboratuvar sonuçları · röntgen · ultrason · ölüm nedeni (varsa) |

**Akıllı hatırlatma sistemi.** Sistem; hayvanın yaşına, türüne, cinsine, üretim amacına ve bölgesine göre otomatik bildirim gönderir. Örnekler: *"Şap aşısının zamanı geldi." · "Brusella kontrolü yapılmalıdır." · "Gebelik kontrol tarihi yaklaşıyor." · "Buzağının vitamin takviyesi önerilmektedir." · "Küpe kontrolü yapılmalıdır."*

**Hayvan satış sistemi.** Hayvan satılırken alıcı, QR kodu okutarak veya HKN üzerinden; sağlık geçmişini, aşılarını, hastalıklarını, soy ağacını, üretim performansını ve veteriner kayıtlarını inceleyebilir. Kayıt dışı veya eksik bilgili satışların azalmasına katkı sağlar.

**Üretici paneli.** Hayvan sahibi tek ekrandan; kaç hayvanı olduğunu, hangisinin hasta olduğunu, hangisinin aşı beklediğini, hangisinin doğum yapacağını ve hangisinin veteriner kontrolü gerektiğini görebilir.

**Devlete sağladığı faydalar.** Bakanlık; ülke genelindeki hayvan popülasyonunu gerçek zamanlı izleyebilir, salgın risklerini daha hızlı tespit edebilir, aşılama oranlarını takip edebilir, hayvan hareketlerini denetleyebilir, kayıt dışı hayvancılığı azaltmaya yönelik analiz yapabilir, bölgesel üretim istatistikleri oluşturabilir ve destekleme/teşvik programlarını daha doğru planlayabilir.

**Geliştirilebilecek özellikler.**
- **Yapay zekâ destekli erken uyarı:** kilo kaybı, süt verimindeki düşüş, sık hastalanma, düzensiz tedavi kayıtları gibi verileri analiz ederek olası sağlık sorunları için üreticiyi önceden uyarır.
- **Dijital hayvan pasaportu:** her hayvan için QR kod, sağlık özeti, aşı geçmişi, üretim ve sahip bilgilerini içeren tek sayfalık dijital pasaport; satış, nakil veya denetimde kolayca görüntülenir.
- **Hareket takibi:** doğduğu işletme, bulunduğu işletmeler, satış geçmişi, il değişiklikleri ve ihracat kayıtları tek zaman çizelgesinde.

**Öne çıkan iki stratejik özellik.**
1. **Salgın Hastalık Erken Uyarı Sistemi.** Aynı ilçede birden çok işletmede (ör. 15 işletmede şap) bildirim geldiğinde sistem bunu otomatik algılar ve ilgili veteriner birimlerine uyarı gönderir; bölgesel salgınlara hızlı müdahale sağlar. *(Bu, projenin en güçlü özelliklerinden biridir.)*
2. **Devlet Destekleri Entegrasyonu.** Üretici uygulamaya girdiğinde *"Bu hayvanınız için şu destek programına başvurabilirsiniz."* veya *"Bu destek başvurunuzun son tarihi 12 gün sonra."* gibi bildirimler alır; hem üreticinin işini kolaylaştırır hem de desteklerin etkin kullanımını artırır.

> **[İÇ NOT — teknik hizalama]** Bu modülün "kayıt" omurgası HAYBİS/TÜRKVET ile örtüşür; canlı sistemde bunu **entegrasyon** olarak konumlandırın. Sizin katma değeriniz akıllı hatırlatma, satış-QR deneyimi, üretici paneli ve erken uyarı analitiğidir — bunlar HAYBİS'te zayıftır.

---

### 4.3 Modül 2 — Evcil Hayvan Dijital Kimlik ve Sağlık Sistemi <a name="43-modül-2"></a>

**Amaç.** Türkiye'de kayıtlı tüm evcil hayvanların yaşam boyu sağlık geçmişini, sahiplik bilgilerini ve resmi kayıtlarını tek bir dijital kimlik altında toplamak. Her evcil hayvanın mevcut mikroçipi, değişmeyen HKN ile eşleştirilir. **İnsanlar için e-Nabız ne ise, evcil hayvanlar için de aynı mantıkla çalışır.** *(Vatandaşın her gün kullanacağı, projenin en dikkat çekici bölümü budur.)*

**Dijital kimlik.** HKN · mikroçip numarası · QR kodu · fotoğraflar · tür · ırk · yaş · cinsiyet · renk · kısırlaştırma bilgisi · sahip bilgisi · sahip değişiklikleri.

**Dijital sağlık geçmişi.** Hayvana yapılan her işlem sisteme işlenir: muayeneler · aşılar · yaklaşan aşılar · ameliyatlar · kan tahlilleri · röntgen · MR · ultrason · reçeteler · kullanılan ilaçlar · kronik hastalıklar · alerjiler · diyet önerileri · kilo geçmişi · veteriner notları. **Hayvan başka bir şehirde veya farklı klinikte tedavi olsa bile aynı kayıt üzerinden devam edilir.**

**Dijital hayvan pasaportu.** Fiziksel pasaportların yanında dijital pasaport; kaybolma, yıpranma, unutulma sorunlarını azaltır. Seyahat ve resmi kontrollerde QR kod veya çip üzerinden doğrulama yapılır.

**Akıllı hatırlatma sistemi.** Aşı tarihleri, iç/dış parazit uygulamaları, kontroller, yaşa göre önerilen taramalar, düzenli sağlık kontrolleri, ilaç kullanım süreleri için otomatik bildirim. Örnek: *"Kediniz 7 yaşına ulaştı. Böbrek fonksiyon testi önerilir." · "Köpeğinizin kuduz aşısının süresi doluyor."*

**Yapay zekâ destekli ön değerlendirme.** Kullanıcı, belirtileri yazar veya işaretler (kusma, ishal, halsizlik, ateş, iştahsızlık, sürekli kaşınma, topallama). Sistem olası durumlar hakkında **genel bilgilendirme** yapar ve gerektiğinde *"En kısa sürede veteriner hekime başvurun."* yönlendirmesinde bulunur. **Bu bölüm tanı koymaz, ön bilgilendirme amacı taşır** — hem hukuken hem güvenilirlik açısından doğru olanı budur.

**Sahiplendirme geçmişi.** İlk sahibi, sonraki sahipleri, barınak süreci ve sahiplendirilme tarihleriyle kayıt altında tutulur; terk ve tekrar sahiplendirme süreçleri şeffaflaşır.

**Kayıp hayvan sistemi.** Tek tuşla kayıp bildirimi; son görüldüğü konum, fotoğraflar ve iletişim bilgileri yayınlanır; QR okutulunca sahibine ulaşılır.

**Sahiplendirme platformu.** Barınaktaki veya uygun kayıtlı hayvanlar tek platformda; filtreler: şehir, yaş, tür, cins, enerji seviyesi, çocuklarla/diğer hayvanlarla uyum, özel bakım ihtiyacı.

**Paydaşlara faydaları.**
- **Devlet:** kayıtlı evcil hayvan sayısı, mikroçip oranı, aşılama durumu, terk sayıları, sahiplendirme oranları, bölgesel yoğunluklar sağlıklı takip edilir.
- **Veteriner:** hastanın geçmişine saniyeler içinde erişir, tekrar işlemleri azaltır, önceki tetkikleri/alerjileri/kronik hastalıkları görür, tedavi sürekliliğini destekler.
- **Sahip:** tüm kayıtlar tek yerde, belge kaybı riski azalır, aşı/kontroller kaçmaz, seyahat belgelerine kolay erişir, veteriner değişse bile geçmişi taşımak zorunda kalmaz.

**Öne çıkan ek özellikler.**
1. **Acil Durum Kartı.** Telefon kilit ekranından erişilebilen acil profil: kan grubu (gerekiyorsa), alerjiler, sürekli ilaçlar, acil iletişim kişisi, düzenli veteriner. Acil müdahalelerde zaman kazandırır.
2. **Zehirli Gıda ve Bitki Rehberi.** *"Köpeğim bunu yedi." / "Kedim bu bitkiyle temas etti."* durumlarında hızlı bilgi; kullanıcıyı bilinçlendirir, gerektiğinde acil veteriner desteğine yönlendirir.
3. **Sağlık Grafikleri.** Kilo, aşı, laboratuvar sonuçları ve kronik hastalık seyri grafiklerle; uzun süreli hastalık yönetiminde faydalı.
4. **Dijital Onay Sistemi.** Veteriner hekim reçete, rapor ve tedavi kayıtlarını elektronik onaylar; kaynağı doğrulanır, güvenilirlik artar. *([İÇ NOT] Üretimde e-İmza + İTS entegrasyonu ile karşılanmalı.)*

**Stratejik ilke.** Projenin en büyük gücü *zorunlu kullanılması değil, tek ortak kayıt sistemi olmasıdır.* Hangi kliniğe gidilirse gidilsin, hangi şehre taşınılırsa taşınılsın, hayvanın geçmişi tek yerdedir. Vatandaş, veteriner ve kamu için en büyük değer önerisi budur.

---

### 4.4 Modül 3 — Sokak Hayvanları Dijital Yönetim Sistemi <a name="44-modül-3"></a>

**Amaç.** Sahipsiz sokak hayvanlarının tamamını dijital kimlik sistemine dahil ederek sağlık, kısırlaştırma, aşılama, sahiplendirme ve belediye takip süreçlerini ulusal ölçekte standartlaştırmak. Sahipsiz hayvanlar da kayıtlı bireyler haline gelir; yaşam döngüleri izlenebilir. *(Projenin en yenilikçi ve en az doldurulmuş segmentidir — belediyeler, barınaklar ve vatandaşların birlikte kullandığı bileşen.)*

**Dijital kimlik.** Her sokak hayvanına HKN · mikroçip · QR kodlu küpe/tasma etiketi (uygulanabilir durumlarda) · fotoğraf · tür · ırk · tahmini yaş · cinsiyet · bulunduğu bölge atanır. Kimlik ömür boyu değişmez.

**Belediye takip sistemi.** İl/ilçe belediye veteriner ekipleri; yeni bulunan hayvanları kaydeder, sağlık kontrollerini yapar, aşıları işler, kısırlaştırmayı kaydeder, tedavi süreçlerini takip eder. Tüm işlemler merkezi veri tabanına işlenir.

**Sağlık takibi.** Kuduz aşısı · karma aşı · parazit uygulamaları · kısırlaştırma · tedavi · ameliyat · yaralanmalar · kronik hastalıklar tek dosyada.

**Konum yönetimi.** Bulunduğu mahalle · son görülme tarihi · sorumlu belediye · beslenme noktaları · tedavi merkezi kayıt altında. Aynı hayvanın farklı ekiplerce tekrar tekrar kaydedilmesini önler.

**Vatandaş bilgilendirme.** QR okutulunca; adı (varsa), tahmini yaşı, aşı durumu, kısırlaştırma durumu, sağlık geçmişi, belediye sorumluluğu, sahiplendirmeye uygunluğu görüntülenir. **Kişisel veri veya hassas konum paylaşılmaz.**

**Isırılma ve acil müdahale.** Bir ısırılma vakasında sağlık personeli/ilgili kurum, hayvanın kimliğine erişerek kuduz aşı geçmişini, sağlık kayıtlarını ve son veteriner kontrolünü inceleyebilir; olayın değerlendirilmesine destek olur.

**Sahiplendirme sistemi.** Uygun hayvanlar tek platformda; yaş, şehir, tür, karakter, sağlık durumu, özel bakım ihtiyacı filtreleriyle; sahiplenmeden önce tüm sağlık geçmişi görüntülenir.

**Devlet analiz paneli.** İl bazında sokak hayvanı sayısı, ilçe yoğunluğu, kısırlaştırma oranı, aşılama oranı, sahiplendirme oranı, yaralı hayvan sayısı, tedavi bekleyenler, hastalık dağılımı. Kaynak planlaması ve saha çalışmasını destekler.

**Belediye paneli.** Günlük saha ekipleri yönetimi, planlı kontroller, kısırlaştırma programları, tedavi takibi, vatandaş ihbarları yönetimi.

**Öne çıkan ek özellikler.**
1. **Vatandaş İhbar Sistemi.** Yaralı hayvan, saldırgan davranış, trafik kazası, hasta hayvan, terk, acil müdahale için konum ve fotoğrafla bildirim; görev doğrudan ilgili belediye ekibine iletilir.
2. **Risk Analizi.** Aynı bölgede art arda gelen saldırı/şikâyet bildirimlerini analiz ederek belediyeye öncelikli inceleme önerir.
3. **Beslenme Noktaları.** Harita üzerinde mama/su noktaları, gönüllü bakım alanları, belediye bakım merkezleri.
4. **Gönüllü Destek Sistemi.** Mahalle gönüllüleri veya dernekler; beslenme, gözlem, tedavi süreçlerine destek verir; katkılar belediye tarafından doğrulanır.
5. **Popülasyon Planlama.** Hangi mahallede kısırlaştırma oranı düşük, hangi bölgede sahiplendirme ihtiyacı arttı, nerede veteriner ekibi daha yoğun çalışmalı — kararlar tahmine değil veriye dayanır.

> **[İÇ NOT — giriş noktası stratejisi]** 5199 sayılı Kanun'un 2024 değişikliği belediyelere sokak hayvanı yönetiminde ciddi yük ve bütçe baskısı getirdi. Bu modül, Bakanlık anlaşması gecikirse **belediye-belediye satılabilecek geri-çekilme pazarınızdır.** Aynı zamanda toplantıda "devletin en zayıf olduğu alan burası" mesajını verir.

---

### 4.5 Modül 4 — Ulusal Hayvan Veri ve Analitik Merkezi <a name="45-modül-4"></a>

**Amaç.** Diğer dört modülü birbirine bağlayan dördüncü katman. Yalnızca kayıt tutmaz; tüm modüllerden gelen **anonimleştirilmiş** verileri analiz ederek salgın hastalıklar, popülasyon değişimleri, aşılama oranları, sahiplendirme eğilimleri ve diğer istatistikler için **karar destek sistemi** sunar. Böylece proje yalnızca bir kayıt sistemi değil, kamu kurumlarının politika üretmesine yardımcı olan bir platform haline gelir.

**Sağladığı yetenekler.**
- **Ulusal panolar:** il/ilçe bazında popülasyon, aşılama kapsamı (özellikle kuduz), hastalık insidansı, sokak hayvanı popülasyonları — harita üzerinde drill-down.
- **Salgın erken uyarı:** modüller arası veriyi çapraz analiz ederek bölgesel salgın riskini otomatik tespit ve ilgili birimlere uyarı.
- **Karar destek (YZ):** *"Bu ilçede son 2 yılda terk oranı %48 arttı." · "Bu bölgede kuduz vakaları yükseliyor." · "Bu mahallede kısırlaştırma oranı düşük."*
- **Bütçe/kaynak planlama:** aşı doz ihtiyacı, ekip dağılımı, destek programı tahsisi için gerçek verilerle projeksiyon.
- **Akademik açık veri:** anonimleştirilmiş veriler üniversitelerin hastalık, popülasyon ve genetik araştırmaları için.
- **Afet yönetimi:** deprem/yangın/sel sonrası bir bölgede kaç kayıtlı hayvan olduğunun anında görülmesi ve sahipsiz kalanların takibi.

> **[İÇ NOT — mimari]** Bu katman, üretimde ayrı bir veri ambarı / analitik hattı gerektirir (OLTP'den ayrık). Demo'da 81 il için tutarlı **sentetik veri** ile canlandırılır; panolar demoyu satan "para ekranıdır."

---

### 4.6 Modül 5 — Görev Hayvanları ve Afet Hazırlığı <a name="46-modül-5"></a>

**Amaç.** Kamu görev hayvanlarının tamamı için ortak dijital altyapı. Sistem; görev hayvanı adaylarının sağlık, yaş, fiziksel uygunluk ve davranış geçmişini tek merkezde tutar. İlgili kamu kurumları (AFAD, emniyet, jandarma, gümrük, orman vb.), gerekli kriterleri sağlayan ve **sahibinin onayı bulunan** hayvanları eğitim programları için değerlendirebilir.

**Kapsanan görev hayvanları.** AFAD arama-kurtarma köpekleri · emniyet narkotik köpekleri · jandarma iz takip köpekleri · gümrük arama köpekleri · orman yangını tespit/koruma çalışmalarında kullanılan görev hayvanları (uygun senaryolarda).

**Sağladığı yetenekler.** Görev köpeği adaylarının belirlenmesini kolaylaştırır, sağlık geçmişini doğrular, eğitim süreçlerini planlı yürütür, afet ve arama-kurtarma kapasitesinin geliştirilmesine katkı sağlar.

**Görev sonrası takip.** Eğitim geçmişi, görev kayıtları, sağlık kontrolleri ve emeklilik süreçleri aynı dijital kimlik üzerinden izlenir.

> **Konumlandırma cümlesi:** *"Bu sistem yalnızca evcil veya sokak hayvanlarını değil; Türkiye'deki tüm kayıtlı hayvanların yaşam döngüsünü tek dijital altyapıda yöneten ulusal bir platformdur."* Bu cümle projeyi "bir mobil uygulama" olmaktan çıkarıp ulusal dijital altyapı seviyesine taşır.

---

## 5. Devlet Neden Bu Sisteme İhtiyaç Duyar

> **Bu bölüm sunumun değer önerisi omurgasıdır.** Kamu yöneticisinin öncelik verdiği hedeflerle başlar; duygusal argümanlar sonra gelir.

**Sunuma başlangıç ilkesi.** Duygusal argümanlarla ("hayvanları uyutmaya gerek kalmaz") başlamak yerine, kamu yöneticilerinin öncelik verdiği hedeflerle başlayın: **veriye dayalı yönetim · kayıtlılık ve izlenebilirlik · halk ve hayvan sağlığının desteklenmesi · kaynakların verimli kullanımı · şeffaflık ve hesap verebilirlik.** Ardından hayvan refahına ve sahiplendirmeye katkıyı anlatın. Bu yaklaşım, farklı görüşlere sahip karar vericilerin projeyi objektif değerlendirmesini sağlar.

| # | Fayda | Özü |
|---|---|---|
| 1 | **Tek merkezli ulusal veri tabanı** | Bugün bilgi belediyede, veterinerde, çiftçide, barınakta, bakanlıkta ayrı duruyor. Sistem ilk kez hepsini birleştirir. **(En güçlü satış cümlesi.)** |
| 2 | **Kayıt dışılığın azalması** | Kaç sokak köpeği var, kaçı aşılı, kaçı kısır, kaçı sahiplendirildi — bugün tam bilinmiyor; sistem hepsini ölçer. |
| 3 | **Hastalıkların erken tespiti** | Aynı ilçede 20 köpekte parvovirüs görülürse sistem otomatik fark eder ve belediyeye salgın riski uyarısı gönderir. |
| 4 | **Tarım ekonomisinin güçlenmesi** | Kaç inek/koyun var, kaç doğum oldu, süt üretimi nasıl değişiyor, hangi bölgede hastalık arttı — hızlı analiz, daha iyi tarım politikası. |
| 5 | **Veteriner istihdamı** | Her ilçede düzenli kontrol gerektirir; belediye veterineri, saha veterineri, veri kontrol veterineri gibi yeni görev alanları doğar. |
| 6 | **Hayvan haklarının korunması** | Sahip değişiklikleri, tekrarlı terk, şiddet kayıtları görünür ve kayıt altına alınabilir hale gelir. |
| 7 | **Sahte hayvan satışının önlenmesi** | QR ile gerçek yaş, gerçek aşı, gerçek sağlık geçmişi, gerçek soy ağacı doğrulanır. |
| 8 | **Kaçak üretimin azalması** | Üretim çiftlikleri daha kolay denetlenir. |
| 9 | **Doğru bütçe planlaması** | Örn. İstanbul'da 120.000 köpekten 90.000'i kısır ise, gelecek yıl kaç doz aşı gerektiği tam hesaplanır. |
| 10 | **YZ ile karar destek** | Terk oranı artışı, kuduz vaka yükselişi, düşük kısırlaştırma bölgeleri — veri analizi olarak sunulur. |
| 11 | **Afet yönetimi** | Deprem/yangın/sel sonrası bir bölgede kaç kayıtlı hayvan olduğu anında görülür; sahipsiz kalanlar takip edilir. **(Kimsenin düşünmediği çok güçlü özellik.)** |
| 12 | **Akademik araştırmalar** | Anonimleştirilmiş veriler üniversitelerin hastalık, popülasyon ve genetik çalışmalarında kullanılır. |
| 13 | **Uluslararası standartlar** | Türkiye hayvan refahında Avrupa standartlarına yaklaşır. |
| 14 | **Dijital devlet vizyonu** | e-Nabız, e-Devlet, UYAP, MERNİS var; bu sistem bunların **hayvanlar için karşılığıdır.** **(Sunumda mutlaka kullanın.)** |

**Sloganlar.**
- *"Türkiye'de her hayvanın bir kimliği, her hayatın bir kaydı olsun."*
- *"Hayvanlar için dijital kimlik, toplum için güvenli ve sürdürülebilir bir gelecek."*

**Kritik çerçeveleme.** Bu projeyi "hayvan uygulaması" olarak anlatırsanız kabul ettirmek çok zordur. **"Türkiye Ulusal Hayvan Kimlik ve Sağlık Altyapısı"** olarak anlatırsanız bambaşka olur. Çünkü uygulama satmıyorsunuz; **dijital dönüşüm, veri yönetimi, halk sağlığı, tarım politikaları, hayvan refahı, afet hazırlığı ve karar destek sistemi** satıyorsunuz. Bakanlıkların yatırım yaptığı şey tam olarak budur.

---

## 6. Roller, Çok-Kiracılı Mimari, Entegrasyon ve Mevzuat

**[İÇ DEĞERLENDİRME — GİZLİ]**

### 6.1 Rol modeli (asgari)
Vatandaş/sahip · Üretici/işletme sahibi · Özel veteriner · Klinik yöneticisi · Belediye barınak personeli · Belediye veteriner müdürlüğü · İl/ilçe tarım müdürlüğü · Bakanlık merkez program yöneticisi · Denetçi (salt-okunur, tam iz) · Sistem operatörü · Görev hayvanı kurumu (AFAD/emniyet vb.). **[DEĞERLENDİRME]** Kiracılık **hiyerarşik-coğrafi** olmalı (ulusal → il → ilçe → kurum), düz SaaS klinik-kiracılığı değil. Bu tek başına mevcut yetkilendirme tasarımını geçersiz kılar.

### 6.2 Entegrasyon hedefleri (üretim için zorunlu, demo için hiçbiri)
e-Devlet Kapısı (kimlik + hizmet sunumu) · HAYBİS/TÜRKVET (büyükbaş/küçükbaş kayıt otoritesi) · PETVET (evcil kayıt otoritesi) · Veteriner e-Reçete/İTS · MERNİS/KPS (TCKN doğrulama) · UETS/e-Yazışma ⚠ · kamu SMS ağ geçitleri. **Her biri Bakanlıkla resmi protokol gerektirir — Bakanlık erişim vermeden bunlar inşa edilemez; bu, fazlı sözleşmenin gerekçesidir.**

### 6.3 Mevzuat ve fonksiyonel-olmayan gereksinimler
- **KVKK (6698):** VERBİS kaydı, DPO süreçleri, açık rıza, veri sahibi talep yönetimi (`privacy` modülünüz tohum), ihlal bildirimi. Sahip TCKN + adres + sağlık-bitişik veri = yüksek hassasiyet.
- **Veri yerelleştirme:** tüm kişisel veri Türkiye'de — pratikte bakanlık veri merkezi veya onaylı yerli/egemen bulut (Türk Telekom, Turkcell, TRCloud ⚠ teyit). **Supabase/Upstash/Vercel/R2/Resend/Firebase — hepsi başarısız.**
- **Güvenlik:** ISO 27001, CBDDO kamu BT güvenlik genelgeleri, sızma testi, KamuNet bağlantısı ⚠, resmi kayıt/reçetede e-İmza.
- **Erişilebilirlik:** WCAG 2.1 AA; Türkçe öncelikli i18n.
- **Ölçek hedefleri ([VARSAYIM], boyutlandırma için):** ~350k aktif işletme olayı, on milyonlarca büyükbaş/küçükbaş kaydı, zamanla 5–10M evcil, ~20–25k veteriner, 1.400+ belediye; %99,9 erişilebilirlik; p95 < 300ms; 10 yıl saklama; RPO ≤ 15dk / RTO ≤ 4s; kişisel veriye her erişimde değişmez denetim izi.

---

## 7. Boşluk Analizi

**[İÇ DEĞERLENDİRME — GİZLİ]** — ✅ ulusal hedefe yeterli · 🟡 kısmi/yeniden kullanılabilir · ❌ yok veya değiştirilmeli.

| Alan | Neredeyiz (kanıt) | Nerede olmalıyız | Karar |
|---|---|---|---|
| Evcil klinik kayıtları | Muayene/aşı/reçete/lab uçtan uca (`src/examinations` vb.) | Aynısı + İTS/e-reçete entegrasyonu, türe özel şablonlar | 🟡 en iyi varlık |
| Büyükbaş/küçükbaş | Hiç yok — `Pet.species` string; işletme/küpe/hareket yok | Tam işletme/kimlik/hareket/olay modeli, HAYBİS senkron | ❌ sıfırdan |
| Sokak/belediye | Hiç yok | Barınak ops, KNAS/kısırlaştırma, sahiplendirme, belediye raporlama | ❌ sıfırdan |
| Bakanlık yönetim katmanı | Yalnız SaaS operatör admini (`(admin)`) | Ulusal panolar, hastalık ihbarı, denetim, coğrafi hiyerarşi | ❌ sıfırdan |
| Kimlik & yetki | E-posta/OTP + JWT; 4 rol; token localStorage'da | e-Devlet, TCKN, 10+ rol, hiyerarşik kiracılık, e-İmza | ❌ yeniden tasarım |
| Veri modeli | 508 satır temiz ama klinik-SaaS şeklinde | Ulusal kayıt-sınıfı model, sürümlenmiş kayıt, yasal saklama | 🟡 kavramlar kalır, şema kalmaz |
| Kamu sistemi entegrasyonu | Yok | HAYBİS, PETVET, İTS, e-Devlet, MERNİS | ❌ Bakanlık erişimine bağlı |
| Mobil | Sahip uygulaması çalışır (~7,9k satır), mağazada değil | Yayınlanmış vatandaş + üretici + saha veteriner uygulaması | 🟡 |
| Portal | 31 sayfa, bağlı akışlar, düzgün UI | + büyükbaş, barınak, bakanlık konsolları; WCAG; kamu IA | 🟡 |
| Test | 3 backend spec, 1 e2e, 5 Playwright; backend CI yok | Alan mantığında %70+ kapsam, izolasyon testi, yük testi, tam CI | ❌ |
| Altyapı/DevOps | 6 yabancı SaaS, Docker/IaC/staging/izleme/DR yok | Türkiye-yerleşik, container, IaC, izlenen, DR-tatbikatlı | ❌ yeniden platform |
| Güvenlik | İyi temeller ama commit'li Redis kimliği, localStorage token, sızma testi yok | ISO 27001, sızma-testli, secret-yönetimli, RLS/politika | ❌ |
| KVKK | `privacy` tohum; VERBİS/yerleşim/rıza mimarisi yok | Tam KVKK programı + Türkiye barındırma | ❌ |
| Dokümantasyon | AI handoff promptları | Mimari dosya, API spec, güvenlik/uyum dokümanları, SLA/ops kılavuzları | ❌ |
| Ekip | 2 geliştirici | Ulusal teslim için 15–25 kişi | ❌ organizasyonel |

**Özet:** evcil-klinik dikeyinde demo-yapabilir durumdasınız; büyükbaş/küçükbaş, sokak, bakanlık gözetimi, uyum ve operasyonda sıfırdasınız. Demo son dördünü bir toplantı için gizleyebilir; sözleşme gizleyemez.

---

## 8. Mimari Karar

**[İÇ DEĞERLENDİRME — GİZLİ]**

**Karar: yığını koru, klinik modülleri servis olarak koru, çekirdeği yeniden yaz.**
- **Koru (üzerine inşa et):** NestJS/TypeScript/Prisma/PostgreSQL omurgası; portal (Next.js) ve mobil (Expo) kabukları; klinik modüller (muayene, aşı, reçete, lab, bildirim) → **Klinik Servisi** tohumu.
- **Yeniden yaz:** kimlik & yetkilendirme (e-Devlet/TCKN, hiyerarşik RBAC/ABAC — mevcut Owner/Veterinarian ikili modeli bakanlık/il/belediye aktörlerini ifade edemez); veri çekirdeği (Party, Animal süpertipi + türe özel alt tipler, İşletme/Premises, Kimliklendirme [çip/küpe/pasaport], HareketOlayı, BakımEpizodu); çok-kiracılık (uygulama kontrollerinin altına PostgreSQL RLS).
- **Devlet teklifinden çıkar:** SaaS faturalama/abonelik, WhatsApp kampanya, "premium" — bakanlık anlatısına zarar verir (bir branch'te tut; bunlar özel iş modeliniz/geri-çekilme planınız).
- **Hedef şekil:** önce **modüler monolit** (Nest monorepo, sınırlı bağlamlar: Identity, Registry, Clinical, Municipal, Oversight, Integration). Entegrasyon adaptörlerini (HAYBİS/PETVET/İTS) erken ayrı servislere ayırın (dış tarafın sürüm temposuna bağlı). Ekip büyüklüğünüzde mikroservisle **başlamayın.** PostgreSQL + okuma replikaları + partition ulusal okuma hacmine ulaşır; olay dağıtımı için kuyruk (Türkiye'de barındırılabilir RabbitMQ/Redis Streams). Her şey ilk günden container'lı — bakanlık veri merkezine değişmeden inebilsin.

---

## 9. Fazlı Yol Haritası ve Görev Kırılımı

**[İÇ DEĞERLENDİRME — GİZLİ]**

### Faz 0 — Demo-Hazır (toplantıyı kazan) — **8–10 hafta, 2 kişi**
Hedef: tek bir hikâye anlatan 25 dakikalık senaryolu demo: *"vatandaş ↔ veteriner ↔ belediye ↔ bakanlık, tek hayvan kimliği, dört hayvan sınıfı, canlı panolar."* Her şey demo-gerçek, hiçbir şey üretim-gerçek. **Acımasız kural: demo senaryosunda yoksa, yapma.**

| # | Görev | Sahip | Efor (adam-gün) |
|---|---|---|---|
| 0.1 | Güvenlik hijyeni: commit'li Redis kimliğini rotasyonla + git geçmişinden temizle; portal token'ını localStorage'dan çıkar (httpOnly cookie) | Erol | 3 |
| 0.2 | Şema v2 çekirdeği: Animal süpertipi (evcil/büyükbaş/küçükbaş/sokak), İşletme, Kimliklendirme (çip/küpe/pasaport), HareketOlayı — eklemeli migrasyon | Erol | 10 |
| 0.3 | Büyükbaş/küçükbaş demo modülü: işletme kaydı, küpe ile hayvan girişi, iki işletme arası hareket, olay geçmişi | Erol 6 / Burak 6 | 12 |
| 0.4 | Sokak/belediye demo modülü: barınak girişi → kısırlaştırma → sahiplendirme ilanı (tek belediye, tohumlanmış) | Erol 5 / Burak 6 | 11 |
| 0.5 | **Bakanlık konsolu** (para ekranı): ulusal harita + il drill-down; aşılama kapsamı, popülasyon, sahte hastalık-uyarı akışı; 81 il için gerçekçi sentetik veri | Burak 12 / Erol 4 | 16 |
| 0.6 | Simüle entegrasyonlar: `IntegrationService` arkasında mock HAYBİS/PETVET/e-Devlet adaptörleri, demoda açıkça "entegrasyon simülasyonu" etiketli | Erol | 5 |
| 0.7 | e-Devlet tarzı vatandaş giriş ekranı (görsel simülasyon, öyle belirtilerek) | Burak | 2 |
| 0.8 | Mobil: bir demo evcil VE bir demo inek (üretici görünümü) için aşı kartı + kayıtlar; genişletme değil, cila | Burak | 5 |
| 0.9 | Demo ortamı: Docker Compose + **Türkiye konumlu VPS** ("bu demo Türkiye'de barındırılıyor" diyebilmek için) | Erol | 4 |
| 0.10 | Demo veri mühendisliği: tutarlı sentetik ulusal veri seti (iller, işletmeler, hayvanlar, aşılar) — panoları bu yapar/bozar | İkisi | 6 |
| 0.11 | Materyaller: mimari dosya (10–15 s), güvenlik & KVKK duruş notu, entegrasyon planı, fazlı teslim + fiyat sayfası, basılı demo senaryosu + yedek video | İkisi + danışman | 10 |
| | **Toplam** | | **~84 adam-gün ≈ 2 kişi için 8,5 hafta** |

### Faz 1 — Pilot-Hazır (toplantı sonrası, sözleşmeye bağlı) — 6–9 ay
Gerçek e-Devlet auth; gerçek PETVET/İTS entegrasyonu (verildikçe); tek il veya 2–3 belediye pilotu; Türkiye barındırma göçü; KVKK programı; backend CI + %60+ kapsam; gözlemlenebilirlik; sızma testi #1; işe alım dalgası 1. **İmzalı pilot protokolü/LOI olmadan Faz 1 harcamasına başlamayın.**

### Faz 2 — Ulusal Üretim — 9.–30. ay
HAYBİS çift yönlü entegrasyon; illerle büyükbaş açılımı; hastalık-ihbar modülünün Bakanlık veteriner hizmetlerince onayı; KamuNet/bakanlık-VM dağıtımı; ISO 27001; DR + tatbikat; erişilebilirlik denetimi; 20k+ veteriner için eğitim; 7×24 destek; SLA operasyonu.

---

## 10. Efor Tahminleri ve Takvim

**[İÇ DEĞERLENDİRME — GİZLİ]** — ±%30 hata payı gerçekçidir.

| Faz | Kapsam | Adam-gün | 2 kişilik takvim | Ekiple takvim |
|---|---|---|---|---|
| 0 | Demo | ~85 | **8–10 hafta** | +1 frontend ile 5–6 hafta |
| 1 | Pilot | ~700–900 | inandırıcı değil (>2 yıl) | **6–9 ay**, 6–8 kişi |
| 2 | Ulusal | ~4.000–6.000 | imkânsız | **18–24 ay**, 15–25 kişi |

**İşe alım planı (yalnızca para taahhüt edildikten sonra).**
- **LOI/pilot sözleşmesinde (Faz 1, ay 0–2):** 2 kıdemli backend, 1 frontend, 1 mobil, 1 DevOps/platform, 1 QA, kamu deneyimli 1 ürün/BA, **1 yarı-zamanlı kamu ihalesi avukatı + 1 KVKK danışmanı** (pazarlıksız).
- **Üretim sözleşmesinde (dalga 2):** +3–4 backend, +2 frontend, 1 güvenlik mühendisi, 1 DBA, 2 destek/eğitim lideri, bakanlık yönlendirme komiteleriyle çalışmış proje müdürü. Faz 1'in ilk gününden bir **veteriner alan danışmanı** (tercihen eski Bakanlık veterineri) — bu, herhangi bir koddan daha çok güvenilirlik satın alır.

**Çıplak gerçek:** İki kişi toplantıyı kazanabilir; pilotu teslim edemez. Bakanlığın teknik değerlendiricileri bunu bilir — bu yüzden materyaller yalnız yazılımı değil, bir **teslim organizasyonu planını** sunmalıdır.

---

## 11. Risk Kaydı

**[İÇ DEĞERLENDİRME — GİZLİ]**

| # | Risk | Tür | Olasılık | Etki | Azaltım |
|---|---|---|---|---|---|
| R1 | Bakanlık HAYBİS/PETVET'e zaten sahip; sunumu gereksiz görür | Ticari | **Yüksek** | ₺20M çerçevesi için ölümcül | Deneyim/klinik + entegrasyon katmanı olarak konumlan; toplantıyı sistemlerini diğer tedarikçilerden iyi bildiğini göstererek aç |
| R2 | İhale hukuku: toplantıdan doğrudan ₺20M satış yolu yok; aracı başarı ücreti beklerse → nüfuz ticareti riski | Hukuki/Siyasi | Yüksek | Ağır (en kötüde cezai) | Toplantı **öncesi** ihale avukatı; aracı ilişkisini yazılı, yasal danışmanlık sözleşmesine bağla; doğrudan satış değil pilot/ihale hedefle |
| R3 | Aracının vaadi zayıf (toplantı ≠ zorunluluk) | Ticari | Yüksek | 2–3 ay boşa | Ön yatırımı Faz 0 ile sınırla; son 4 haftayı taahhüt etmeden toplantı tarihi + katılımcı listesi iste |
| R4 | Mevcut altyapının KVKK/yerleşim ihlali değerlendiricilerce fark edilir | Uyum | Ele alınmazsa kesin | Diskalifiye | Görev 0.9 (Türkiye barındırma) + sorunu ve göç planını kendiniz beyan eden duruş notu |
| R5 | Commit'li Redis kimliği zaten sızmış | Güvenlik | Orta | Mevcut kullanıcı ele geçirme; itibar | Şimdi rotasyon (0.1); gitleaks ile tara; ele geçirilmiş varsay |
| R6 | Entegrasyon erişimi (HAYBİS/PETVET/İTS API) hiç verilmez / 12+ ay sürer | Teknik/Siyasi | Orta-Yüksek | Pilot kayar | Sözleşme, Bakanlık erişimini takvim rahatlatmalı resmi bağımlılık yapsın; bu arada temiz simülasyon |
| R7 | İki kişilik bus factor'ün satış döngüsünde görünmesi | Organizasyonel | Yüksek | Teslim güvenilirliği | İşe alım planını teklifin parçası yap; 2–3 sözleşmeli hazırda tut |
| R8 | Bakanlık demoyu görüp iç/TÜBİTAK geliştirmeyi tercih eder (fikir devşirme) | Ticari | Orta | Tam kayıp | Derin oturum öncesi NDA; kaynak özel; demo sonucu gösterir, dosya sırrı vermez; marka tescili; tasarım dosyasına telif/faydalı model koruması |
| R9 | Seçim/atama değişimi sponsorluğu sıfırlar | Siyasi | Orta | Satış döngüsü yeniden | Belediye/sokak geri-çekilme pazarı (5199 baskısı) tek sponsordan bağımsız hayatta tutar |
| R10 | Toplantıda kapsam kayması ("şunu da yapar mı?") ücretsiz işe döner | Ticari | Yüksek | Tükeniş, seyrelme | Her kapsam kalemi bir faza ve fiyata bağlı fazlı fiyat sayfası; faz numarası olmadan asla "evet" deme |
| R11 | TRY enflasyonu sabit ₺20M'yi 2 yıllık teslimde zarara çevirir | Finansal | Yüksek | Marj erimesi | Fazlı + endeksli fiyat (TÜFE/ÜFE maddeleri kamu sözleşmelerinde olağan) |

---

## 12. Toplantı Öncesi Kontrol Listesi

**[İÇ DEĞERLENDİRME — GİZLİ]**

**Demo.** Türkiye-barındırmalı ortam + dizüstünde tam yerel Docker yedeği + kayıtlı video yedeği. Prova edilmiş tek 25 dk senaryo: vatandaş evcil hayvan kaydeder → veteriner muayene/aşı işler → üretici iki işletme arası büyükbaş hareketi yapar → belediye ekibi bir sokak hayvanını kısırlaştırma sürecinden geçirir → bakanlık konsolu hepsini canlı ulusal haritada gösterir. İki tam prova + düşmanca soru turu.

**Belgeler (Türkçe, basılı + PDF).**
1. Mimari dosya (10–15 s): hedef mimari, HAYBİS/PETVET/İTS/e-Devlet'i açıkça adlandıran entegrasyon haritası, barındırma seçenekleri, ölçek planı.
2. Güvenlik & KVKK duruş notu: mevcut durum dürüstçe, boşluk listesi, tarihli iyileştirme planı.
3. Fazlı teslim planı: Faz 1 pilot (kapsam, 6–9 ay, fiyat), Faz 2 ulusal (kapsam, takvim, fiyat), ekip büyüme planı.
4. Fiyat gerekçesi (bkz. §13).
5. Fikri mülkiyet & lisans duruşu: IP sizde kalır + Bakanlığa süresiz ulusal-kullanım lisansı + emanetli (escrow) kaynak; veya daha yüksek fiyata tam devir — **toplantı öncesi, danışmanla karar verin.**
6. Destek/SLA önerisi: %99,9, 7×24 sev-1 yanıt, eğitim programı, Türkçe destek masası, yıllık bakım lisansın %15–20'si.
7. Şirket hijyeni: gerçek şirket (kamu için A.Ş. tercih), vergi kaydı, imza sirküleri — tedarikçi ön şartlarını avukatla teyit edin (⚠ araştırma görevi: teknopark, TSE/ISO beklentileri).

**Kesin gelecek beş soruya prova edilmiş yanıtlar:** HAYBİS'e nasıl entegre olursunuz? Veri nerede barınıyor? Kimsiniz (iki kişi mi?) — teslim organizasyonu yanıtı. Neden TÜBİTAK yapmasın? Şirketiniz batarsa veri ne olur? (escrow yanıtı)

---

## 13. Ticari Çerçeve ve ₺20M Sorusu

**[İÇ DEĞERLENDİRME — GİZLİ]**

**₺20M savunulabilir mi?** Bakanlığın gerçekte satın alacağı şey için — ulusal, çok-türlü kayıt deneyim katmanı + klinik platform + belediye modülü + bakanlık analitiği, ~30 ayda 15–25 kişilik ekiple — ₺20M (kabaca 2026 Türkiye tam-maliyetli ~15 mühendis-yılı — **[VARSAYIM] güncel maaş verisiyle doğrulayın**) **yüksek değil, hatta düşüktür.** Bu da bir güvenilirlik sorunudur: rakamı asla *bugünkü* yazılıma iliştirmeyin.

**Önerilen yapı.**
- **Faz 1 pilot:** ₺3–5M — sabit kapsam, bir il + 2–3 belediye, 6–9 ay. Hafif ihale rotalarına ⚠ sığacak kadar küçük, dalga-1 işe alımını fonlayacak kadar büyük.
- **Faz 2 ulusal lisans + teslim:** kilometre taşlarına yayılmış, enflasyon endeksli ₺15–20M.
- **Tekrarlayan (asıl iş):** yıllık bakım & destek kümülatif lisansın %15–20'si (kararlı durumda ₺3–4M/yıl), barındırma/ops (bakanlık VM'de değilse), kohort başı eğitim, çerçeve gün ücretiyle yeni modül geliştirme. **Yaşam boyu tekrarlayan gelir, lisansı aşar — her şeyi bunu kazanmaya göre kurgulayın.**
- **Devlet anlaşması tıkanırsa geri-çekilme pazarı:** (a) 5199 baskısıyla şehir-şehir satılan belediye barınak/sokak platformu; (b) mevcut klinik SaaS. Bunlar pazarlık gücünüzü de artırır — çaresiz değilsiniz.

**Odaya konumlandırma cümlesi:** *"Devletin kayıt sistemleri zaten var; eksik olan vatandaşın, veteriner hekimin ve belediyenin bu kayıtlarla tek bir modern deneyim üzerinden çalışabilmesi. e-Nabız sağlıkta bunu yaptı; biz bunu hayvan sağlığında yapıyoruz — HAYBİS ve PETVET'in yerine değil, üzerine."*

---

## 14. Sunum Stratejisi ve Ana Mesaj

> **Bu bölüm dışarıya verilebilir niteliktedir.**

1. **Açılış — yönetici hedefleriyle başla:** veriye dayalı yönetim, kayıtlılık/izlenebilirlik, halk ve hayvan sağlığı, kaynak verimliliği, şeffaflık. (§5)
2. **Çerçeve:** "Bir uygulama değil, **Ulusal Hayvan Kimlik ve Sağlık Altyapısı** — hayvanlar için e-Nabız."
3. **Beş modülü tek hikâye olarak göster:** tek HKN, dört hayvan sınıfı + görev hayvanları, hepsini birbirine bağlayan analitik merkez. (§4)
4. **Konumlandırma:** devletin kayıtlarının **üzerine** (HAYBİS/PETVET/İTS ile entegrasyon), yerine değil. (§3)
5. **14 fayda ile kapat:** özellikle tek merkezli veri tabanı (#1), erken uyarı (#3), afet yönetimi (#11), dijital devlet vizyonu (#14). (§5)
6. **Hukuki dürüstlük:** zorunlu kayıt/mikroçip/QR gibi unsurları *"mevzuata uygun şekilde / gerekli yasal düzenlemelerle desteklenerek uygulanabilir"* diye ifade et — daha gerçekçi ve kurumsal görünür.
7. **Ana mesaj cümlesi:** *"Türkiye'de her hayvanın bir kimliği, her hayatın bir kaydı olsun."*

---

## 15. Acil Sonraki Adımlar

**[İÇ DEĞERLENDİRME — GİZLİ]**

1. **Bugün:** Upstash kimliğini rotasyonla; git geçmişinden temizle; Supabase/Render erişimini denetle.
2. **Bu hafta:** kamu ihalesi + KVKK avukatı tut (tek firma ikisini yapabilir); aracı ilişkisini yazıya dök veya geri çek; ağır geliştirme başlamadan aracıdan toplantı tarihi/katılımcı iste.
3. **Hafta 1–2:** şema v2 + demo kapsam dondurma (§9 tablosu dondurmadır — bir şey çıkmadan yeni bir şey girmez).
4. **Hafta 3–8:** Faz 0 inşa; 4. haftadan itibaren haftalık demo-senaryo provası.
5. **Hafta 9:** iki tam prova + materyal finalizasyonu.
6. **Paralel, süregelen araştırma görevleri (⚠):** HAYBİS dış-entegrasyon politikası, PETVET API erişimi, bakanlıklar için onaylı egemen-bulut seçenekleri, ihale eşikleri, tedarikçi ön şartları, 5199 sayılı Kanun kapsamında belediye sokak-kayıt yükümlülüklerinin güncel hukuki durumu.

---

### Kaynaklar (dış sistem araştırması)

- [TÜRKVET ve KKKS tek sistemde birleştirildi (Bakanlık duyurusu)](https://www.tarimorman.gov.tr/GKGM/Duyuru/205/Hayvan-Kayit-Sistemleri-_turkvet-Ve-Kkks_-Tek-Bir-Sistemde-Birlestirildi)
- [Bakanlık dijital hizmet platformu (HBS/Tarbil)](https://hbs.tarbil.gov.tr/)
- [e-Devlet — Hayvan Bilgi Sistemi](https://www.turkiye.gov.tr/tarim-ve-orman-hayvan-bilgi-sistemi-7615)
- [Bakanlık — sahipli hayvanların dijital kimliklendirilmesi (PETVET/mikroçip)](https://www.tarimorman.gov.tr/Haber/5652/Sahipli-Hayvanlarin-Dijital-Kimliklendirilmesi)
- [Mikroçip zorunluluğu kapsamı ve istatistikleri (TRT Haber)](https://www.trthaber.com/haber/gundem/evcil-hayvan-kimliklendirme-uygulamasinda-merak-edilenler-733744.html)
- [Veteriner e-Reçete ve İTS kılavuzu v3 (Bakanlık)](https://www.tarimorman.gov.tr/GKGM/Duyuru/356/Veteriner-Tibbi-Urunleri-Icin-E-Recete-Ve-Ilac-Takip-Sistemi-_its_-Uygulama-Kilavuzu-3-Versiyonu-Yayinlandi)
- [Veteriner Hekim E-Reçete Talimatı (PDF, Bakanlık)](https://www.tarimorman.gov.tr/GKGM/Belgeler/Mevzuat/Talimat/Temp/Veteriner_Hekim_E-Re%C3%A7ete_Talimati_ve_Uygulama_Kilavuzu.pdf)
- [KVKK (Kişisel Verileri Koruma Kurumu)](http://www.kvkk.gov.tr/)

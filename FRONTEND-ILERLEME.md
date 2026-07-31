# Frontend & Mobil İlerleme Günlüğü — VetCep (Faz 0 Demo)

> **Bu dosya nedir?** Burak'ın (frontend/mobil) ChatGPT ile yürüttüğü çalışmanın canlı kaydıdır.
> Ana kaynak: [`MINISTRY-READINESS-ASSESSMENT.md`](MINISTRY-READINESS-ASSESSMENT.md) (§9 Faz 0 görev tablosu, §4 ürün modülleri).
> **Kural:** Her çalışma oturumundan sonra ChatGPT bu dosyayı günceller — "Genel Durum" bölümünü yeniler ve "Günlük Kayıtlar"a en üste yeni bir giriş ekler.
> Danışman (Claude) "neredeyiz?" sorusunda **önce bu dosyayı** okur.

---

## 1. Genel Durum Özeti

- **Aktif faz:** Faz 0 — Demo-Hazır (toplantıyı kazanmak için minimum)
- **Son güncelleme:** 1 Ağustos 2026 — Klinik dashboard kurumsal operasyon görünümüne taşındı; gerçek veri, boş/hata durumları ve klinik bildirim sayacı responsive olarak doğrulandı
- **Frontend/mobil ilerleme:** %100
- **Aktif dal:** `feature/portal`
- **Sıradaki adım:** Hasta listesi ve hasta detay ekranlarını dashboard ile aynı kurumsal UI/UX standardına taşımak; belediye canlı entegrasyonunu yalnız pilot rol ve oturum modeli netleştiğinde ele almak

---

## 2. Faz 0 — Frontend / Mobil Görev Takip Tablosu

Durum: ⬜ başlanmadı · 🟡 devam ediyor · ✅ tamamlandı · ⛔ Erol'a (backend) bağlı, bekliyor

| #       | Görev                                                                                                                      | Sorumlu                 | Durum | Not                                                                                                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Portal token'ı localStorage → httpOnly cookie (güvenlik)                                                                   | Burak + Erol            | ✅    | Portal ve backend sözleşmesi tamamlandı: tokenlar yalnız httpOnly cookie'de, yanıt gövdesi `{ user }`, Origin/Referer allowlist mevcut; native Bearer-auth ve imzalı WhatsApp webhook istisnaları negatif testlerle eklendi                                          |
| 0.3     | Büyükbaş/küçükbaş demo ekranları (işletme kaydı, küpe ile hayvan girişi, hareket görünümü, olay geçmişi)                   | Burak                   | ✅    | Sentetik işletme kaydı, Sarıkız küpe girişi, hareket ve olay geçmişi; 390×844 touch akışı ve 44px eylem hedefleri tamamlandı                                                                                                                                         |
| 0.4     | Sokak/belediye demo ekranları (barınak girişi → kısırlaştırma → sahiplendirme ilanı)                                       | Burak                   | ✅    | Dost kabul/kısırlaştırma/ilan zinciri; 390×844 touch akışı, 44px eylem hedefleri ve mobil başlık cilası tamamlandı                                                                                                                                                   |
| 0.5     | **Bakanlık konsolu (PARA EKRANI):** ulusal harita + il drill-down, aşılama/popülasyon panoları, sahte hastalık-uyarı akışı | Burak                   | ✅    | Gerçek Türkiye silüeti üzerinde 81 tıklanabilir il alanı, açıklamalı risk dağılımı, aşılama ve aktif uyarı içeren bilgi balonu, ulusal KPI, drill-down, Recharts panoları, tıklanabilir erken uyarı ve 1366×768 projektör akışı tamamlandı                           |
| 0.7     | e-Devlet tarzı vatandaş giriş ekranı (görsel simülasyon)                                                                   | Burak                   | ✅    | Mock giriş, açık simülasyon etiketi; demo kaynağına duyarlı, sahte mağaza linki göstermeyen Pamuk + Sarıkız mobil geçişi tamamlandı                                                                                                                                  |
| 0.8     | Mobil demo: bir evcil hayvan + bir inek (üretici görünümü) için aşı kartı & kayıtlar                                       | Burak                   | ✅    | Pamuk ve Sarıkız sentetik profilleri; kimlik, aşı ve olay kayıtları, sunum-güvenli fallback, 44px dokunma hedefleri ve 390×844 aşı kartı etkileşim doğrulaması tamamlandı                                                                                            |
| 0.11    | Bakanlık materyalleri: mimari, güvenlik/KVKK, fazlı teslim/fiyat, sunum ve yedek paket                                     | Burak + Erol + danışman | 🟡    | Teknik/dış-paylaşım/sunum/yedek materyalleri, gizli danışman paketi, toplantı sonrası takip paketi ve tek sayfalık Pilot Ön Çerçevesi doğrulandı. Yazılı uzman/Bakanlık kararları, gerçek toplantı bilgileri ve onaylı baskı bekliyor                                |
| Demo    | **25 dakikalık Faz 0 sunum rotası:** vatandaş/mobil → klinik → üretici → belediye → Bakanlık → pilot kapanışı              | Burak + Şevval          | ✅    | Teknik rota, Şevval konuşmacı/Burak kumanda rol dağılımı, 13 sayfalık sunumcu paketi ve yedi frontend demo paketini tek turda çalıştıran `npm run test:demo` preflight komutu hazır; public demo rotaları `vetcep.com` production ortamında 200 yanıtıyla doğrulandı |
| Landing | **Public VetCep vitrini:** bağımsız platform konumlandırması, kullanım alanları, yaşam döngüsü, analitik, güven sınırları  | Burak                   | ✅    | Eski klinik SaaS şablonu, sahte referans/fiyat/yorum ve doğrulanmamış uyum iddiaları kaldırıldı; özgün responsive landing, metadata, favicon ve OG görseli `vetcep.com` production ortamında doğrulandı                                                              |
| Portal  | **Yetkili portal girişi:** kurumsal auth yüzeyi, tema kontrastı, responsive ve erişilebilir form                           | Burak                   | ✅    | Eski emoji/kart tabanlı klinik-SaaS görünümü kaldırıldı; landing ile uyumlu kayıt/erişim dili, tema bağımsız kontrast, 44px eylemler ve nötr `/demo-talep` geçişi tamamlandı                                                                                         |
| Dashboard | **Klinik operasyon panosu:** kurumsal özet, gerçek KPI, aktivite, muayene/aşı takibi ve hızlı işlemler                  | Burak                   | ✅    | Çok renkli/emoji ağırlıklı görünüm kaldırıldı; gerçek veri ve açık boş/hata durumları, API tabanlı bildirim sayacı, 1280×720 masaüstü ve 390×844 mobil düzen tamamlandı                                                                                             |
| Klinik API | **Reçete liste ve PDF istemci sözleşmesi:** hayvan bazlı liste, yetkili PDF durumu ve imzalı bağlantı                | Burak + Erol            | ✅    | Portal ve mobil `/prescriptions?petId=...` kalıcı rotasını kullanıyor; PDF önce yetkili API çağrısıyla hazırlanma durumunu alıyor, hazırsa imzalı bağlantıyı açıyor                                                                                                  |

**Erol'dan (backend) beklenenler:**

- Faz 0 demosu için engel yok. Erol'un `d55f3a2` ile gönderdiği registry çekirdeği işletme, kimliklendirme ve hareket temelini sağlıyor. Belediye canlı akışı için vaka açma, kısırlaştırma kaydı, sahiplendirme ilanı ve ilan statü güncelleme endpoint çekirdeği backend tarafında eklendi; frontend hâlâ Faz 0 için sentetik akışı koruyabilir, pilot öncesi gerçek ekrana bağlanabilir.
- Bakanlık konsolu pilot API çekirdeği için `GET /registry/national-summary`, `GET /registry/provinces/:province/summary` ve `GET /registry/early-warnings` eklendi. Endpointler şimdilik yalnız `SUPER_ADMIN` erişiminde; mevcut registry, belediye, klinik aşı ve hareket verilerinden özet/uyarı adayı üretir.
- Erol'un `4b9b661`, `9767a94` ve 31 Temmuz auth düzeltmeleri tokenları JSON gövdesinden kaldırdı, httpOnly cookie seçeneklerini ortam bazlı yaptı ve Origin/Referer allowlist ekledi. Native mobil için auth cookie taşımayan `Authorization: Bearer` unsafe istekleri Origin olmadan geçebilir; auth cookie varsa Origin/Referer zorunlu kalır. WhatsApp webhook'u sadece `x-hub-signature-256` header'ı ile Origin'siz geçer. Billing webhook artık `x-vetcep-event-id`, `x-vetcep-timestamp` ve `x-vetcep-signature` ile HMAC doğrulaması ve Redis replay kilidi olmadan işlenmez; gerçek ödeme sağlayıcısına özel adapter ayrıca bağlanabilir.
- Commit'li Redis kimliği rotasyonu ve geçmiş temizliği Erol'un 0.1 kapsamındaki ayrı operasyonel güvenlik notu olarak geçerliliğini koruyor.
- Klinik hasta detay sözleşmesinde `GET /pets/:id` owner ilişkisi ve muayene liste/detay yanıtlarında veterinarian ilişkisi backend tarafında tamamlandı. Portal ve mobil reçete istemcileri `GET /prescriptions?petId=...` kalıcı liste rotasına ve yetkili PDF durum sözleşmesine taşındı; eski `/pets/:id/summary` uyumluluk çağrısı kaldırıldı.
- Klinik bildirimleri için `clinicId` kapsamlı listeleme ve okundu işaretleme sözleşmesi backend ve portal tarafında tamamlandı. `VETERINARIAN`, `CLINIC_ADMIN` ve `SUPER_ADMIN` erişimi destekleniyor; yanıt mevcut `body`/`payload`/`status` şeklini koruyor, portal bunu `message`/`type`/`isRead` modeline normalize ediyor.

---

## 3. Günlük Kayıtlar

> En yeni giriş en üstte. Her giriş için şablon:
>
> ```
> ### [YYYY-AA-GG] — Kısa başlık
> **Yapılanlar:** ...
> **Dokunulan dosyalar:** portal/src/... , mobile/app/...
> **Ekran/akış durumu:** ne çalışıyor, ne eksik
> **Sıradaki:** ...
> **Erol'a not (varsa):** hangi backend işine ihtiyaç var
> ```

### 2026-08-01 — Klinik dashboard kurumsal UI/UX turu

**Yapılanlar:** `/dashboard` ekranı klinik operasyon merkezi olarak baştan düzenlendi. Eski emoji karşılama, birbirinden kopuk parlak renkli kartlar ve uygulama şablonu hissi veren hızlı işlem kutuları kaldırıldı. Lacivert kurumsal operasyon özeti, sakin ve semantik KPI kartları, gerçek muayene/aşı dağılımı, tablo ritminde son muayeneler, önceliklendirilmiş aşı uyarıları ve 44px üzeri hızlı işlem hedefleri oluşturuldu. Büyük sayılar Türkçe biçimde gösteriliyor. Veri yokken açıklamasız sentetik grafik üreten fallback kaldırıldı; gerçek boş durum ve API hata durumu birbirinden ayrıldı. Klinik özeti alınamazsa ekran artık sıfırları gerçek kayıt gibi veya “sistem aktif” ifadesiyle göstermiyor. Ortak header'daki sabit `3` bildirim rozeti kaldırılarak mevcut klinik kapsamlı `/notifications` feedindeki gerçek okunmamış sayısına bağlandı. Auth landing testi güncel “Portal girişi” erişilebilir adına, eski owner-only bildirim testi ise Erol'un güncel clinic-scope sözleşmesine uyarlandı.

**Dokunulan dosyalar:** `portal/src/app/(dashboard)/dashboard/page.tsx`, `portal/src/components/shared/dashboard-chart.tsx`, `portal/src/components/layout/header.tsx`, `portal/tests/dashboard-design.spec.ts`, `portal/tests/auth.spec.ts`, `portal/tests/notifications.spec.ts`, `FRONTEND-ILERLEME.md`

**Ekran/akış durumu:** 1280×720 masaüstü ve 390×844 mobil renderlar görsel olarak incelendi; mobil KPI'lar 2×2 kompakt düzende ve yatay taşma yok. Dashboard hedef testi 2/2, auth/bildirim/dashboard regresyonu 16/16, Faz 0 demo paketi 25/25, portal lint, TypeScript ve Next.js production build başarılı. `a7930e1` Vercel production deploymentı `Ready` durumuna geçti ve `vetcep.com` aliaslarını aldı. Canlı smoke turunda beş public demo rotası geçti; admin senaryosu ortam kimlik bilgisi olmadığı için atlandı. Korumalı `/dashboard` rotası oturumsuz erişimi `/login?next=%2Fdashboard` hedefine yönlendiriyor; yetkili production görünümü klinik kimlik bilgisi olmadan açılmadı.

**Sıradaki:** Hasta listesi (`/patients`) ve ardından hasta detayını (`/patients/[id]`) aynı kurumsal ağırlık, boş/hata durumu ve responsive ritimle yenilemek.

**Erol'a not (varsa):** Yeni backend değişikliği gerekmiyor. Mevcut klinik dashboard ve clinic-scope bildirim sözleşmeleri aynen kullanılıyor.

### 2026-08-01 — Reçete liste ve PDF istemci sözleşmesi

**Yapılanlar:** Erol'un kalıcı reçete sözleşmesi portal ve mobilde tamamlandı. Portalın hayvan bazlı reçete sorgusunda kullandığı eski `/pets/:id/summary` uyumluluk çağrısı kaldırıldı; listeleme `/prescriptions?petId=...` rotasına taşındı ve mevcut istemci sayfalaması için üst sınır 100 kayıt olarak açıkça gönderildi. Portal ve mobil PDF düğmeleri artık korumalı `/prescriptions/:id/pdf` adresini doğrudan açmıyor: önce Axios üzerinden mevcut cookie/Bearer oturumuyla belge durumunu alıyor, belge hazırsa backend'in döndürdüğü imzalı bağlantıyı açıyor. PDF henüz üretilmediyse ve çağrı başarısızsa kullanıcıya Türkçe durum mesajı gösteriliyor. Portal hasta detayındaki veteriner adı mevcut `vet.fullName` alanını zaten kullandığı için gereksiz ek uyumluluk kodu eklenmedi. Belediye endpointleri clinic/shelter scope'u, yeni registry ulusal özet uçları ise `SUPER_ADMIN` oturumu gerektirdiğinden public Faz 0 belediye ve Bakanlık demolarındaki sentetik veri bilinçli olarak korundu.

**Dokunulan dosyalar:** `portal/src/services/prescriptions.service.ts`, `portal/src/lib/open-prescription-pdf.ts`, `portal/src/app/(dashboard)/prescriptions/page.tsx`, `portal/src/app/(dashboard)/patients/[id]/page.tsx`, `portal/src/components/patients/add-prescription-dialog.tsx`, `portal/tests/prescription-contract.spec.ts`, `mobile/services/prescriptions.service.ts`, `mobile/app/(tabs)/pets/[id].tsx`, `FRONTEND-ILERLEME.md`

**Ekran/akış durumu:** Portal reçete listesi, hasta detayı ve reçete oluşturma sonrası PDF eylemi aynı yetkili yardımcı akışı kullanıyor; mobil hayvan detayındaki PDF eylemi Bearer oturumunu koruyor. Sözleşme testleri 2/2, mobil TypeScript kontrolü, portal lint ve Next.js production build başarılı; Faz 0 demo regresyon paketi 25/25 geçti. `ed8a54b` production deploymentı `Ready` durumuna geçti ve `vetcep.com` aliaslarını aldı; canlı smoke turunda beş public demo rotası geçti, kimlik bilgisi gerektiren admin senaryosu beklendiği gibi atlandı. Gerçek PDF üretimi canlı klinik oturumu ve reçete kaydı gerektirdiği için kullanıcı kimlik bilgisi olmadan production üzerinde uçtan uca çalıştırılmadı.

**Sıradaki:** Portal içi sıradaki ekranı kurumsal UI/UX standardına taşımak; pilot rol ve oturum modeli netleştiğinde registry/belediye canlı istemci entegrasyonunu planlamak.

**Erol'a not (varsa):** Yeni backend değişikliği gerekmiyor; mevcut liste ve PDF durum sözleşmeleri kullanılıyor. Belediye ve registry canlı entegrasyonları Faz 0 engeli değil; pilotta bağlanmadan önce belediye/shelter rolü ile Bakanlık konsolunun kimliği doğrulanmış admin yüzeyi birlikte netleştirilmeli.

### 2026-08-01 — Registry Bakanlık özet ve erken uyarı endpointleri

**Yapılanlar:** Bakanlık konsolu için pilot öncesi backend sözleşmesi genişletildi. `GET /registry/national-summary` ulusal hayvan/popülasyon, premise, klinik aşı kaydı, belediye vaka ve hareket özetlerini döner. `GET /registry/provinces/:province/summary` il bazında premise, hayvan sınıfı/statüsü, belediye vaka ve sahiplendirme durumlarını verir. `GET /registry/early-warnings` son 30 gün belediye vaka yoğunluğu, sahiplendirme bekleyen vaka birikimi, hareket aktivitesi ve tarihi geçmiş aşı kayıtlarından uyarı adayı üretir.
**Dokunulan dosyalar:** `e-pati-api/src/registry/registry.controller.ts`, `e-pati-api/src/registry/registry.service.ts`, `e-pati-api/src/registry/registry.service.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Portal Bakanlık ekranı hâlâ sentetik frontend veri setiyle çalışabilir; pilot öncesi gerçek API bağlamak için backend uçları hazır. Endpointler ulusal veri yüzeyi olduğu için şimdilik yalnız `SUPER_ADMIN` rolüne açık.
**Sıradaki:** Backend tarafında merkezi audit-log kapsamını genişletmek veya gerçek entegrasyon simülasyon adaptörlerini (`HAYBİS`/`PETVET`/`e-Devlet`) servis sınırı olarak eklemek.
**Erol'a not (varsa):** Registry hedef Jest, full backend Jest ve backend build başarılı.

### 2026-07-31 — Portal giriş ekranı kurumsal yeniden tasarımı

**Yapılanlar:** `/login` ekranı eski klinik-SaaS sunumundan çıkarılarak VetCep'in güncel “Kayıt Defteri” tasarım diline taşındı. Emoji/pati kutuları, dekoratif daireler ve görünürlüğü tema tokenlarına bağlı beyaz kart kaldırıldı. Masaüstünde kayıt, sağlık işlemi ve rol bazlı erişim omurgasını anlatan lacivert portal yüzeyi; mobilde doğrudan forma odaklanan sade bir düzen kuruldu. Form alanları açık/koyu sistem tercihinden bağımsız, yüksek kontrastlı renklere sabitlendi. E-posta/şifre validasyonu, API hata mesajı, yüklenme durumu, şifre görünürlüğü, güvenli `next` yönlendirmesi ve rol bazlı hedef seçimi korundu. Eski `/clinic-onboarding` bağlantısı nötr `/demo-talep` rotasına taşındı; login rotasına özel `noindex` metadata eklendi.

**Dokunulan dosyalar:** `portal/src/app/(auth)/login/page.tsx`, `portal/src/app/(auth)/login/layout.tsx`, `portal/tests/login.spec.ts`, `FRONTEND-ILERLEME.md`

**Ekran/akış durumu:** 1440×900 masaüstü ve 390×844 mobil görsel inceleme hem lokal hem `vetcep.com/login` production üzerinde tamamlandı; yatay taşma yok ve form koyu sistem tercihinde de beyaz zemin/koyu metin kontrastını koruyor. Login Playwright testleri 4/4, Faz 0 demo paketi 25/25, portal lint ve Next.js production build başarılı. Production smoke turunda kimlik bilgisi gerektirmeyen 5/5 public demo senaryosu geçti; admin senaryosu ortam kimlik bilgisi olmadığı için beklendiği gibi atlandı. Canlı `/login` HTTP 200 ve rota metadata başlığı `Portal girişi | VetCep` olarak doğrulandı. Şifre desteği mevcut sözleşmeye uygun olarak kullanıcıyı klinik sistem yöneticisine yönlendiren bilgilendirme mesajını koruyor.

**Sıradaki:** Portal içi ekranları aynı ağırlık, köşe, kontrast ve ritim sistemine Burak'ın önceliğine göre sırayla hizalamak.

**Erol'a not (varsa):** Backend değişikliği gerekmiyor. Mevcut `/auth/clinic/login` httpOnly-cookie sözleşmesi ve rol yönlendirmeleri aynen korundu.

### 2026-07-31 — Landing "Kayıt Defteri" tasarım turu (P0 + P1)

**Yapılanlar:** Landing sayfası kurumsal denetim raporu doğrultusunda "Kayıt Defteri" görsel yönüne taşındı.

- **Font (P0):** `--font-sans: Inter` tanımlıydı ama hiçbir webfont yüklenmiyordu; sayfa sistem fontuna düşüyor ve `font-weight: 900` isteniyordu. Inter Variable + JetBrains Mono `next/font/google` ile yüklendi (`latin-ext` altkümesi Türkçe karakterler için). Ağırlık ölçeği 400/500/600/700'e indirildi; landing genelinde `font-black`/`font-extrabold` kaldırıldı.
- **Harita (P0):** İl renkleri `plateCode % 7` dekoratif hesabıyla belirleniyordu. `portal/src/lib/synthetic-health-dataset.ts` eklendi: 81 il için `plateCode`, `vaccinationRate`, `animalPopulation`, `activeSignalCount`, `riskLevel`; sabit tohumlu deterministik üreteç. Renkler ve tüm KPI'lar (81 / %85 / 16) bu kümeden hesaplanıyor. Renk lejantı, sürüm/tarih damgası ve "gerçek sağlık verisi değildir" notu eklendi; her ilde `<title>` ile erişilebilir detay.
- **CTA/rota (P0):** Tüm ana CTA'lar "Demo görüşmesi talep et" olarak birleştirildi; yeni nötr `/demo-talep` rotası mevcut `/api/demo-request` akışını yeniden kullanıyor. `/clinic-onboarding` bozulmadan yerinde bırakıldı.
- **Hero (P0):** Başlık üzerinden geçen dekoratif çemberler ve mobilde keskin dikey sınır oluşturan gradyan kaldırıldı; yerine maskeli ince grid dokusu. Mobilde ürün görseli CTA'lardan hemen sonra gösteriliyor.
- **Ritim ve hiyerarşi (P1):** 7 bölümde tekrarlanan tek `py` değeri üç kademeye ayrıldı (yoğun/standart/ağır). `SectionHeading`'e `level` prop'u eklendi (primary/secondary/tertiary).
- **Mimari bölümü (P1):** Jenerik üçlü kart grid'i, dikey omurgayla bağlanan katman yığınına dönüştürüldü.
- **Kimlik imzası (P2):** Kayıt numarası formatı (`34-2026-1842`), zaman damgası ve veri kümesi sürümü mono fontla ürün kartı, harita ve footer'da tekrarlanıyor.
- **Mobil menü (P2):** Escape tuşu ve dışarı tıklama ile kapanma eklendi; odak açan düğmeye dönüyor.

**Dokunulan dosyalar:** `portal/src/app/layout.tsx`, `portal/src/app/globals.css`, `portal/src/app/page.tsx`, `portal/src/app/opengraph-image.tsx`, `portal/src/app/(auth)/demo-talep/page.tsx` (yeni), `portal/src/lib/synthetic-health-dataset.ts` (yeni), `portal/src/components/landing/{platform-visuals,section-heading,site-header,site-footer,mobile-nav}.tsx`, `portal/tests/landing.spec.ts`

**Ekran/akış durumu:** `npm run build` ✅, `npx tsc --noEmit` ✅, landing Playwright 5/5 ✅, `npm run test:demo` 25/25 ✅. 1440×900 ve 390×844 görsel inceleme yapıldı; yatay taşma yok (390=390), klavye odak sırası mantıklı ve tüm duraklarda görünür focus ring var. OG görseli ve `icon.svg` 200 dönüyor.

**Açık konular:**

- **Hukuki içerik onay bekliyor:** KVKK aydınlatma, gizlilik politikası ve kullanım şartları metinleri **yazılmadı**. Avukat onaylı içerik olmadığı için sahte hukuk sayfası veya yanlış hedefli footer linki eklenmedi. Onaylı metin geldiğinde footer'a gerçek linkler eklenecek.
- **Mevcut lint hatası (bu turdan bağımsız):** `npm run lint`, `origin/main` üzerinde de "react-hooks plugin bulunamadı" hatası veriyor. ESLint yapılandırma/bağımlılık kayması; bu turda kapsam dışı bırakıldı, `tsc --noEmit` temiz.
- `portal/src/components/ministry/turkey-province-map.tsx:244` bakanlık demo rotasında geometri kaynağı olarak bir kamu kurumu adı yazıyor. Landing'de görünmüyor; ayrı bir karar konusu.

**Sıradaki:** Portal içi ekranları aynı ağırlık/köşe/ritim sistemine hizalamak.

**Erol'a not:** Backend tarafında değişiklik yok; `e-pati-api/` klasörüne dokunulmadı. `/demo-talep` mevcut `/api/demo-request` uç noktasını kullanıyor.

### 2026-07-31 — Belediye canlı endpoint çekirdeği

**Yapılanlar:** Sahipsiz hayvan belediye akışını pilot öncesi canlı API'ye bağlayabilmek için `MunicipalityAnimalCase`, `SterilizationRecord` ve `AdoptionListing` veri modelleri eklendi. `/municipality/cases`, `/municipality/cases/:id/sterilizations`, `/municipality/cases/:id/adoption-listings` ve `/municipality/adoption-listings/:id/status` endpointleri klinik/shelter scope'u ve super admin erişimiyle açıldı. Vaka açılışında sahipsiz hayvanın barınak premise'ine alınması hareket kaydına bağlandı; tamamlanan kısırlaştırma vakayı `STERILIZED`, yayımlanan ilan vakayı `ADOPTION_READY`, tamamlanan sahiplendirme vakayı ve hayvanı `ADOPTED` durumuna taşıyor. Seed'e Tarcin için sentetik belediye vaka, kısırlaştırma ve yayımdaki sahiplendirme ilanı eklendi.
**Dokunulan dosyalar:** `e-pati-api/prisma/schema.prisma`, `e-pati-api/prisma/migrations/20260731190000_municipality_cases/migration.sql`, `e-pati-api/prisma/seed.ts`, `e-pati-api/src/municipality/*`, `e-pati-api/src/app.module.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Portal belediye demo ekranı değiştirilmedi; canlı endpoint sözleşmesi hazır. Belediye rolü henüz enum'da olmadığı için erişim şimdilik `SUPER_ADMIN` ve ilgili shelter/clinic scope'una sahip klinik kullanıcılarıyla sınırlı.
**Sıradaki:** Frontend isterse sentetik belediye akışını bu endpointlere bağlayabilir; backend tarafında sıradaki pilot işi registry ulusal özet/erken uyarı API'leri veya merkezi audit-log kapsamını genişletmek.
**Erol'a not (varsa):** Migration sonrası Prisma generate ve backend test/build turu çalıştırıldı.

### 2026-07-31 — Billing webhook güvenlik sözleşmesi

**Yapılanlar:** `/billing/webhook` endpoint'i generic imzalı webhook sözleşmesine taşındı. Callback'ler artık raw body üzerinden HMAC-SHA256 imza, zaman damgası toleransı ve Redis `NX/EX` replay kilidiyle doğrulanmadan abonelik veya ödeme kaydı güncelleyemiyor. Origin/Referer guard'ı imza header'ı taşıyan billing webhook'u tarayıcı CSRF akışından ayrı değerlendiriyor; imzasız callback'ler kapalı kalıyor.
**Dokunulan dosyalar:** `e-pati-api/src/billing/billing.controller.ts`, `e-pati-api/src/billing/billing.service.ts`, `e-pati-api/src/billing/billing.service.spec.ts`, `e-pati-api/src/security/origin-guard.middleware.ts`, `e-pati-api/src/security/origin-guard.middleware.spec.ts`, `e-pati-api/.env.example`, `e-pati-api/.env.production.example`, `DEPLOYMENT.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Portal ekranı değişmedi. Gerçek ödeme sağlayıcısı seçildiğinde sağlayıcı callback'i `x-vetcep-event-id`, `x-vetcep-timestamp` ve `x-vetcep-signature` header'larıyla bu kapıya bağlanabilir.
**Sıradaki:** Pilot öncesi backend tarafında belediye canlı endpoint sözleşmelerini veya registry erken uyarı/ulusal özet API'lerini ele almak; frontend tarafında kalan geçici uyumluluk katmanlarını sadeleştirmek.
**Erol'a not (varsa):** Canlı ödeme sağlayıcısı açılmadan önce `BILLING_WEBHOOK_SECRET` üretilecek ve provider tarafındaki imza üretimi aynı `timestamp.rawBody` sözleşmesine göre yapılandırılacak.

### 2026-07-31 — Public landing page kurumsal yeniden tasarımı

**Yapılanlar:** Landing page sıfırdan tasarlanarak VetCep yalnız kliniklere satılan genel bir SaaS görünümünden çıkarıldı. Bağımsız hayvan sağlığı teknolojisi konumlandırması; hayvan sahibi, veteriner, üretici, saha operasyonu ve bölgesel analitik kullanım alanları; yaşam boyu kayıt döngüsü; sentetik Türkiye haritası; izin ve protokole bağlı entegrasyon yaklaşımı; demo, pilot ve üretim olgunluk çizgisi tek kurumsal anlatıda birleştirildi. Kamu kurumu/sistem adı ve logo kullanımı, resmî bağlantı çağrışımı, sahte klinik referansları, testimonial'lar, fiyatlandırma ve doğrulanmamış KVKK/ISO/barındırma iddiaları public sayfadan çıkarıldı. Özgün VetCep marka işareti, favicon, dinamik sosyal paylaşım görseli ve güvenli metadata hazırlandı. Auth proxy'si metadata rotalarını public sunacak şekilde düzeltildi.
**Dokunulan dosyalar:** `portal/src/app/page.tsx`, `portal/src/app/layout.tsx`, `portal/src/app/icon.svg`, `portal/src/app/opengraph-image.tsx`, `portal/src/components/landing/brand-mark.tsx`, `portal/src/components/landing/section-heading.tsx`, `portal/src/components/landing/site-header.tsx`, `portal/src/components/landing/site-footer.tsx`, `portal/src/components/landing/platform-visuals.tsx`, `portal/src/proxy.ts`, `portal/tests/landing.spec.ts`, `portal/tests/prod-smoke.spec.ts`, `output/landing-redesign/*`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1440×900 masaüstü ve 390×844 mobil tam sayfa görselleri hem lokal hem `vetcep.com` production üzerinde denetlendi; yatay taşma ve çalışma zamanı hatası yok. Landing/metadata regresyonları 3/3, tam Faz 0 demo paketi 25/25, portal lint ve Next.js production build başarılı. Production smoke turunda kimlik bilgisi gerektirmeyen 5/5 public demo senaryosu geçti; admin senaryosu ortam kimlik bilgisi olmadığı için beklendiği gibi atlandı. Landing, OG görseli, favicon, `/demo-akisi`, `/vatandas-giris`, `/bakanlik`, `/hayvancilik` ve `/belediye` rotalarının tamamı canlıda HTTP 200 döndürüyor.
**Sıradaki:** Portalın sıradaki UI/UX yüzeyini Burak'ın önceliğine göre aynı kurumsal standartta ele almak; gerçek toplantı ve teknik birim bilgileri geldiğinde Pilot Ön Çerçevesini doldurmak.
**Erol'a not (varsa):** Backend değişikliği gerekmiyor. Public landing herhangi bir resmî bağlantı veya tamamlanmış entegrasyon iddiası taşımıyor; gerçek bağlantılar yetki, protokol ve teknik değerlendirmeye bağlı olarak anlatılıyor.

### 2026-07-31 — Hasta detay ve muayene veteriner sözleşmesi

**Yapılanlar:** `GET /pets` ve `GET /pets/:id` yanıtlarına owner özeti (`id`, `fullName`, `email`, `phone`) eklendi. `GET /examinations`, `GET /examinations/:id`, muayene oluşturma ve güncelleme yanıtları veterinarian ilişkisini ve mobil/portal uyumlu `vet.fullName`/`vet.title` alias'ını dönecek şekilde genişletildi.
**Dokunulan dosyalar:** `e-pati-api/src/pets/pets.service.ts`, `e-pati-api/src/pets/pets.service.spec.ts`, `e-pati-api/src/examinations/examinations.service.ts`, `e-pati-api/src/examinations/examinations.service.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Portal hasta detayındaki sahip bilgisi ve muayene veteriner adı artık kalıcı API alanlarından beslenebilir. Mevcut fallback'ler kırılmadı.
**Sıradaki:** Frontend uyumluluk katmanlarını sadeleştirmek veya ödeme sağlayıcısı netleşince billing webhook imza/zaman damgası/replay korumasını eklemek.
**Erol'a not (varsa):** Backend hedef lint, hedef Jest, full Jest 43/43, backend build ve portal production build başarılı.

### 2026-07-31 — Klinik bildirim sözleşmesi

**Yapılanlar:** `Notification` modeli owner yanında opsiyonel `clinicId` alacak şekilde genişletildi ve migration eklendi. `/notifications` artık owner, veteriner, klinik yöneticisi ve super admin rollerinde kapsamlı listeleme yapıyor; `PATCH /notifications/:id/read` aynı kapsam kontrolüyle çalışıyor. Muayene, aşı, reçete ve lab kaydı oluşturulduğunda owner push bildirimi korunurken klinik için in-app bildirim kaydı da yazılıyor. Seed'e Misket için sentetik klinik bildirimi eklendi. Portal bildirim sayfası ve sidebar badge'i klinik rollerine açıldı.
**Dokunulan dosyalar:** `e-pati-api/prisma/schema.prisma`, `e-pati-api/prisma/migrations/20260731143000_clinic_notifications/migration.sql`, `e-pati-api/prisma/seed.ts`, `e-pati-api/src/notifications/notifications.service.ts`, `e-pati-api/src/notifications/notifications.service.spec.ts`, `e-pati-api/src/examinations/examinations.service.ts`, `e-pati-api/src/vaccinations/vaccinations.service.ts`, `e-pati-api/src/prescriptions/prescriptions.service.ts`, `e-pati-api/src/lab-results/lab-results.service.ts`, `portal/src/services/notifications.service.ts`, `portal/src/app/(dashboard)/notifications/page.tsx`, `portal/src/components/layout/sidebar.tsx`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Klinik hesabıyla `/notifications` artık “entegrasyon bekliyor” ekranında kalmadan yetkili klinik bildirimlerini okuyabilecek. Owner push/preference endpointleri owner-only kalmaya devam ediyor.
**Sıradaki:** Frontend uyumluluk katmanlarını sadeleştirmek; ödeme sağlayıcısı netleşince billing webhook imza/zaman damgası/replay korumasını eklemek.
**Erol'a not (varsa):** Prisma generate ve validate başarılı; backend hedef lint, full Jest 40/40, backend build, portal hedef lint ve portal production build başarılı.

### 2026-07-31 — Backend reçete liste sözleşmesi

**Yapılanlar:** Pilot öncesi açık kalan reçete liste kontratı backend tarafında tamamlandı. `GET /prescriptions` rotası eklendi; `petId`, `page` ve `limit` query alanlarıyla paginated yanıt dönüyor. Owner kullanıcıları yalnız kendi hayvanlarının reçetelerini, veteriner/klinik admin kullanıcıları yalnız kendi klinik kapsamındaki reçeteleri, super admin ise tüm reçeteleri okuyabiliyor. Mobilin beklediği `vet.fullName`/`vet.title` uyumluluğu ve `date` alias'ı eklendi.
**Dokunulan dosyalar:** `e-pati-api/src/prescriptions/prescriptions.controller.ts`, `e-pati-api/src/prescriptions/prescriptions.service.ts`, `e-pati-api/src/prescriptions/dto/list-prescriptions-query.dto.ts`, `e-pati-api/src/prescriptions/prescriptions.service.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün ekranı değişmedi. Portal mevcut demo fallback'iyle çalışmaya devam ediyor; mobil gerçek API'de `/prescriptions?petId=...` listesini okuyabilecek hale geldi.
**Sıradaki:** Hasta detayındaki owner/veterinarian include alanlarını kalıcı API sözleşmesine taşımak.
**Erol'a not (varsa):** Hedef lint temiz, backend full Jest 35/35 ve `pnpm run build` başarılı.

### 2026-07-31 — Güncel Faz 0 portalının canlıya alınması

**Yapılanlar:** `vetcep.com` alan adının bağlı olduğu `e-pati-portal` Vercel projesindeki kopuk eski Git bağlantısı `e-pati/e-pati` reposuna yeniden bağlandı. Monorepo Root Directory değeri `./` yerine `portal`, production branch ise `main` olarak doğrulandı. Güncel `292c77b` kodunu değiştirmeyen `b0773f4` deployment tetikleme commiti önce `feature/portal`, ardından fast-forward olarak `main` dalına gönderildi. Vercel preview ve production buildleri tamamlandı; `/demo-akisi`, `/vatandas-giris`, `/bakanlik`, `/hayvancilik` ve `/belediye` rotalarının tamamı canlıda HTTP 200 ile doğrulandı.
**Dokunulan dosyalar:** `FRONTEND-ILERLEME.md` (ürün kodu değişmedi; Vercel proje ayarları ve Git bağlantısı düzeltildi)
**Ekran/akış durumu:** Güncel 25 dakikalık Faz 0 sunum kumandası ve tüm public demo yüzeyleri `vetcep.com` üzerinde canlı. Eski `/login` yönlendirmesi kaldırıldı; güncel sunum kumandası görsel olarak doğrulandı.
**Sıradaki:** Canlı ekranları Bakanlık düzeyi UI/UX incelemesinden geçirmek; Burak'ın geri bildirimlerine göre yalnız sunum-kritik düzenlemeleri küçük parçalar halinde uygulamak.
**Erol'a not (varsa):** Backend değişikliği gerekmiyor. Vercel production artık `main` dalını ve `portal` kökünü izliyor; gelecekteki main pushları otomatik production deployment oluşturmalı.

### 2026-07-31 — Cookie-auth CSRF kapsam ayrımı

**Yapılanlar:** Backend `Origin/Referer` guard'ı cookie tabanlı tarayıcı oturumlarını korumaya devam edecek şekilde daraltıldı. Auth cookie taşımayan `Authorization: Bearer` unsafe istekleri native mobil istemci için Origin olmadan kabul ediliyor; auth cookie ile birlikte gelen Bearer istekleri hâlâ 403 alıyor. Meta WhatsApp webhook'u yalnız `x-hub-signature-256` header'ı varsa Origin'siz geçiyor; imzasız WhatsApp ve billing webhook POST'ları Origin'siz reddediliyor.
**Dokunulan dosyalar:** `e-pati-api/src/security/origin-guard.middleware.ts`, `e-pati-api/src/security/origin-guard.middleware.spec.ts`, `e-pati-api/README.md`, `GUVENLIK-KVKK-DURUS-NOTU.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün ekranı değişmedi. Auth/CSRF backend sözleşmesi hedefli test, backend build ve full Jest turunda doğrulandı.
**Sıradaki:** Ödeme sağlayıcısı seçimi kesinleşince `/billing/webhook` için imza/zaman damgası/replay politikası eklemek; pilot öncesi hasta detay sözleşmesini sadeleştirmek.
**Erol'a not (varsa):** Billing webhook imzası netleşmeden bu rotayı Origin'siz dış dünyaya açmıyoruz.

<!-- Yeni kayıtları buradan itibaren, en üste ekle -->

### 2026-07-26 — Tek sayfalık Pilot Ön Çerçevesi

**Yapılanlar:** Bakanlık teknik çalışma oturumunda fiyat veya ulusal taahhüt vermeden sınırlı pilot kararlarını kaydetmek için Pilot Ön Çerçevesi hazırlandı. Pilot il/kurum, sponsor, teknik temas, kullanıcı ve hayvan grubu, keşif/pilot süresi, kapsam ve kapsam dışı alanlar; HAYBİS/TÜRKVET, PETVET, İTS/e-Reçete ve e-Devlet/KPS için yetkili kaynak-yön-sahip kararları; canlı veriye geçiş kapıları; başlangıç/hedef/kanıt/kabul sahibi içeren başarı kriterleri; aksiyon ve ön mutabakat alanları eklendi. Düzenlenebilir Markdown kaynak, kurumsal tek sayfalık A4 yatay PDF'e dönüştürüldü. İlk render'da alt tabloların karar çubuğuyla örtüştüğü görülerek satırlar sıkıştırıldı ve karar/ön mutabakat tabloları yan yana yerleştirildi; ikinci render 150 ve 300 dpi'da görsel olarak doğrulandı. PDF fiyat/ihale/entegrasyon izni olmadığını açıkça belirtiyor. Toplantı sonrası takip mesajı ve kılavuzu forma bağlandı; ZIP altı dosyayla yeniden üretildi ve hash/bütünlük kontrolünden geçti.
**Dokunulan dosyalar:** `PILOT-ON-CERCEVESI.md`, `output/pdf/VETCEP-PILOT-ON-CERCEVESI.pdf`, `BAKANLIK-TOPLANTI-SONRASI-TAKIP-KILAVUZU.md`, `BAKANLIK-TOPLANTI-SONRASI-MESAJLAR.md`, `BAKANLIK-TOPLANTI-SONRASI-PAKET-MANIFESTI.md`, `output/VETCEP-BAKANLIK-TOPLANTI-SONRASI-TAKIP-PAKETI.zip`, `SEVVAL-SUNUM-PAKETI.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. Tek sayfalık form toplantıda basılı veya PDF olarak doldurulabilir; kapsam, canlı veri, entegrasyon ve kabul kriterleri yazılı kapanmadan pilot geliştirme başlangıcı verilmiyor. Tablolarda taşma, örtüşme ve bozuk Türkçe karakter yok.
**Sıradaki:** Bakanlık sponsoru, pilot il/kurum, veri sahibi teknik birimler ve tarih aralığı netleştiğinde boş formu çalışma oturumunda doldurmak; yazılı teyitlerden sonra keşif planını çıkarmak.
**Erol'a not (varsa):** Yeni backend geliştirmesi gerekmiyor. Erol formdaki yetkili kaynak, entegrasyon yönü, teknik temas, canlı veri kapıları ve kabul kanıtı alanlarının teknik sahipliğini üstlenmeli.

### 2026-07-26 — Bakanlık toplantısı sonrası takip paketi

**Yapılanlar:** Bakanlık görüşmesinden sonraki ilk 2 saat, 24 saat, 48 saat, 3 ve 5 iş günü için takip zaman çizelgesi hazırlandı. Şevval/Burak adına teşekkür ve görüşme özeti e-postası, teknik çalışma oturumu talebi, yanıtsızlık takibi, güvenli fiyat cevabı, kısa WhatsApp mesajı ve kapsam kayması yanıtı yazıldı. İlgili Bakanlık birimleri, istenecek ön bilgiler, dakika dakika karar başlıkları, pilot kabul alanları, kapsam dışı konular ve sorumlu/tarihli karar kaydı içeren 90 dakikalık teknik çalışma oturumu gündemi oluşturuldu. Fiyat belgesi, teknik ek ve kaynak kodu içermeyen dört dosyalı iç takip ZIP'i üretildi; üç payload hash'i ve arşiv bütünlüğü doğrulandı.
**Dokunulan dosyalar:** `BAKANLIK-TOPLANTI-SONRASI-TAKIP-KILAVUZU.md`, `BAKANLIK-TOPLANTI-SONRASI-MESAJLAR.md`, `PILOT-TEKNIK-CALISMA-OTURUMU-GUNDEMI.md`, `BAKANLIK-TOPLANTI-SONRASI-PAKET-MANIFESTI.md`, `output/VETCEP-BAKANLIK-TOPLANTI-SONRASI-TAKIP-PAKETI.zip`, `SEVVAL-SUNUM-PAKETI.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. Hazır metinler, gerçek toplantıda söylenmeyen karar veya pilot bilgisinin eklenmesini yasaklıyor; sözlü özellik taleplerini yazılı kapsam ve kabul ölçütü olmadan geliştirme taahhüdüne çevirmiyor. Teknik oturumun amacı ulusal geçiş değil, sınırlı pilotun karar sahiplerini ve ön koşullarını belirlemek.
**Sıradaki:** Toplantı tarihini, katılımcıları ve gerçek konuşma notlarını alınca köşeli parantezleri doldurmak; teknik birim ve önerilen tarih aralıklarını yazılı teyit ettikten sonra oturum davetini göndermek.
**Erol'a not (varsa):** Yeni backend geliştirmesi gerekmiyor. Teknik çalışma oturumunda Erol; yetkili veri kaynağı, okuma/yazma yönü, entegrasyon teması, barındırma/güvenlik ve teknik bağımlılık kararlarını sahiplenmeli.

### 2026-07-26 — Gizli danışman iletim paketi

**Yapılanlar:** Hukuk, KVKK, mali müşavir/kamu ihalesi ve Erol'un teknik incelemesi için alıcıya özel hazır e-posta/WhatsApp metinleri ile standart yanıt şablonu yazıldı. Hangi danışmana hangi eklerin zorunlu veya ihtiyaca bağlı gönderileceği belirtildi; iç fiyat çerçevesinin herkese otomatik iletilmemesi kuralı eklendi. Onay matrisi PDF/Markdown, mimari, güvenlik/KVKK notu, iç fiyat çerçevesi ve teknik ek taslağı; kullanım notu, hazır mesajlar ve SHA-256 manifestiyle 9 dosyalı `GİZLİ İÇ İNCELEME` ZIP'inde toplandı. Arşiv bütünlüğü, tüm payload hashleri ve tek sayfalık matris PDF'i ZIP içinden yeniden açılarak doğrulandı.
**Dokunulan dosyalar:** `DANISMAN-ILETIM-PAKETI-KULLANIM.md`, `DANISMAN-ILETIM-MESAJLARI.md`, `DANISMAN-ILETIM-PAKETI-MANIFESTI.md`, `output/VETCEP-DANISMAN-ILETIM-PAKETI-GIZLI.zip`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. Paket 227 KB ve çevrimdışı açılabilir. Bakanlığa veya üçüncü kişilere doğrudan gönderilmemesi; her danışmana yalnız görevine gerekli eklerin seçilmesi açıkça yazılı.
**Sıradaki:** Köşeli parantezli alıcı ve tarih alanlarını doldurup paket kullanım tablosuna göre ilgili danışmanlara iletmek; gelen yanıtları satır/dosya/bölüm referansıyla onay matrisine işlemek.
**Erol'a not (varsa):** Erol için hazır teknik inceleme mesajı `DANISMAN-ILETIM-MESAJLARI.md` içinde. Barındırma, entegrasyon sınırı, SLA/operasyon, teslim takvimi ve escrow uygulanabilirliği için yazılı teknik sonuç bekleniyor; yeni backend geliştirmesi gerekmiyor.

### 2026-07-26 — Danışman inceleme ve onay matrisi

**Yapılanlar:** Bakanlık görüşmesi öncesinde açık kalmaması gereken hukuk, KVKK, mali/kamu ihalesi ve teknik kararları tek matriste toplandı. Veri sorumlusu/veri işleyen rolleri, işleme şartı ve aydınlatma, VERBİS, saklama-imha, Türkiye barındırma ve yurt dışı aktarım, kamu alım modeli, KDV/vergi ve fiyat farkı, IP/lisans/escrow, SLA-fesih-geçiş ve sunum dili için dokuz yazılı karar kapısı tanımlandı. Her uzman için ad-soyad/kurum, sonuç, tarih ve imza/e-posta referansı alanı eklendi. KVKK ve Kamu İhale Kurumunun 26 Temmuz 2026 itibarıyla güncel resmî kaynakları doğrulandı. Düzenlenebilir Markdown kaynak, kurumsal tek sayfalık A4 PDF'e dönüştürüldü; PDF render edilerek tablo, Türkçe karakter, baskı not alanları ve sayfa taşması görsel olarak kontrol edildi.
**Dokunulan dosyalar:** `DANISMAN-INCELEME-VE-ONAY-MATRISI.md`, `output/pdf/VETCEP-DANISMAN-INCELEME-VE-ONAY-MATRISI.pdf`, `SEVVAL-SUNUM-PAKETI.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. Tek sayfalık form danışmana PDF olarak gönderilebilir ve toplantıda basılı olarak doldurulabilir. Belge hukuki görüş veya uyum beyanı üretmiyor; `TASLAK` etiketinin kaldırılmasını yazılı uzman onayına bağlıyor.
**Sıradaki:** Formu hukuk, KVKK ve mali/kamu ihalesi danışmanlarına ilgili üç kaynak belgeyle iletmek; gelen revizyonları kaynak dosyalara işleyip yalnız tüm kararlar kapandığında onaylı dış-paylaşım PDF'i üretmek.
**Erol'a not (varsa):** Yeni backend ihtiyacı yok. Erol'un teknik onayı barındırma, entegrasyon sorumlulukları, SLA ve kaynak kod emaneti/teslim uygulanabilirliği satırlarında gerekli.

### 2026-07-26 — Sunum günü çevrimdışı teslim paketi

**Yapılanlar:** Şevval'in sunumcu PDF'i, 10 sayfalık Bakanlık teknik ek taslağı, 4 dakika 27 saniyelik yedek demo videosu, video kontrol karesi, kullanım notu ve teknik runbook tek köklü çevrimdışı ZIP'te birleştirildi. Pakete bilgisayar/USB hazırlığını, arıza geçiş cümlesini, bölüm zamanlarını, anlatım kırmızı çizgilerini ve 30 dakika önce kontrol listesini içeren başlangıç kılavuzu eklendi. Yedi ana dosyanın boyut ve SHA-256 değerleri manifestte kaydedildi; manifest dahil sekiz dosyanın tamamı arşivden açılarak bütünlük kontrolünden geçirildi. Fiyat/iç müzakere belgesi, gerçek kimlik bilgisi, parola, kaynak kod, `.env` ve veritabanı dökümü paketin dışında bırakıldı.
**Dokunulan dosyalar:** `SUNUM-GUNU-CEVRIMDISI-KILAVUZ.md`, `SUNUM-GUNU-DOSYA-MANIFESTI.md`, `output/VETCEP-SUNUM-GUNU-CEVRIMDISI-PAKETI.zip`, `SEVVAL-SUNUM-PAKETI.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. Tek ZIP çıkarıldığında sunumcu metni, teknik ek ve canlı demo B planı internet olmadan aynı klasörden açılabiliyor. Teknik ek açıkça taslak; video ve belgelerde sentetik/simülasyon sınırı korunuyor.
**Sıradaki:** ZIP'i gerçek sunum bilgisayarına ve ayrı USB belleğe kopyalayıp internet kapalıyken PDF/MP4 açılışını doğrulamak; danışman onaylarından sonra teknik ekin `TASLAK` etiketli sürümünü onaylı baskıya çevirmek.
**Erol'a not (varsa):** Çevrimdışı paket backend değişikliği gerektirmiyor. Sunum günü Erol yalnız gerçek klinik servisinde teknik soru veya arıza çıkarsa destek verecek.

### 2026-07-26 — Faz 0 çevrimdışı yedek demo videosu

**Yapılanlar:** Canlı portal, mobil veya backend bağlantısı kesildiğinde Şevval'in anlatımı sürdürebilmesi için mevcut Faz 0 ekranlarından 4 dakika 27 saniyelik sessiz yedek video hazırlandı. Akış açılış, simülasyon etiketli vatandaş girişi, Pamuk/Sarıkız mobil kayıtları, klinik, üretici hareketi, belediye yaşam döngüsü, gerçek Türkiye silüeti üzerindeki 81 il Bakanlık görünümü ve pilot kapanışını kapsıyor. Video H.264 1920×1080/25 fps MP4'e dönüştürüldü, baştan sona hatasız decode edildi ve sekiz ana bölüm karesi görsel olarak incelendi. Gerçek parola/T.C. Kimlik No, kişisel veri ve fiyat bilgisi görüntüye alınmadı. Bölüm zamanları, arıza geçiş cümlesi ve çevrimdışı kontrol listesi yazıldı; video, kullanım notu ve kontrol kareleri tek ZIP'te paketlendi.
**Dokunulan dosyalar:** `output/demo-backup/VETCEP-FAZ0-YEDEK-DEMO.mp4`, `output/demo-backup/VETCEP-YEDEK-DEMO-KARELER.jpg`, `output/demo-backup/frames/*`, `output/demo-backup/stills/*`, `YEDEK-DEMO-VIDEO-KULLANIM.md`, `output/VETCEP-FAZ0-YEDEK-DEMO-PAKETI.zip`, `SEVVAL-SUNUM-PAKETI.md`, `DEMO-PROVA-RUNBOOK.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Canlı uygulama kodu değişmedi. Yedek kayıt çevrimdışı oynatılabilir; `00:18`, `01:17`, `02:03`, `02:46`, `03:29` ve `04:18` bölüm başlangıçlarıyla sorunlu yüzeye doğrudan geçilebilir. Kayıt açık simülasyon/sentetik veri sınırlarını koruyor.
**Sıradaki:** Paketi sunum bilgisayarı ve ayrı USB belleğe kopyalayıp internet kapalıyken oynatmak; teknik ekleri hukuk, mali müşavir/kamu ihalesi ve KVKK danışmanı onayından geçirmek.
**Erol'a not (varsa):** Yedek video backend değişikliği gerektirmiyor; güncel klinik demo görüntüsü mevcut lokal Docker seed'iyle kaydedildi.

### 2026-07-26 — Bakanlık teknik ek PDF'i ve dış-paylaşım paketi

**Yapılanlar:** Bakanlık teknik mimari ile güvenlik/KVKK duruş notu, Türkçe karakter destekli kurumsal A4 şablonda tek PDF'e dönüştürüldü. Kapak, otomatik içindekiler, iki bölüm ayıracı, tekrarlanan üstbilgi/footer, sayfa numarası, tablo stilleri, tıklanabilir resmî kaynaklar ve her sayfada “üretim uyum veya sertifikasyon beyanı değildir” sınırı eklendi. İç fiyat taslağı PDF dışında bırakıldı. 10 sayfanın tamamı PNG olarak render edilip kontakt görünüm ve yoğun sayfalar tam çözünürlükte incelendi; otomatik sayfa geçişlerinde bulunan üstbilgi katmanı ve tek kaynak satırı taşması düzeltilerek yeniden doğrulandı. Metin katmanında Türkçe başlıklar, yerine değil üzerinde konumlandırması, resmî kaynaklar, değiştirme karakteri bulunmaması ve fiyat içeriğinin dışarıda kalması otomatik kontrol edildi. PDF ile iki paylaşılabilir Markdown kaynağını içeren ayrı dış-paylaşım ZIP'i üretildi.
**Dokunulan dosyalar:** `output/pdf/VETCEP-BAKANLIK-TEKNIK-EKLER-TASLAK.pdf`, `output/VETCEP-BAKANLIK-TEKNIK-EKLER-DIS-PAYLASIM.zip`, `SEVVAL-SUNUM-PAKETI.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün ekranı değişmedi. 10 sayfalık A4 PDF'te kesilmiş metin, taşan tablo, bozuk Türkçe karakter, tek başına kalan kaynak sayfası veya iç fiyat bilgisi yok. Şevval için fiyat dosyası içermeyen üç dosyalı dış-paylaşım ZIP'i hazır.
**Sıradaki:** Hukuk/KVKK danışmanından içerik onayı almak; ardından “TASLAK” etiketli sürümü onaylı baskı sürümüne çevirmek ve canlı demo için yedek video paketi hazırlamak.
**Erol'a not (varsa):** PDF üretimi backend değişikliği gerektirmiyor. Teknik doğrulama için Erol'un hedef entegrasyon sınırları, barındırma ve pilot efor varsayımlarını belge üzerinden gözden geçirmesi yeterli.

### 2026-07-26 — Bakanlık teknik ek dosyaları

**Yapılanlar:** Faz 0 görev 0.11 kapsamında Bakanlık teknik görüşmesine uygun hedef mimari; mevcut demo sınırlarını gizlemeyen güvenlik/KVKK duruş ve iyileştirme planı; demo, pilot ve ulusal teslimi birbirinden ayıran fiyat/kapsam çerçevesi hazırlandı. HAYBİS, TÜRKVET, PETVET, İTS ve e-Devlet'in yerine değil üzerinde konumlanma korunarak entegrasyon sorumlulukları, modüler mimari, pilot kabul kapıları, veri yönetişimi, güvenlik takvimi, ekip büyümesi, kilometre taşları, IP/escrow ve SLA başlıkları yazıldı. KVKK ve kamu ihale iddiaları güncel resmî kaynaklarla kontrol edildi. Fiyat belgesi bağlayıcı teklif değil, danışman onayı gereken iç müzakere taslağı olarak ayrıldı; üç belge Şevval sunumcu kaynağına bağlandı ve dört düzenlenebilir kaynağı içeren iletilebilir taslak ZIP üretildi.
**Dokunulan dosyalar:** `BAKANLIK-TEKNIK-MIMARI.md`, `GUVENLIK-KVKK-DURUS-NOTU.md`, `FAZLI-TESLIM-VE-FIYAT-CERCEVESI.md`, `SEVVAL-SUNUM-PAKETI.md`, `output/BAKANLIK-TEKNIK-EKLER-TASLAK.zip`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün ekranı veya backend değişmedi. Bakanlık teknik soru-cevap ve toplantı sonrası pilot görüşmesi için düzenlenebilir kaynak belgeler hazır; 0.11'in PDF/baskı ve yedek video kısmı henüz tamamlanmadı.
**Sıradaki:** Belgeleri hukuk, mali müşavir/kamu ihalesi ve KVKK danışmanına inceletmek; onaylanan içerikten dışa paylaşılabilir PDF teknik ek paketi üretmek.
**Erol'a not (varsa):** Belge hazırlığı için backend değişikliği gerekmiyor. Erol teknik doğrulamada entegrasyon bağımlılıkları, hedef API sınırları, barındırma/operasyon varsayımları ve pilot eforlarını gözden geçirmeli; onay beklemeden demo geliştirmesi ilerleyebilir.

### 2026-07-26 — Tek komutluk Faz 0 demo preflight

**Yapılanlar:** Vatandaş girişi, sunum kumandası, büyükbaş hareketi, belediye sahiplendirme akışı, 81 il Bakanlık konsolu, mobil responsive görünüm ve dokunma hedeflerini kapsayan mevcut yedi Playwright paketi `npm run test:demo` komutunda birleştirildi. Teknik prova runbook'u doğrulanan Docker Compose kurulumuna göre yenilendi; frontend-only demo kabulü ile gerçek API kullanan Docker klinik smoke turu birbirinden açıkça ayrıldı ve go/no-go listesine eklendi.
**Dokunulan dosyalar:** `portal/package.json`, `DEMO-PROVA-RUNBOOK.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Yeni ürün özelliği eklenmedi. Mevcut 25 dakikalık Faz 0 rotasının tamamı artık tek komutla regresyon kontrolünden geçirilebiliyor. İlk gerçek çalıştırmada frontend demo preflight 25/25; httpOnly oturum, demo aboneliği, Misket profili/aşıları ve logout içeren Docker klinik kabulü 1/1 geçti.
**Sıradaki:** Sunumdan hemen önce iki kabul komutunu çalıştırıp yalnız başarısız olan demo-kritik noktaları düzeltmek; yeni özellik eklememek.
**Erol'a not (varsa):** Bu preflight işi backend değişikliği gerektirmiyor. Origin middleware'in native Bearer ve imzalı webhook kapsamı ile klinik detay sözleşmesine ilişkin önceki notlar geçerli.

### 2026-07-26 — Docker klinik kabul turu ve Misket demo cilası

**Yapılanlar:** Docker Desktop üzerinde PostgreSQL, Redis, API ve portal production imajları sıfırdan derlendi; beş migration ve demo seed uygulandı. Gerçek klinik login yanıtında token bulunmadığı, access/refresh cookie'lerinin lokal HTTP için httpOnly + Lax + non-secure olduğu, sayfa yenilemede `/auth/me` oturumunun korunduğu, mock checkout ile 14 günlük demo aboneliğinin hazırlandığı, Misket profili/aşıları ve logout temizliği doğrulandı. Kalıcı `test:docker-smoke` komutu eklendi. Kabul turunda bulunan `Dr. Dr.`/`Merhaba, Dr.!` unvan tekrarları, eksik sahip bilgisi, olmayan reçete liste endpointine bağlı profil hatası, lab alan adı farkları, kırık uzak hasta fotoğrafı ve İngilizce demo klinik metinleri portal tarafında giderildi. Auth testleri gerçek API açıkken yan isteklerden etkilenmeyecek şekilde izole edildi.
**Dokunulan dosyalar:** `portal/playwright.docker.config.ts`, `portal/tests/docker-auth-smoke.spec.ts`, `portal/tests/auth.spec.ts`, `portal/package.json`, `portal/src/app/(dashboard)/dashboard/page.tsx`, `portal/src/app/(dashboard)/patients/page.tsx`, `portal/src/app/(dashboard)/patients/[id]/page.tsx`, `portal/src/components/patients/patient-avatar.tsx`, `portal/src/hooks/use-pets.ts`, `portal/src/lib/demo-clinical-localization.ts`, `portal/src/services/examinations.service.ts`, `portal/src/services/vaccinations.service.ts`, `portal/src/services/prescriptions.service.ts`, `portal/src/services/lab-results.service.ts`, `output/docker-smoke/01-dashboard.png`, `output/docker-smoke/02-misket-profili.png`, `output/docker-smoke/03-asi-listesi.png`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Lokal `http://localhost:3001` üzerinde klinik giriş → demo aboneliği → Pano → yenileme → Hastalar → Misket → Kuduz aşı listesi → logout akışı geçti. Docker production build başarılı; hedef lint temiz; auth/hasta regresyonları 18/18 ve gerçek Docker smoke 1/1 geçti. Üç 1280×720 kanıt ekranı görsel denetlendi; kırık resim, İngilizce aşı metni ve eksik klinik özet bulunmuyor.
**Sıradaki:** Erol Origin middleware kapsamını düzelttiğinde native mobil ve imzalı webhook senaryolarını eklemek; sunumdan önce `docker compose up --build -d`, migrate/seed ve `npm run test:docker-smoke` turunu tekrarlamak.
**Erol'a not (varsa):** `GET /pets/:id` sahibi dahil etmiyor, `GET /prescriptions?petId=...` rotası yok ve muayene listesi veteriner ilişkisini dönmüyor; frontend demo için klinik hasta cache'i, `/pets/:id/summary` ve mevcut oturum kullanıcısıyla güvenli fallback uyguladı. Kalıcı API sözleşmesinde owner/veterinarian ilişkileri ile reçete listeleme eklenmeli. Origin middleware için native Bearer ve imzalı webhook kapsam notu geçerli.

### 2026-07-26 — Erol auth ve Docker push doğrulaması

**Yapılanlar:** Erol'un `4b9b661`, `61e45f2` ve `9767a94` commitleri incelendi ve `feature/portal` dalına conflict olmadan fast-forward ile alındı. Login, clinic login, OTP ve refresh yanıtlarından access/refresh tokenların kaldırılıp yalnız `{ user }` döndüğü; httpOnly cookie seçeneklerinin production ve lokal Docker HTTP için ayrıldığı; unsafe isteklerde `CORS_ORIGINS` tabanlı Origin/Referer kontrolü eklendiği doğrulandı. Docker pnpm sürümü, Prisma client üretimi ve portal legacy peer bağımlılık kurulumu düzeltmeleri de kontrol edildi.
**Dokunulan dosyalar:** `FRONTEND-ILERLEME.md` (Erol'un pushundaki 13 dosya fast-forward ile çalışma dalına alındı)
**Ekran/akış durumu:** Backend auth ve Origin hedef testleri 11/11, portal auth Playwright paketi 12/12 geçti. Dal Erol'un güncel `main`iyle `9767a94` üzerinde eşitlendi. Tarayıcı cookie-auth sözleşmesi çalışıyor; middleware'in bütün unsafe istekleri Origin/Referer zorunluluğuna bağlaması native mobil ve dış webhook akışlarında 403 riski oluşturuyor.
**Sıradaki:** Erol kapsam düzeltmesini yaptıktan sonra Docker ortamında klinik login → `/auth/me` → refresh → logout ve native mobil/webhook regresyonlarını doğrulamak.
**Erol'a not (varsa):** Origin kontrolünü yalnız tarayıcı cookie-auth tehdidine göre kapsamlandır; React Native Bearer istekleri ile Meta/ödeme webhook'larını imza/secret doğrulamasına bırak ve Originsiz kötü istek, geçerli native Bearer, geçerli webhook imzası senaryoları için test ekle.

### 2026-07-23 — Şevval Dündar sunumcu devir paketi

**Yapılanlar:** Mevcut 25 dakikalık konuşma metni, teknik runbook ve canlı `/demo-akisi` rotası Şevval Dündar'ın Bakanlık sunumunu devralabileceği tek pakette birleştirildi. Şevval anlatıcı/Burak teknik kumanda rol dağılımı, 5 dakikalık hızlı başlangıç, kırmızı çizgiler, dakika dakika konuşma ve tıklama akışı, güncel gerçek Türkiye haritası anlatımı, 12 zor Bakanlık sorusu, teknik B planı, 20 dakikalık kısa rota, 30 dakika önce kontrol listesi, tek sayfalık konuşmacı kartı ve hazır WhatsApp mesajı eklendi. Düzenlenebilir Markdown, 13 sayfalık kurumsal PDF ve PDF + kaynak belgeleri içeren ZIP üretildi.
**Dokunulan dosyalar:** `SEVVAL-SUNUM-PAKETI.md`, `output/pdf/SEVVAL-VETCEP-SUNUM-PAKETI.pdf`, `output/SEVVAL-VETCEP-SUNUM-PAKETI.zip`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Ürün kodu değişmedi. PDF'in 13 sayfası PNG olarak render edilip görsel denetlendi; Türkçe karakter, başlık, tablo, sayfa sonu, kontrol kutusu ve metin bütünlüğü sorunları giderildi. PDF metin kontrolünde değiştirme karakteri yok; açılış, konumlandırma, Şevval adı ve WhatsApp bölümü mevcut. ZIP dört gönderilebilir dosyayı içeriyor.
**Sıradaki:** Paketi Şevval'e iletmek; ilk provada metni ezberletmeden açılış, bölüm geçişleri, Bakanlık ekranı ve kapanışı 25 dakika içinde oturtmak.
**Erol'a not (varsa):** Sunumcu paketi için yeni backend ihtiyacı yok. 0.1 auth kapanışı ve klinik bildirim sözleşmesiyle ilgili önceki notlar geçerli.

### 2026-07-23 — 0.1 httpOnly-cookie auth sözleşme denetimi

**Yapılanlar:** Erol'un güncel `main` dalındaki backend auth controller, cookie seçenekleri, CORS/env doğrulaması ve portalın login, `/auth/me`, refresh, logout ve guard akışları karşılaştırıldı. Portalın access/refresh token JSON alanlarına ihtiyaç duymadığı doğrulandı; eski test mock'undaki token alanları kaldırıldı ve super-admin login yalnız `{ user }` gövdesiyle `/admin/dashboard` yönlendirmesini bekleyecek şekilde kararlılaştırıldı. İlk paralel koşuda sabit 2 saniyelik bekleme kaynaklı test yarışı tespit edilip hedef URL beklentisiyle giderildi. Backend koduna dokunulmadı.
**Dokunulan dosyalar:** `portal/tests/auth.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Token-gövdesiz login, httpOnly oturumu `/auth/me` ile doğrulama, tek refresh isteği, başarısız refresh'te login'e dönüş ve backend erişilemese de yerel logout çalışıyor. Auth Playwright paketi 12/12, lint ve temiz production build başarılı. 0.1, backend yanıt gövdesi ve Origin/CSRF kapanışı gelene kadar ⛔ durumda.
**Sıradaki:** Erol `accessToken` gövdesini kaldırıp production Origin/CSRF politikasını eklediğinde gerçek backend ile login → refresh → logout smoke testi yapmak.
**Erol'a not (varsa):** `withoutRefreshToken()` yalnız `{ user }` (refresh için gerekirse tokensız oturum metadatası) dönmeli. Production `SameSite=None; Secure` kullanılırken CORS tek başına CSRF koruması değildir; unsafe metotlarda Origin/Referer allowlist veya CSRF token doğrulaması ve bunların negatif testleri gerekir.

### 2026-07-23 — İl bilgi balonunda aktif erken uyarı

**Yapılanlar:** Türkiye haritasındaki il bilgi balonuna risk statüsü ve aşılama kapsamından ayrı bir aktif erken uyarı satırı eklendi. Aktif sinyali bulunan Konya gibi illerde adet vurgulu biçimde gösteriliyor; Ankara gibi sinyali olmayan illerde `Aktif erken uyarı yok` ifadesi kullanılıyor. Böylece risk dağılımı ile operasyonel uyarı adedi aynı balonda ayrı metrikler olarak okunuyor. Her iki durumu koruyan Playwright beklentileri eklendi.
**Dokunulan dosyalar:** `portal/src/components/ministry/turkey-province-map.tsx`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1366×768 görünümde Konya tooltip'i `42 · Konya`, `Kritik`, `%74` ve `1 aktif erken uyarı` bilgilerini kompakt biçimde gösteriyor; haritayı veya il detayını kapatmıyor. Ankara varsayılan tooltip'inde aktif uyarı olmadığı açık. Yatay taşma ve tarayıcı hatası yok; hedef Bakanlık Playwright paketi 2/2, lint ve temiz production build başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu adım mevcut sentetik `activeAlerts` alanını kullandı; yeni backend ihtiyacı yok. Pilot aşamasında değer il özet/erken uyarı sözleşmesinden beslenecek.

### 2026-07-23 — Bakanlık risk ve aktif uyarı metrik ayrımı

**Yapılanlar:** Haritadaki 41 `İzleniyor` il ile üst KPI'daki 4 aktif erken uyarının aynı metrik sanılmasını önlemek için lejanta `İl risk dağılımı` başlığı eklendi. Harita altındaki açıklama, risk statüsünün aktif uyarı adedinden farklı olduğunu ve aşılama kapsamı ile sentetik sinyallerin birlikte değerlendirilmesiyle hesaplandığını açıkça belirtecek şekilde genişletildi. Harita verileri, sayılar ve etkileşim davranışları değiştirilmedi; ayrımı koruyan Playwright beklentileri eklendi.
**Dokunulan dosyalar:** `portal/src/components/ministry/turkey-province-map.tsx`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1366×768 görünümde `İl risk dağılımı` başlığı ve metrik açıklaması okunuyor; lejant tek satırda kalıyor. Ankara seçimi, Konya bilgi balonu, 39/41/1 il dağılımı ve drill-down çalışmaya devam ediyor. Yatay taşma veya tarayıcı hatası yok; hedef Bakanlık Playwright paketi 2/2, lint ve temiz production build başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu açıklık düzenlemesi yalnız frontend sunum dilini etkiledi; yeni backend ihtiyacı yok.

### 2026-07-23 — Bakanlık risk lejantı il dağılımı

**Yapılanlar:** Türkiye haritasının risk lejantı mevcut 81 il sentetik verisinden dinamik sayı hesaplayacak şekilde geliştirildi. Lejant artık renk anlamlarının yanında `Normal 39 il`, `İzleniyor 41 il` ve `Kritik 1 il` dağılımını gösteriyor. Sayılar statik metin değil, il listesindeki `riskLevel` alanlarından türetiliyor; tooltip, harita seçimi ve drill-down davranışı korunuyor. Üç risk grubunun toplamını ve ekrandaki değerlerini doğrulayan Playwright beklentileri eklendi.
**Dokunulan dosyalar:** `portal/src/components/ministry/turkey-province-map.tsx`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1366×768 görünümde üç risk grubu tek satırda okunuyor, yatay taşma ve tarayıcı hatası yok. Konya bilgi balonu ve Ankara seçimi çalışmaya devam ediyor. Hedef Bakanlık Playwright paketi 2/2, lint ve temiz önbellekle production build başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu adım mevcut sentetik il risklerini kullandı; yeni backend ihtiyacı yok. Pilot aşamasında sayılar canlı il risk özeti sözleşmesinden türetilecek.

### 2026-07-23 — Bakanlık haritası anlık il bilgi balonu

**Yapılanlar:** Gerçek Türkiye haritasındaki 81 il alanına pointer hover ve klavye odağıyla çalışan anlık bilgi balonu eklendi. Bilgi balonu plaka kodu, il adı, risk seviyesi ve aşılama kapsamını gösteriyor; pointer ayrıldığında seçili ilin bilgisine dönüyor. Mevcut tıklama ve Enter/Space drill-down davranışı korundu. Konya hover durumunu kalıcı Playwright senaryosu kapsamına alan doğrulama eklendi.
**Dokunulan dosyalar:** `portal/src/components/ministry/turkey-province-map.tsx`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1366×768 görünümde Konya bilgi balonu `42 · Konya`, `Kritik` ve `%74` kapsam değerleriyle anında açılıyor; harita veya il detay panelini kapatmıyor. Yatay taşma ve tarayıcı hatası yok. Hedef Bakanlık Playwright paketi 2/2, lint ve production build başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu adım mevcut sentetik il metriklerini kullandı; yeni backend ihtiyacı yok. Pilot aşamasında bilgi balonundaki değerler canlı il özeti sözleşmesinden beslenecek.

### 2026-07-23 — Gerçek 81 il sınırlarıyla Türkiye haritası

**Yapılanlar:** Bakanlık konsolundaki şematik Türkiye silüeti ve il noktaları, T.C. Tarım ve Orman Bakanlığı CBS il sınırları katmanından yerel statik veriye dönüştürülen gerçek Türkiye haritasıyla değiştirildi. 81 ilin tamamı ayrı SVG alanı olarak risk düzeyine göre renklendirildi; fare, Enter ve Space ile il seçimi, seçili il vurgusu ve erişilebilir il açıklamaları eklendi. Harita çalışma zamanında dış servise istek atmıyor. Veri kaynağı ve sınırların gösterim amaçlı olduğu ekran üzerinde belirtildi. React 19'un SVG başlık uyarısı tek metin kullanılarak giderildi.
**Dokunulan dosyalar:** `portal/src/components/ministry/turkey-province-map.tsx`, `portal/src/lib/turkey-province-map-data.ts`, `portal/src/lib/turkey-provinces.geojson.json`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/bakanlik` üzerinde tam Türkiye silüeti, 81 tıklanabilir il alanı, Ankara varsayılan seçimi, Konya harita drill-down ve Kars erken uyarı geçişi çalışıyor. 1366×768 görünümde yatay taşma yok; tarayıcı geliştirme günlüğünde hata/uyarı kalmadı. Hedef Bakanlık Playwright paketi 2/2, lint ve production build başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Faz 0 haritası yerel sentetik metriklerle bağımsız çalışıyor; yeni backend ihtiyacı yok. Pilot aşamasında canlı ulusal metrikler, il bazlı detaylar ve erken uyarı verileri için sözleşme gerekecek.

### 2026-07-23 — Bakanlık konsolu projektör görünümü doğrulaması

**Yapılanlar:** Faz 0'ın para ekranı `/bakanlik`, tipik laptop/projektör çözünürlüğü olan 1366×768'de etkileşimli denetlendi. İlk karede ulusal başlık, dört KPI, 81 il haritası ve Ankara il panelinin birlikte görünür olduğu doğrulandı. Haritadan Konya seçimi aktif erken uyarı sinyalini gösterdi; bölgesel aşılama ve ulusal popülasyon grafikleri görünür kaldı. Kars erken uyarı kartı tıklanınca ekran il genel görünümüne kaydı, seçim `36 · Kars` oldu ve Kars detay paneli üstte okunur biçimde gösterildi. Yatay taşma veya sunum-kritik kesilme bulunmadığından uygulama koduna gereksiz değişiklik yapılmadı.
**Dokunulan dosyalar:** `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** 1366×768 ilk görünüm, Konya harita drill-down, iki analitik grafik, erken uyarı akışı ve Kars geri odaklanması çalışıyor. Hedef Bakanlık Playwright paketi 2/2, lint ve production build başarılı; build'in ilk sandbox port kısıtı izinli yeniden koşuda giderildi.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bakanlık konsolu sentetik veriyle bağımsız çalışıyor; bu doğrulamada yeni backend ihtiyacı çıkmadı.

### 2026-07-23 — Pamuk ve Sarıkız aşı kartı cihaz doğrulaması

**Yapılanlar:** 0.8'in sunum odağı olan aşı kayıtları 390×844 dokunmatik cihaz bağlamında etkileşimli denetlendi. Pamuk'ta Aşı sekmesi açılarak Kuduz ve yaklaşan Karma (FVRCP) kayıtlarının uygulama/sonraki doz tarihleri, seri bilgileri ve pilot klinik etiketi doğrulandı; Kartı Paylaş hedefi 350×49px ölçüldü. Sarıkız'da %100 kapsam, Şap, Nodüler Ekzantem ve Brusella kayıtları ile seri/tarih alanları kaydırma sonrasında kontrol edildi. İki ekranda da yatay taşma veya içerik kesilmesi bulunmadığından uygulama koduna gereksiz değişiklik yapılmadı.
**Dokunulan dosyalar:** `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Pamuk Aşı sekmesi tek dokunuşla açılıyor, iki sentetik kayıt ve paylaşım eylemi görünür. Sarıkız aşı kartındaki üç kayıt ile kapsam göstergesi mevcut ve olay geçmişine geçiş doğal kaydırmayla çalışıyor. Mobil TypeScript kontrolü, Expo production web export ve son görsel/etkileşim turu başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu doğrulama sentetik aşı verileriyle tamamlandı; yeni backend ihtiyacı çıkmadı.

### 2026-07-23 — Expo detay ekranları cihaz ergonomisi

**Yapılanlar:** Pamuk evcil hayvan ve Sarıkız üretici detayları 390×844 dokunmatik cihaz bağlamında denetlendi. Pamuk kayıt sekmelerinin yalnız 33px yüksekliğinde olduğu tespit edildi; Geri, QR ve beş kayıt sekmesi en az 44px dokunma yüksekliğine getirildi. Sarıkız geri eylemi de 44px'e tamamlandı. Pamuk sekme şeridinin 57px yatay kaydığı ve Lab kaydını açtığı, Sarıkız içeriğinin 856px kayarak yaşam boyu olay zinciri ile sentetik veri dipnotuna ulaştığı doğrulandı.
**Dokunulan dosyalar:** `mobile/app/(tabs)/pets/[id].tsx`, `mobile/app/(tabs)/pets/producer-demo.tsx`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Pamuk'ta Geri, QR, Özet, Muayene, Aşı, Reçete ve Lab hedeflerinin tamamı 44px; Sarıkız geri hedefi 44px. Lab sekmesi ve son olay kaydı erişilebilir, sabit alt navigasyon içeriği kapatmıyor. Mobil TypeScript kontrolü, Expo production web export ve son 390×844 görsel/etkileşim turu başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu adım yalnız mevcut sentetik mobil demo ekranlarının cihaz ergonomisini iyileştirdi; yeni backend ihtiyacı çıkmadı.

### 2026-07-23 — Expo mobil demo fallback cilası

**Yapılanlar:** Hayvanlarım ekranı Expo web mobil görünümünde canlı API açık değilken denetlendi. Pamuk ve Sarıkız demo kartları kullanılabilir olmasına rağmen sayfayı kaplayan yükleme göstergesi ile bağlantı hatasının altında “Henüz hayvan eklenmedi” mesajının birlikte görünmesi düzeltildi. Yükleme hali kompakt ve demo profillerinin kullanılabildiğini belirten bir durum kartına dönüştürüldü; bağlantı hatasında canlı kayıtlarla sentetik sunum profilleri açıkça ayrıştırıldı. Pamuk evcil hayvan ve Sarıkız üretici detayları ayrıca görsel olarak kontrol edildi, demo-kritik sorun bulunmadığı için kapsam dışı değişiklik yapılmadı.
**Dokunulan dosyalar:** `mobile/app/(tabs)/pets/index.tsx`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/pets` yükleme ve API-hata durumlarında Pamuk ile Sarıkız erişilebilir kalıyor; yanıltıcı boş liste mesajı gösterilmiyor. Mobil TypeScript kontrolü, Expo production web export ve 390px genişlikte yükleme/hata görsel kontrolleri başarılı.
**Sıradaki:** Provaları şimdilik bekletmek; yalnız demo-kritik yeni bulguları ele almak ve Erol'dan gelen backend sözleşmelerini geldiğinde doğrulamak.
**Erol'a not (varsa):** Bu cila sentetik mobil demo akışında kaldı; yeni backend ihtiyacı çıkmadı. Canlı hayvan listesi mevcut servis entegrasyon noktasından geldiğinde aynı durum ayrımı korunacak.

### 2026-07-23 — Üretici ve belediye mobil dokunma ergonomisi

**Yapılanlar:** Üretici işletme kaydı → küpe girişi → işletmeler arası hareket → Sarıkız olay geçmişi ile belediye barınak kabulü → kısırlaştırma → sahiplendirme ilanı akışları 390×844, `hasTouch` mobil bağlamında uçtan uca çalıştırıldı. İki başlangıç eyleminin yalnız 32px olduğu tespit edildi. Başlangıç/sıfırlama, form iptal/kayıt, küpe doğrulama, barınak kabulü, kayıt açma ve ilan yayımlama eylemleri mobilde tam genişlik ve en az 44px dokunma yüksekliğine getirildi; geniş ekranda mevcut kompakt düzen korundu. Görsel kontrolde kesilen belediye başlığı mobilde “VetCep Belediye”, geniş ekranda tam ad olacak şekilde düzeltildi. Dokunma yüksekliği ve iki akışın nihai başarı durumunu koruyan kalıcı E2E testi eklendi.
**Dokunulan dosyalar:** `portal/src/app/(livestock)/hayvancilik/page.tsx`, `portal/src/app/(livestock)/hayvancilik/isletmeler/yeni/page.tsx`, `portal/src/app/(livestock)/hayvancilik/hayvanlar/yeni/page.tsx`, `portal/src/app/(municipality)/belediye/layout.tsx`, `portal/src/app/(municipality)/belediye/page.tsx`, `portal/src/app/(municipality)/belediye/barinak-giris/page.tsx`, `portal/src/app/(municipality)/belediye/sahiplendirme/yeni/page.tsx`, `portal/tests/demo-touch.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Üretici ve belediye mobil senaryoları gerçek touch bağlamında eksiksiz tamamlanıyor; birincil eylemler 44px veya daha yüksek. Responsive + touch hedef paketi 15/15, tam Playwright turu 63 geçti/1 environment testi atlandı; lint ve production build başarılı.
**Sıradaki:** Prova çalışmalarını şimdilik bekletip Expo mobil demo ekranlarında yalnız mevcut Pamuk + Sarıkız senaryosunun hata/boş durum ve görsel tutarlılık cilasını denetlemek.
**Erol'a not (varsa):** Bu adım tamamen sentetik frontend demo akışında kaldı; yeni backend ihtiyacı çıkmadı. Klinik bildirim ve httpOnly-cookie auth kapanış notları geçerli.

### 2026-07-23 — Faz 0 mobil dayanıklılık ve vatandaş geçiş cilası

**Yapılanlar:** Faz 0'ın vatandaş, sunum kumandası, üretici, belediye ve Bakanlık yüzeyleri 390×844 mobil ve 1440×1000 masaüstü görünümlerde denetlendi. e-Devlet demo girişinden sonraki `source=edevlet-demo` parametresinin yok sayıldığı ve genel indirme sayfasında yayımlanmamış uygulama için mağaza linkleri gösterildiği tespit edildi. Demo kaynağına özel olarak gerçek doğrulama/veri aktarımı yapılmadığını açıklayan başarı durumu, Pamuk + Sarıkız mobil senaryo özeti ve sunum akışına dönüş eklendi; App Store, Google Play ve placeholder portal bağlantıları demo modunda kaldırıldı. On üç Faz 0 rotasında mobil yatay taşma ve çalışma zamanı hatası kontrolü yapan kalıcı Playwright regresyonu eklendi.
**Dokunulan dosyalar:** `portal/src/app/get-app/page.tsx`, `portal/tests/citizen-login.spec.ts`, `portal/tests/demo-responsive.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Vatandaş girişi → mobil demo geçişi açık simülasyon diliyle çalışıyor; evcil ve üretim hayvanı kapsamı görünür. Hedef testler 15/15, tam Playwright turu 61 geçti/1 environment testi atlandı; lint ve production build başarılı. Denetlenen 13 mobil demo rotasında yatay taşma veya page error yok.
**Sıradaki:** Güncel build ile 25 dakikalık kronometreli insan provası yapmak; yalnız sunumu engelleyen yeni bulgu çıkarsa düzeltmek. Erol'un klinik bildirim ve 0.1 auth işlerini ayrı sözleşme turunda doğrulamak.
**Erol'a not (varsa):** Bu adımda yeni backend ihtiyacı çıkmadı. Önceki klinik bildirim endpoint'i ve httpOnly-cookie auth kapanış notları geçerliliğini koruyor.

### 2026-07-22 — Veteriner bildirim 403 rol sözleşmesi

**Yapılanlar:** Veteriner oturumunda oluşan 403'ün kaynağı, backend `/notifications` servisinin yalnızca `OWNER` rolünü kabul etmesine rağmen portalın tüm klinik rollerinde bu endpoint'i çağırması olarak doğrulandı. Sidebar ve bildirim ekranı owner bildirim sorgusunu yalnızca `OWNER` için çalıştıracak hale getirildi; sorgu anahtarına kullanıcı kimliği eklenerek kullanıcılar arası cache sızıntısı önlendi. Backend'in `body`, `payload` ve `status` alanları portalın `message`, `type` ve `isRead` modeline normalize edildi. Klinik kullanıcılarına hatalı istek yerine entegrasyon durumunu dürüstçe açıklayan temiz bir bilgi ekranı eklendi.
**Dokunulan dosyalar:** `portal/src/services/notifications.service.ts`, `portal/src/hooks/use-notifications.ts`, `portal/src/components/layout/sidebar.tsx`, `portal/src/app/(dashboard)/notifications/page.tsx`, `portal/tests/notifications.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Gerçek `vet@example.com` oturumunda dashboard ve bildirim ekranı ziyaret edildi; owner bildirim API çağrısı yapılmadı ve 403 kaldırıldı. Owner yanıt normalizasyonu ile klinik rol korumasını kapsayan hedef testler 2/2, tam Playwright turu 48 geçti/1 environment testi atlandı; lint ve production build başarılı.
**Sıradaki:** Erol klinik kapsamlı bildirim endpoint'ini sağladığında role göre servis seçimini ekleyip veteriner bildirim listesini gerçek veriye bağlamak; 0.1 auth backend kapanışını ayrıca doğrulamak.
**Erol'a not (varsa):** Mevcut `GET /notifications` ve okundu işaretleme akışı yalnız `OWNER`; portal artık veteriner/klinik admin rollerinde bunları çağırmıyor. `clinicId` ile scope edilen listeleme + okundu işaretleme endpoint'leri, `VETERINARIAN`/`CLINIC_ADMIN` yetkileri, `SUPER_ADMIN` kararı ve kararlı/belgeli yanıt modeli gerekiyor.

### 2026-07-22 — Link-buton erişilebilirlik semantiği

**Yapılanlar:** Base UI `Button` bileşenine Next `Link` render eden 13 kullanım kaldırıldı. Randevu listesi/detayı, abonelik sonuçları, abonelik guard'ı ve admin klinik detayındaki navigasyon eylemleri gerçek `<a>` öğeleri olarak bırakılıp ortak `buttonVariants` ile görsel olarak butonlaştırıldı. Böylece Base UI native-button uyarısı giderilirken klavye ve ekran okuyucu link semantiği korundu. Anchor etiketi, `href` değerleri ve konsol uyarısının yokluğu için Playwright regresyon testi eklendi.
**Dokunulan dosyalar:** `portal/src/app/(admin)/admin/clinics/[id]/page.tsx`, `portal/src/app/(dashboard)/appointments/page.tsx`, `portal/src/app/(dashboard)/appointments/[id]/page.tsx`, `portal/src/app/(dashboard)/billing/success/page.tsx`, `portal/src/app/(dashboard)/billing/cancel/page.tsx`, `portal/src/components/shared/subscription-guard.tsx`, `portal/tests/product-flows.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Yeni Randevu, randevu detay, Kliniklere Dön, ödeme sonucu ve abonelik navigasyonları gerçek link olarak çalışıyor; native `<button>` konsol uyarısı yok. Hedef ürün testleri 8/8, tam Playwright turu 46 geçti/1 prod smoke atlandı; lint ve production build başarılı.
**Sıradaki:** Gerçek veteriner oturumunda sidebar ve bildirim ekranının aldığı 403 yanıtını rol/endpoint sözleşmesi açısından teşhis edip frontend işi ile Erol işi arasındaki sınırı çıkarmak.
**Erol'a not (varsa):** Bu adımda backend ihtiyacı yok. 0.1 için önceki access-token yanıt gövdesi, production cookie/CORS/CSRF ve Redis secret notları geçerliliğini koruyor.

### 2026-07-22 — Portal httpOnly-cookie oturum güvenliği

**Yapılanlar:** Zustand auth store'un localStorage persist katmanı kaldırıldı. Klinik ve admin layout'ları, içerik göstermeden önce `/auth/me` üzerinden gerçek httpOnly-cookie oturumunu doğrulayan ortak `AuthGuard` ile korundu. 401 interceptor'ında eşzamanlı refresh istekleri tek promise altında birleştirildi; başarısız refresh merkezi oturum-sonlandı olayıyla marker ve store'u temizliyor. Login güvenli `next` yönlendirmesini destekler hale getirildi; logout backend erişilemese de yerel oturumu kapatıyor. Korumalı ekran testleri localStorage taklidi yerine mock `/auth/me` sözleşmesine taşındı.
**Dokunulan dosyalar:** `portal/src/lib/auth-session.ts`, `portal/src/lib/api.ts`, `portal/src/services/auth.service.ts`, `portal/src/stores/auth.store.ts`, `portal/src/components/auth/auth-guard.tsx`, `portal/src/app/(dashboard)/layout.tsx`, `portal/src/app/(admin)/admin/layout.tsx`, `portal/src/app/(auth)/login/page.tsx`, `portal/src/proxy.ts`, `portal/tests/helpers/auth.ts`, `portal/tests/auth.spec.ts`, `portal/tests/patients.spec.ts`, `portal/tests/examination.spec.ts`, `portal/tests/product-flows.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Gerçek backend ile klinik login → dashboard → sayfa yenileme → `/auth/me` doğrulama → logout geçti. Access ve refresh cookie'leri httpOnly, portal marker'ı hassas olmayan navigasyon işareti ve `epati-auth` localStorage kaydı yok. Lint ve production build başarılı; tam Playwright turunda 45 test geçti, environment gerektiren 1 prod smoke testi atlandı.
**Sıradaki:** Erol backend auth yanıtlarından access token gövdesini kaldırdıktan ve üretim cookie/CORS/CSRF politikasını netleştirdikten sonra gerçek ortam smoke testiyle 0.1'i ✅ yapmak.
**Erol'a not (varsa):** `AuthController.withoutRefreshToken()` halen `{ accessToken, user }` dönüyor. `login`, `clinic/login`, `verify-otp` ve `refresh` yanıtlarında yalnızca kullanıcı/oturum metadatası dönmeli; access/refresh token yalnızca httpOnly cookie'de kalmalı. Üretim CORS originleri ve CSRF/Origin koruması da cookie ayarlarıyla birlikte doğrulanmalı. Redis secret rotasyonu/geçmiş temizliği backend sorumluluğunda devam ediyor.

### 2026-07-22 — Konuşmacı metni ve düşmanca soru prova paketi

**Yapılanlar:** Yedi demo bölümünü 25 dakikalık kumandayla birebir eşleyen konuşmacı metni hazırlandı. Her bölüm için söylenecek ana mesaj, canlı tıklama sırası, geçiş cümlesi, zorunlu dürüstlük ifadesi ve süre kurtarma noktası tanımlandı. Toplantı süresinin kısalması için 20 dakikalık alternatif rota, on muhtemel Bakanlık sorusuna 30–45 saniyelik cevaplar ve prova değerlendirme formu eklendi. Teknik runbook'tan konuşma metnine bağlantı verildi.
**Dokunulan dosyalar:** `DEMO-PROVA-KONUSMA-METNI.md`, `DEMO-PROVA-RUNBOOK.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Kod veya ekran davranışı değişmedi. Konuşma paketi `/demo-akisi` içindeki 00:00–25:00 bölüm sınırları, mevcut demo rotaları ve sentetik veri açıklamalarıyla uyumlu. İnsan anlatımlı kronometreli prova henüz yapılmadı.
**Sıradaki:** Metni kelimesi kelimesine okumadan ilk tam provayı yapmak; geçiş zamanlarını değerlendirme formuna kaydedip yalnızca süre veya akış engellerini düzeltmek.
**Erol'a not (varsa):** Yeni backend ihtiyacı yok. İlk insan anlatımlı prova sırasında gerçek klinik/seed akışında sorun görülürse Erol'a health, migration ve seed bulgusuyla birlikte net mesaj hazırlanacak.

### 2026-07-22 — İlk teknik demo provası ve sunum runbook'u

**Yapılanlar:** Backend health/readiness ve gerçek veteriner girişi doğrulandı; portalda klinik girişinden Misket profili ve aşı kaydına kadar gerçek servisli akış prova edildi. Backend'in kabul ettiği üst sınırı aşan `limit=500` istekleri `100` değerine çekilerek Misket aşı-hasta eşleşmesi düzeltildi. Vatandaş, sunum kumandası, üretici, belediye ve Bakanlık akışları tek işçili Chromium turunda doğrulandı. Sunum ön kontrolü, dakika dakika rota, arıza B planı, zor soru cevapları ve go/no-go listesini içeren runbook eklendi.
**Dokunulan dosyalar:** `portal/src/hooks/use-clinic.ts`, `portal/src/components/shared/dashboard-chart.tsx`, `DEMO-PROVA-RUNBOOK.md`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Backend 0 derleme hatasıyla açılıyor; health, readiness ve demo klinik girişi 200. Misket arama, profil ve aşı akışı çalışıyor. Portal lint, 10/10 Faz 0 Playwright testi, mobil TypeScript kontrolü ve Expo web export başarılı. Teknik prova tamamlandı; insan anlatımlı iki kronometreli prova henüz yapılmadı.
**Sıradaki:** `DEMO-PROVA-RUNBOOK.md` ile iki tam 25 dakikalık prova yapmak; ikinci provada HAYBİS entegrasyonu, veri barındırma, ekip kapasitesi, TÜBİTAK alternatifi ve şirket sürekliliği sorularını sesli yanıtlamak.
**Erol'a not (varsa):** Yeni backend işi gerekmiyor. Lokal şema güncellemelerinden sonra `npm run db:generate` zorunlu; demo verisi kaybolursa migration/seed durumu Burak ve Erol birlikte kontrol edilmeli.

### 2026-07-21 — 25 dakikalık Faz 0 sunum kumandası

**Yapılanlar:** `/demo-akisi` altında yedi bölümlük ve toplam 25 dakikalık presenter kumandası geliştirildi. Açılış/konumlandırma, vatandaş ve mobil, klinik, üretici, belediye, Bakanlık karar desteği ve pilot kapanışı için hedef süre, seyirciye ana mesaj, konuşmacı notu ve kontrol listeleri tanımlandı. Canlı sayaç, bölüm ilerlemesi, yeni sekmede demo ekranı açma ve hayvancılık/belediye Zustand durumlarını topluca sıfırlama eklendi. Demo yüzeylerine kumandaya dönüş bağlantıları yerleştirildi.
**Dokunulan dosyalar:** `portal/src/app/(demo)/demo-akisi/page.tsx`, `portal/src/lib/demo-presentation-data.ts`, `portal/src/stores/demo-presentation.store.ts`, `portal/src/app/(auth)/vatandas-giris/page.tsx`, `portal/src/app/get-app/page.tsx`, `portal/src/app/(livestock)/hayvancilik/layout.tsx`, `portal/src/app/(municipality)/belediye/layout.tsx`, `portal/src/app/(ministry)/bakanlik/layout.tsx`, `portal/src/proxy.ts`, `portal/tests/demo-presentation.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/demo-akisi` oturumsuz ve klinik oturumu açıkken erişilebilir. 7 bölüm, 25:00 hedefi, sayaç, ileri geçiş, ekran bağlantıları ve toplu reset çalışıyor. Lint, production build, masaüstü görsel kontrol ve 2 Playwright senaryosu başarılı.
**Sıradaki:** Kumandayla iki tam 25 dakikalık prova yapmak; ardından HAYBİS entegrasyonu, veri barındırma, iki kişilik ekip, TÜBİTAK alternatifi ve şirket sürekliliği sorularına karşı düşmanca soru turu yürütmek.
**Erol'a not (varsa):** Faz 0 sunum rotası için yeni backend ihtiyacı yok. `d55f3a2` registry/seed verisi klinik ve ulusal kayıt bölümlerinde kullanılacak; demo öncesi lokal seed ve servislerin ayakta olduğu birlikte doğrulanmalı.

### 2026-07-21 — Sokak hayvanı belediye demo akışı

**Yapılanlar:** Tek belediyeye ait bağımsız `/belediye` operasyon alanı geliştirildi. Dost isimli sentetik sokak köpeğinin hassas konum paylaşmadan barınak kabulü ve HKN oluşturması, komplikasyonsuz kısırlaştırma kaydı ve doğrulanmış sağlık bilgilerinden sahiplendirme ilanı yayımlaması üç adımlı kalıcı Zustand akışına bağlandı. Demo sıfırlama, ilerleme göstergesi ve açık simülasyon etiketleri eklendi.
**Dokunulan dosyalar:** `portal/src/app/(municipality)/belediye/layout.tsx`, `portal/src/app/(municipality)/belediye/page.tsx`, `portal/src/app/(municipality)/belediye/barinak-giris/page.tsx`, `portal/src/app/(municipality)/belediye/kisirlastirma/page.tsx`, `portal/src/app/(municipality)/belediye/sahiplendirme/yeni/page.tsx`, `portal/src/components/municipality/municipality-demo-steps.tsx`, `portal/src/lib/municipality-demo-data.ts`, `portal/src/stores/municipality-demo.store.ts`, `portal/src/proxy.ts`, `portal/tests/municipality-demo.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** Barınak girişi → kısırlaştırma → sahiplendirme ilanı zinciri backend olmadan çalışıyor; ilan sonunda “Yayında · Demo” önizlemesi gösteriliyor. Klinik oturumu açıkken de erişilebilir. Lint, production build, üç ana ekranın görsel kontrolü ve 2 Playwright senaryosu başarılı.
**Sıradaki:** 0.7, 0.8, 0.3, 0.4 ve 0.5 ekranlarını tek 25 dakikalık sunum rotasında bağlamak; demo sıfırlama ve geçişlerini prova etmek.
**Erol'a not (varsa):** Faz 0 için backend ihtiyacı yok. Registry çekirdeği main'e alındı; canlı belediye entegrasyonu için kısırlaştırma işlemi ve sahiplendirme ilanı durumlarına ait endpoint/şema alanları gerekecek.

### 2026-07-21 — Büyükbaş/küçükbaş üretici demo akışı

**Yapılanlar:** HAYBİS/TÜRKVET'in yerine geçmediğini açıkça belirten bağımsız `/hayvancilik` demo alanı geliştirildi. Üretici paneli, sentetik işletme kayıt formu, küpe ile Sarıkız girişi, Güneş Süt İşletmesi'nden Bereket Besi Çiftliği'ne hareket onayı ve HKN altında birleşen yaşam boyu olay geçmişi Zustand ile kalıcı mock akışa bağlandı. Demo sıfırlama ve senaryo ilerleme göstergeleri eklendi.
**Dokunulan dosyalar:** `portal/src/app/(livestock)/hayvancilik/layout.tsx`, `portal/src/app/(livestock)/hayvancilik/page.tsx`, `portal/src/app/(livestock)/hayvancilik/isletmeler/yeni/page.tsx`, `portal/src/app/(livestock)/hayvancilik/hayvanlar/yeni/page.tsx`, `portal/src/app/(livestock)/hayvancilik/hareket/page.tsx`, `portal/src/app/(livestock)/hayvancilik/hayvanlar/[id]/page.tsx`, `portal/src/components/livestock/livestock-demo-steps.tsx`, `portal/src/lib/livestock-demo-data.ts`, `portal/src/stores/livestock-demo.store.ts`, `portal/src/proxy.ts`, `portal/tests/livestock-demo.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** İşletme kaydı → küpe doğrulama → iki işletme arası hareket → olay geçmişi zinciri backend olmadan çalışıyor. Klinik oturumu açıkken de demo erişilebilir. Lint, production build, üç ana ekranın görsel kontrolü ve 2 Playwright senaryosu başarılı.
**Sıradaki:** 0.4 sokak/belediye demo akışını barınak girişi → kısırlaştırma → sahiplendirme ilanı sınırında planlamak.
**Erol'a not (varsa):** Faz 0 için backend ihtiyacı yok. Canlı entegrasyonda işletme oluşturma/doğrulama, küpe-HKN eşleştirme, hareket onayı ve olay geçmişi endpoint sözleşmeleri gerekecek.

### 2026-07-21 — Mobil evcil hayvan ve üretici demo profilleri

**Yapılanlar:** Hayvanlarım ekranına backend'den bağımsız erişilebilen Pamuk ve Sarıkız sentetik demo profilleri eklendi. Pamuk'un mevcut detay deneyimi HKN/PETVET kimliği, muayene, aşı, reçete ve laboratuvar kayıtlarıyla demo modunda çalışır hale getirildi. Sarıkız için HKN, küpe, işletme, aşılama ve olay geçmişini gösteren üretici görünümü geliştirildi; demo profillerindeki kayıt değiştirme eylemleri kapatıldı.
**Dokunulan dosyalar:** `mobile/lib/mobile-demo-data.ts`, `mobile/app/(tabs)/pets/index.tsx`, `mobile/app/(tabs)/pets/[id].tsx`, `mobile/app/(tabs)/pets/producer-demo.tsx`, `mobile/app/(tabs)/pets/_layout.tsx`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/pets`, `/pets/demo-pamuk` ve `/pets/producer-demo` backend olmadan çalışıyor. TypeScript kontrolü, üç ekran için Expo web görsel kontrolü ve production web export başarılı. Expo'nun mevcut bağımlılık sürümü uyumluluk uyarıları devam ediyor; bu çalışma kapsamında paket güncellenmedi.
**Sıradaki:** 0.3 büyükbaş/küçükbaş demo ekranları için işletme kaydı, küpe ile giriş, hareket görünümü ve olay geçmişi akışını planlamak.
**Erol'a not (varsa):** Faz 0 demosu için backend ihtiyacı yok. Üretim entegrasyonunda HKN, küpe, işletme, aşılama ve olay geçmişi alanlarını kapsayan büyükbaş profil sözleşmesi gerekecek.

### 2026-07-21 — Bakanlık konsolu aşılama, popülasyon ve erken uyarı panoları

**Yapılanlar:** Bölgesel aşılama kapsamı için Recharts sütun grafiği, hayvan kimlik sınıfları için ulusal popülasyon dağılım grafiği ve dört sentetik sinyalden oluşan hastalık erken-uyarı akışı eklendi. Uyarı kartları ilgili ili seçip harita drill-down paneline taşıyacak şekilde bağlandı. Grafikler istemci tarafında dinamik yüklenerek statik build uyarıları giderildi; `next-themes` kaynaklı geliştirme hydration uyarısı kök layout'ta güvenli şekilde bastırıldı.
**Dokunulan dosyalar:** `portal/src/app/(ministry)/bakanlik/page.tsx`, `portal/src/components/ministry/ministry-analytics-panels.tsx`, `portal/src/components/ministry/disease-alert-feed.tsx`, `portal/tests/ministry-dashboard.spec.ts`, `portal/src/app/layout.tsx`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/bakanlik` Faz 0 kapsamıyla tamamlandı. Ulusal KPI, 81 il haritası, il drill-down, aşılama/popülasyon panoları ve tıklanabilir erken uyarı akışı çalışıyor. Sentetik veri ve resmî bildirim olmadığı ekranda açıkça belirtiliyor. Lint, temiz production build, tam sayfa görsel kontrol ve 2 Playwright senaryosu başarılı.
**Sıradaki:** 0.8 mobil demo için mevcut evcil hayvan kayıt/aşı ekranlarını denetlemek; ardından tek bir demo inek için üretici görünümünü planlamak.
**Erol'a not (varsa):** Faz 0 için backend ihtiyacı yok. Pilot aşamasında ulusal özet, bölgesel aşılama, il detayı ve erken uyarı endpointleri gerekecek.

### 2026-07-21 — Bakanlık konsolu ulusal harita ve il drill-down

**Yapılanlar:** SaaS admininden ayrı `/bakanlik` demo alanı oluşturuldu. 81 il için deterministik sentetik popülasyon, aşılama, işletme, veteriner ve risk verisi eklendi. Ulusal KPI kartları, koordinat tabanlı Türkiye haritası, il seçici ve seçilen ilin detay paneli geliştirildi. Bakanlık route'u klinik oturumu açıkken de sunumda erişilebilir hale getirildi.
**Dokunulan dosyalar:** `portal/src/app/(ministry)/bakanlik/layout.tsx`, `portal/src/app/(ministry)/bakanlik/page.tsx`, `portal/src/components/ministry/turkey-province-map.tsx`, `portal/src/components/ministry/province-detail-panel.tsx`, `portal/src/lib/ministry-demo-data.ts`, `portal/src/proxy.ts`, `portal/tests/ministry-dashboard.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/bakanlik` çalışıyor; 81 il noktası gösteriliyor, varsayılan Ankara görünümünden harita veya seçim alanıyla diğer illere drill-down yapılabiliyor. Lint, production build, görsel kontrol ve 2 Playwright senaryosu başarılı. Aşılama/popülasyon grafikleri ile ayrıntılı erken uyarı akışı henüz eklenmedi.
**Sıradaki:** 0.5'in ikinci parçasında Recharts ile aşılama ve popülasyon panolarını, ardından sentetik hastalık erken-uyarı akışını eklemek.
**Erol'a not (varsa):** Faz 0 demosu sentetik veriyle bağımsız çalışıyor; şu anda backend engeli yok. Pilot aşamasında ulusal özet, il detayı ve erken uyarı endpoint sözleşmeleri gerekecek.

### 2026-07-21 — e-Devlet tarzı vatandaş demo girişi

**Yapılanlar:** Simülasyon olarak açıkça etiketlenen, TC Kimlik No ve şifre alanlarına sahip kurumsal vatandaş giriş ekranı geliştirildi. Backend kullanılmadan mock giriş, form doğrulama ve vatandaş mobil deneyimine yönlendirme eklendi. Route erişimi klinik oturumu açıkken de sunumda çalışacak şekilde düzenlendi ve Playwright testi yazıldı.
**Dokunulan dosyalar:** `portal/src/app/(auth)/vatandas-giris/page.tsx`, `portal/src/proxy.ts`, `portal/tests/citizen-login.spec.ts`, `FRONTEND-ILERLEME.md`
**Ekran/akış durumu:** `/vatandas-giris` masaüstü görünümü ve form akışı çalışıyor; geçerli demo bilgileriyle `/get-app?source=edevlet-demo` adresine yönlendiriyor. Lint, production build ve 2 Playwright senaryosu başarılı. Gerçek e-Devlet bağlantısı bilinçli olarak yok ve ekranda açıkça belirtiliyor.
**Sıradaki:** 0.5 Bakanlık konsolu için ekranlar, dosyalar ve 81 il sentetik veri modelini planlamak.
**Erol'a not (varsa):** Faz 0 için backend ihtiyacı yok. Gerçek e-Devlet entegrasyonu Faz 1'de resmî protokol ve kimlik adaptörü gerektirecek.

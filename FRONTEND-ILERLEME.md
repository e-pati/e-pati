# Frontend & Mobil İlerleme Günlüğü — VetCep (Faz 0 Demo)

> **Bu dosya nedir?** Burak'ın (frontend/mobil) ChatGPT ile yürüttüğü çalışmanın canlı kaydıdır.
> Ana kaynak: [`MINISTRY-READINESS-ASSESSMENT.md`](MINISTRY-READINESS-ASSESSMENT.md) (§9 Faz 0 görev tablosu, §4 ürün modülleri).
> **Kural:** Her çalışma oturumundan sonra ChatGPT bu dosyayı günceller — "Genel Durum" bölümünü yeniler ve "Günlük Kayıtlar"a en üste yeni bir giriş ekler.
> Danışman (Claude) "neredeyiz?" sorusunda **önce bu dosyayı** okur.

---

## 1. Genel Durum Özeti

- **Aktif faz:** Faz 0 — Demo-Hazır (toplantıyı kazanmak için minimum)
- **Son güncelleme:** 21 Temmuz 2026 — 25 dakikalık Faz 0 sunum rotası tamamlandı
- **Frontend/mobil ilerleme:** %100
- **Aktif dal:** `feature/portal`
- **Sıradaki adım:** Sunum kumandasıyla iki tam prova yapmak ve Bakanlığın muhtemel zor sorularına karşı düşmanca soru turunu tamamlamak

---

## 2. Faz 0 — Frontend / Mobil Görev Takip Tablosu

Durum: ⬜ başlanmadı · 🟡 devam ediyor · ✅ tamamlandı · ⛔ Erol'a (backend) bağlı, bekliyor

| # | Görev | Sorumlu | Durum | Not |
|---|---|---|---|---|
| 0.1 | Portal token'ı localStorage → httpOnly cookie (güvenlik) | Burak + Erol | ⬜ | 0.1'in ana sahibi Erol; portal tarafı Burak'ta |
| 0.3 | Büyükbaş/küçükbaş demo ekranları (işletme kaydı, küpe ile hayvan girişi, hareket görünümü, olay geçmişi) | Burak | ✅ | Sentetik işletme kaydı, Sarıkız küpe girişi, iki işletme arası hareket ve olay geçmişi tamamlandı |
| 0.4 | Sokak/belediye demo ekranları (barınak girişi → kısırlaştırma → sahiplendirme ilanı) | Burak | ✅ | Dost için barınak kabulü, kısırlaştırma kaydı ve yayımlanan sahiplendirme ilanı tamamlandı |
| 0.5 | **Bakanlık konsolu (PARA EKRANI):** ulusal harita + il drill-down, aşılama/popülasyon panoları, sahte hastalık-uyarı akışı | Burak | ✅ | 81 il, ulusal KPI, harita/drill-down, Recharts panoları ve tıklanabilir erken uyarı akışı tamamlandı |
| 0.7 | e-Devlet tarzı vatandaş giriş ekranı (görsel simülasyon) | Burak | ✅ | Mock giriş, açık simülasyon etiketi ve mobil deneyime yönlendirme tamamlandı |
| 0.8 | Mobil demo: bir evcil hayvan + bir inek (üretici görünümü) için aşı kartı & kayıtlar | Burak | ✅ | Pamuk ve Sarıkız sentetik profilleri; kimlik, aşı ve olay kayıtları tamamlandı |
| Demo | **25 dakikalık Faz 0 sunum rotası:** vatandaş/mobil → klinik → üretici → belediye → Bakanlık → pilot kapanışı | Burak | ✅ | 7 bölümlük presenter kumandası, canlı süre, toplu reset ve ekran geçişleri tamamlandı |

**Erol'dan (backend) beklenenler:**
- Faz 0 demosu için engel yok. Erol'un `d55f3a2` ile gönderdiği registry çekirdeği işletme, kimliklendirme ve hareket temelini sağlıyor; canlı belediye akışında kısırlaştırma ve sahiplendirme endpoint sözleşmeleri ayrıca gerekecek.

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

<!-- Yeni kayıtları buradan itibaren, en üste ekle -->

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

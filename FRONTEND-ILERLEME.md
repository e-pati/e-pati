# Frontend & Mobil İlerleme Günlüğü — VetCep (Faz 0 Demo)

> **Bu dosya nedir?** Burak'ın (frontend/mobil) ChatGPT ile yürüttüğü çalışmanın canlı kaydıdır.
> Ana kaynak: [`MINISTRY-READINESS-ASSESSMENT.md`](MINISTRY-READINESS-ASSESSMENT.md) (§9 Faz 0 görev tablosu, §4 ürün modülleri).
> **Kural:** Her çalışma oturumundan sonra ChatGPT bu dosyayı günceller — "Genel Durum" bölümünü yeniler ve "Günlük Kayıtlar"a en üste yeni bir giriş ekler.
> Danışman (Claude) "neredeyiz?" sorusunda **önce bu dosyayı** okur.

---

## 1. Genel Durum Özeti

- **Aktif faz:** Faz 0 — Demo-Hazır (toplantıyı kazanmak için minimum)
- **Son güncelleme:** 21 Temmuz 2026 — 0.5 Bakanlık konsolu tamamlandı
- **Frontend/mobil ilerleme:** %45
- **Aktif dal:** `feature/portal`
- **Sıradaki adım:** 0.8 mobil demo için mevcut evcil hayvan ekranlarını denetlemek ve üretici/inek görünümünü planlamak

---

## 2. Faz 0 — Frontend / Mobil Görev Takip Tablosu

Durum: ⬜ başlanmadı · 🟡 devam ediyor · ✅ tamamlandı · ⛔ Erol'a (backend) bağlı, bekliyor

| # | Görev | Sorumlu | Durum | Not |
|---|---|---|---|---|
| 0.1 | Portal token'ı localStorage → httpOnly cookie (güvenlik) | Burak + Erol | ⬜ | 0.1'in ana sahibi Erol; portal tarafı Burak'ta |
| 0.3 | Büyükbaş/küçükbaş demo ekranları (işletme kaydı, küpe ile hayvan girişi, hareket görünümü, olay geçmişi) | Burak | ⬜ | Şema v2 (0.2) Erol'dan gelince tam bağlanır |
| 0.4 | Sokak/belediye demo ekranları (barınak girişi → kısırlaştırma → sahiplendirme ilanı) | Burak | ⬜ | |
| 0.5 | **Bakanlık konsolu (PARA EKRANI):** ulusal harita + il drill-down, aşılama/popülasyon panoları, sahte hastalık-uyarı akışı | Burak | ✅ | 81 il, ulusal KPI, harita/drill-down, Recharts panoları ve tıklanabilir erken uyarı akışı tamamlandı |
| 0.7 | e-Devlet tarzı vatandaş giriş ekranı (görsel simülasyon) | Burak | ✅ | Mock giriş, açık simülasyon etiketi ve mobil deneyime yönlendirme tamamlandı |
| 0.8 | Mobil demo: bir evcil hayvan + bir inek (üretici görünümü) için aşı kartı & kayıtlar | Burak | ⬜ | Genişletme yok, cila |

**Erol'dan (backend) beklenenler:**
- _(henüz yok — ihtiyaç doğdukça buraya yazılacak: hangi endpoint/şema/mock veri lazım)_

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

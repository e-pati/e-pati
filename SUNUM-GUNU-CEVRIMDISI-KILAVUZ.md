# VetCep — Sunum Günü Çevrimdışı Kılavuzu

> **Sunum:** Tarım ve Orman Bakanlığı için VetCep Faz 0 ürün demosu
> **Konuşmacı:** Şevval Dündar
> **Teknik kumanda:** Burak
> **Hedef süre:** 25 dakika
> **Paket sürümü:** 26 Temmuz 2026

Bu paket internet, Expo veya backend bağlantısı kesilse bile sunumun kontrollü biçimde devam edebilmesi için hazırlanmıştır. Paket gerçek kamu entegrasyonu, üretim güvenlik onayı veya resmî veri kaynağı iddiası taşımaz.

## 1. Paketi açınca

1. ZIP içeriğinin tamamını yerel diskte tek klasöre çıkarın.
2. `SEVVAL-VETCEP-SUNUM-PAKETI.pdf` dosyasını açın.
3. `VETCEP-FAZ0-YEDEK-DEMO.mp4` dosyasını internet kapalıyken oynatın.
4. Videoda `00:18`, `01:17`, `02:03`, `02:46`, `03:29` ve `04:18` zamanlarına atlanabildiğini kontrol edin.
5. Aynı klasörü ayrı bir USB belleğe kopyalayın.

## 2. Normal sunum düzeni

- Şevval konuşur; Burak canlı `/demo-akisi` ekranını ve ilgili yüzeyleri yönetir.
- Sunumcu PDF'i konuşma, bölüm geçişleri, kırmızı çizgiler ve soru-cevap için kullanılır.
- Teknik ek PDF'i yalnız teknik soru geldiğinde veya toplantı sonrasında paylaşılır.
- Yedek video canlı demo çalışırken açılmaz; arıza anında B planıdır.

## 3. Canlı demo kesilirse

İki kısa denemeden sonra canlı akış dönmüyorsa Şevval şu cümleyle videoya geçer:

> Canlı bağlantı şu an yanıt vermedi; akışı önceden doğrulanmış yedek kayıt üzerinden sürdürüyorum.

| Sorunlu bölüm | Videoda başlat |
|---|---|
| Vatandaş veya mobil | `00:18` |
| Klinik/backend | `01:17` |
| Üretici/hayvan hareketi | `02:03` |
| Belediye | `02:46` |
| Bakanlık konsolu | `03:29` |
| Kapanış | `04:18` |

Video sessizdir. Şevval konuşmaya devam eder; video yalnız görsel yüzeydir.

## 4. Asla atlanmayacak mesajlar

- VetCep mevcut HAYBİS, TÜRKVET, PETVET, İTS ve e-Devlet altyapılarının **yerine değil, üzerinde** konumlanır.
- Yetkili kayıt kaynağı Bakanlık sistemleri olarak kalır.
- Kamu bağlantıları simülasyon, gösterilen veriler sentetiktir.
- Bakanlık ekranı karar-destek gösterimidir; otomatik idari karar veya resmî hastalık bildirimi değildir.
- Kapanış talebi ulusal taahhüt değil, sınırlı ve ölçülebilir pilottur.

## 5. Sunumdan 30 dakika önce

- [ ] `origin/main` ve sunum dalı beklenen committe
- [ ] Sunumcu PDF'i tam ekran açılıyor
- [ ] Canlı portal ve klinik giriş çalışıyor
- [ ] Pamuk ve Sarıkız mobil ekranları hazır
- [ ] Hayvancılık ve belediye akışları sıfırlandı
- [ ] Bakanlık haritasında 81 il ve Konya detayı görünüyor
- [ ] Yedek MP4 yerel diskten açılıyor
- [ ] Paket USB bellekte bulunuyor
- [ ] Bildirimler kapalı; tarayıcı yakınlaştırması `%100`
- [ ] Açılış, “yerine değil üzerinde” ve pilot kapanışı hazır

## 6. Paylaşım sınırı

- `VETCEP-BAKANLIK-TEKNIK-EKLER-TASLAK.pdf` taslaktır; hukuk/KVKK onayı tamamlanmadan onaylı uyum belgesi gibi sunulmaz.
- Bu pakette fiyat veya iç müzakere belgesi bulunmaz.
- Gerçek parola, T.C. Kimlik No veya kişisel veri bulunmaz.
- Kaynak kod, `.env`, veritabanı dökümü ve kurum içi değerlendirme dosyaları pakete dahil değildir.

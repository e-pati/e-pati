# VetCep - Şevval Dündar Sunumcu Devir Paketi

> **Sunum:** Tarım ve Orman Bakanlığı için VetCep Faz 0 canlı ürün demosu  
> **Konuşmacı:** Şevval Dündar  
> **Teknik kumanda:** Burak  
> **Hedef süre:** 25 dakika  
> **Ana ekran:** `http://localhost:3001/demo-akisi`  
> **Belge sürümü:** 23 Temmuz 2026

Bu paket bir PowerPoint sunumu değildir. VetCep'in çalışan ekranları sunumun görselidir. Bu belge, Şevval'in ne söyleyeceğini, Burak'ın hangi ekranı açacağını ve soru-cevap bölümünde hangi sınırların korunacağını tek yerde toplar.

---

## 1. Şevval için 5 dakikalık hızlı başlangıç

Sunumdan önce yalnızca bu bölümü okuyacak zamanın varsa şu beş noktayı hatırla:

1. **VetCep mevcut kamu sistemlerinin yerine geçmez.** HAYBİS, PETVET, TÜRKVET, İTS ve e-Devlet yetkili kayıt kaynakları olarak kalır.
2. **VetCep bir entegrasyon, deneyim ve karar-destek katmanıdır.** Vatandaş, veteriner, üretici, belediye ve Bakanlık aynı yaşam döngüsünün farklı yüzlerini görür.
3. **HKN ortak bağdır.** Küpe, mikroçip ve mevcut kamu kimliklerini silmez; doğru kaynaklarıyla ilişkilendirir.
4. **Gösterilen kamu bağlantıları simülasyon, veriler sentetiktir.** Gerçek entegrasyon veya resmî hastalık bildirimi varmış gibi konuşma.
5. **Kapanış talebi ulusal geçiş değil, sınırlı ve ölçülebilir pilottur.**

### Tek cümlelik ürün tanımı

> VetCep, mevcut kamu kayıt sistemlerinin üzerinde çalışan; hayvanın kimlik, sağlık, sahiplik ve yaşam döngüsü kayıtlarını HKN etrafında anlaşılır hale getiren deneyim ve karar-destek katmanıdır.

### Ezberlenecek açılış

> Bugün size yeni bir kayıt silosu önermek için gelmedik. VetCep'in konumu HAYBİS, PETVET, TÜRKVET, İTS veya e-Devlet'in yerine geçmek değil; bu sistemlerin üzerinde çalışan modern kullanıcı deneyimi, klinik derinlik ve analitik karar-destek katmanı olmaktır.

### Ezberlenecek kapanış

> VetCep'in vaadi yeni bir silo kurmak değil; mevcut kamu altyapısındaki değeri vatandaş, veteriner, üretici, belediye ve karar verici için görünür ve kullanılabilir hale getirmektir. Önerimiz, bunu sınırlı ve ölçülebilir bir pilotla birlikte doğrulamaktır.

---

## 2. Önerilen rol dağılımı

### Önerilen yöntem: Şevval anlatır, Burak tıklar

- **Şevval:** Bakanlığa bakar, hikâyeyi ve ana mesajı anlatır.
- **Burak:** `/demo-akisi` kumandasını, sekmeleri, formları ve sıfırlama işlemlerini yönetir.
- **Erol:** Toplantıda bulunuyorsa yalnız backend, veri modeli ve entegrasyon sorularında devreye girer.
- Şevval ekrana tıklama komutunu yüksek sesle vermez. Bölüm geçişindeki anahtar kelime Burak için işarettir.

Örnek:

> Şevval: "Önce bu yapının vatandaşa nasıl göründüğünden başlayalım."  
> Burak: Vatandaş giriş ekranını açar.

### Şevval tek başına sunacaksa

- Her bölümde yalnızca paketteki **zorunlu tıklamaları** yap.
- Form alanlarını tek tek anlatma.
- Bir ekran açılmazsa iki kez deneme; B planına geç.
- Süre gerideyse ayrıntıyı kısalt, Bakanlık ekranını ve pilot kapanışını koru.

---

## 3. Kırmızı çizgiler

### Kullanılacak ifadeler

- "Mevcut kamu sistemlerinin **yerine değil, üzerinde** çalışıyoruz."
- "Yetkili kayıt kaynağı Bakanlık sistemleri olarak kalır."
- "Bu ekran sentetik veriyle hazırlanmış bir demodur."
- "Bu bir karar-destek sinyalidir; otomatik idari karar değildir."
- "Sınırlı, ölçülebilir ve resmî entegrasyon protokolüne bağlı pilot öneriyoruz."
- "Veri sahipliği ve resmî kayıt statüsü kamuda kalmalıdır."

### Kullanılmayacak ifadeler

- "TÜRKVET'in/HAYBİS'in yerine geçiyoruz."
- "e-Devlet entegrasyonumuz hazır."
- "Türkiye'deki tüm hayvan verileri bizde olacak."
- "Salgını otomatik tespit ediyoruz."
- "KVKK ve siber güvenlik tarafımız tamamen hazır."
- "İki kişiyle ulusal sistemi hemen işletiriz."
- "Bakanlıktan yalnızca onay bekliyoruz."

### Zor soruda güvenli cevap kalıbı

1. Soruyu doğrudan cevapla.
2. Bugünkü demonun sınırını dürüstçe söyle.
3. Sonraki adım olarak ölçülebilir pilotu öner.

---

## 4. 25 dakikalık sahne haritası

| Süre | Bölüm | Şevval'in ana mesajı | Burak'ın ekranı |
|---|---|---|---|
| 00:00-02:00 | Açılış | Yerine değil, üzerinde; HKN; sentetik demo | `/demo-akisi` |
| 02:00-05:00 | Vatandaş + mobil | Alışılmış giriş deneyimi; Pamuk ve Sarıkız | `/vatandas-giris`, mobil |
| 05:00-09:00 | Klinik | Aynı hayvan altında klinik derinlik | `/login`, `/patients`, Misket |
| 09:00-14:00 | Üretici | İşletme, küpe, hareket ve olay geçmişi | `/hayvancilik` |
| 14:00-18:00 | Belediye | Barınak kabulünden sahiplendirmeye yaşam döngüsü | `/belediye` |
| 18:00-24:00 | Bakanlık | 81 il, il detayı, aşılama, popülasyon, erken uyarı | `/bakanlik` |
| 24:00-25:00 | Kapanış | Ulusal taahhüt değil; sınırlı pilot | `/demo-akisi` |

Süre kontrol noktaları:

- 02:00 vatandaş ekranı
- 05:00 klinik ekranı
- 09:00 hayvancılık ekranı
- 14:00 belediye ekranı
- 18:00 Bakanlık ekranı
- 24:00 kapanış

---

## 5. Konuşma ve canlı demo akışı

Köşeli parantez içindeki metinler konuşulmaz; Burak'ın veya Şevval'in yapacağı eylemi gösterir.

### 00:00-02:00 - Açılış ve konumlandırma

**Ekran:** `/demo-akisi`

> Bugün size yeni bir kayıt silosu önermek için gelmedik. Türkiye'de hayvan kayıtları için HAYBİS, PETVET, TÜRKVET, İTS ve e-Devlet gibi mevcut kamu altyapıları bulunuyor. VetCep'in konumu bu sistemlerin yerine geçmek değil; onların üzerinde çalışan modern kullanıcı deneyimi, klinik derinlik ve analitik karar-destek katmanı olmak.

> Hedefimiz; evcil, büyükbaş, küçükbaş ve sahipsiz hayvanların farklı temas noktalarında oluşan kayıtlarını tek bir Hayvan Kimlik Numarası, yani HKN etrafında anlaşılır bir yaşam döngüsüne dönüştürmek. HKN mevcut küpe ve mikroçip kimliklerini silmez; bunları yetkili kaynaklarıyla ilişkilendirir.

> Göreceğiniz ekranlar Faz 0 için hazırlanmış bir demodur. Kamu entegrasyonu izlenimi yaratmamak için sentetik veri ve simülasyon alanlarını açıkça etiketledik. Yetkili kayıt kaynağı Bakanlık sistemleri olarak kalır.

**Geçiş cümlesi:**  
> Önce bu yapının vatandaşa nasıl göründüğünden başlayalım.

### 02:00-05:00 - Vatandaş girişi ve mobil kayıtlar

**Ekran:** `/vatandas-giris`

[Simülasyon / Demo etiketini göster.]

> Vatandaşın alışık olduğu e-Devlet dilini ve güven hissini koruyan bir giriş deneyimi tasarladık. Bu ekran gerçek e-Devlet değildir; bunu burada açıkça belirtiyoruz. Gerçek kimlik doğrulama yalnız Bakanlık ve ilgili kamu kurumlarının resmî protokolüyle çalışabilir.

[TC Kimlik No `12345678901`, şifre `demo1234`; giriş yap.]

**Mobil ekran:** Pamuk, ardından Sarıkız.

> Pamuk'un kimliğini, HKN bilgisini, aşı kartını ve sağlık kayıtlarını tek profilde görüyoruz. Buradaki değer yalnız kayıt göstermek değil; vatandaşın hangi kaydın ne anlama geldiğini anlayabilmesi ve bakım sürekliliğini takip edebilmesi.

> Aynı yaklaşım üretici deneyimine de uzanıyor. Sarıkız profilinde HKN, küpe, işletme, aşılama ve olay geçmişi birlikte görülebiliyor. Tür değişiyor ama kimlik ve izlenebilirlik mantığı değişmiyor.

**Geçiş cümlesi:**  
> Vatandaşın gördüğü bu kayıtların klinik tarafında nasıl üretildiğine bakalım.

### 05:00-09:00 - Veteriner klinik derinliği

**Ekran:** `/login` -> `/patients` -> Misket profili

[Klinik hesabı: `vet@example.com` / `DemoPass123`.]

> Klinik portalı veterinerin günlük iş akışına odaklanıyor. Hasta, muayene, aşı, reçete ve laboratuvar bilgileri birbirinden kopuk listeler yerine aynı hayvan profiline bağlanıyor.

[Hastalar ekranında `Misket` ara ve profili aç.]

> Misket'in kimliği, sahibi ve klinik geçmişi tek ekranda. Veteriner geçmiş kaydı aramak yerine doğru hayvanın yaşam boyu bağlamını görüyor.

[Muayene geçmişini ve aşı kaydını göster.]

> Demo bugün gerçek backend ve sentetik seed verisiyle çalışıyor. Ulusal kullanımda klinik kaydı ile kamu kayıt sistemi arasındaki veri sahipliği, doğrulama ve çift yönlü senkronizasyon kuralları resmî entegrasyon sözleşmesiyle belirlenmelidir. Klinik derinliği VetCep'in deneyim katkısıdır; resmî kayıt statüsünü Bakanlık sistemi belirler.

**Geçiş cümlesi:**  
> Şimdi aynı izlenebilirlik yaklaşımını üretim hayvanlarında görelim.

### 09:00-14:00 - Üretici ve hayvan hareketi

**Ekran:** `/hayvancilik`

[Gerekirse demo akışını sıfırla ve başlat.]

> Üretici tarafında hedef, mevcut kayıt yükünü çoğaltmak değil; işletme, küpe ve hareket işlemlerini daha anlaşılır ve izlenebilir bir akışa dönüştürmek.

[İşletmeyi kaydet.]

> İlk adım işletme bağlamı. Buradaki sentetik bilgiler gerçek kullanımda HAYBİS veya TÜRKVET tarafındaki yetkili işletme kaydıyla doğrulanmalıdır.

[Sarıkız'ın küpesini doğrula.]

> Küpe mevcut fiziksel kimliği korurken HKN farklı temas noktalarındaki kayıtların ortak yaşam döngüsü anahtarı oluyor.

[Güneş Süt İşletmesi'nden Bereket Besi Çiftliği'ne hareketi onayla.]

> Kaynak, hedef, hayvan ve doğrulama adımı tek işlem bağlamında. İşlem tamamlandığında yalnızca güncel işletme değişmiyor; hareket HKN altında zaman damgalı bir olay olarak geçmişe ekleniyor. Denetim ve hastalık takibi açısından değer burada oluşuyor.

> Bu demo resmî hareket bildirimi değildir; hedef entegrasyon deneyimini gösterir.

**Geçiş cümlesi:**  
> Aynı yaşam döngüsü yaklaşımı sahipsiz hayvanlarda belediye operasyonuna dönüşüyor.

### 14:00-18:00 - Belediye yaşam döngüsü

**Ekran:** `/belediye`

[Gerekirse sıfırla ve demo akışını başlat.]

> Sahipsiz hayvan tarafında farklı bir operasyon dili gerekiyor. Dost isimli sentetik hayvanın barınak kabulünden güvenli sahiplendirmeye uzanan sürecini göstereceğim.

[Barınak kabulünü kaydet.]

> Kabul sırasında temel kimlik ve sağlık değerlendirmesi kaydediliyor. Kamusal görünümde hassas yakalama konumunu paylaşmıyoruz.

[Kısırlaştırma işlemini doğrula ve kaydet.]

> Operasyon bilgisi, kayıt numarası ve doğrulama durumu aynı yaşam döngüsüne ekleniyor. Amaç sayı üretmek değil, hangi işlemin hangi hayvana uygulandığını izlenebilir kılmak.

[Sahiplendirme ilanını yayımla.]

> İlan doğrulanmış sağlık ve kısırlaştırma bilgisinden besleniyor. Böylece vatandaşın gördüğü bilgi belediyedeki operasyon kaydından kopmuyor. Canlı kullanım için belediye yetkisi, ilan moderasyonu ve resmî endpoint sözleşmeleri ayrıca tanımlanacaktır.

**Geçiş cümlesi:**  
> Şimdi bütün bu operasyonların Bakanlık açısından nasıl karar desteğine dönüştüğünü görelim.

### 18:00-24:00 - Bakanlık karar-destek katmanı

**Ekran:** `/bakanlik`

> Şimdi ürünün Bakanlık için en önemli yüzeyindeyiz. Sahadaki kimlik, sağlık ve hareket kayıtları yalnızca operasyon ekranlarında kalmıyor; ulusal aşılama, popülasyon ve erken uyarı karar desteğine dönüşüyor.

[Sentetik veri etiketini ve gerçek Türkiye silüeti üzerindeki 81 il haritasını göster.]

> Haritada 81 ilin tamamı aynı veri modelinde izleniyor. Rakamlar sentetiktir; ekranın amacı karar vericinin ulusal durumdan sorunlu ile hızlıca inebilmesini göstermektir.

[Risk lejantını göster.]

> İl risk dağılımı 39 normal, 41 izlenen ve 1 kritik il olarak görünüyor. Risk statüsü ile aktif erken uyarı aynı metrik değildir. Risk; aşılama kapsamı ve sentetik sinyallerin birlikte değerlendirilmesiyle hesaplanır.

[Konya üzerine gel; bilgi balonunu göster ve Konya'yı seç.]

> Konya bilgi balonunda kritik risk statüsünü, yüzde 74 aşılama kapsamını ve bir aktif erken uyarıyı ayrı ayrı görüyoruz. İl detayına indiğimizde ulusal ortalamanın arkasındaki operasyon bağlamı açılıyor.

[Aşılama ve popülasyon grafiklerini göster.]

> Bölgesel aşılama kapsamı ile hayvan sınıflarının popülasyon dağılımını birlikte okuyabiliyoruz. Pilot aşamasında gösterge tanımları, veri kalitesi eşikleri ve yenilenme sıklığı Bakanlıkla birlikte belirlenmelidir.

[Kars erken uyarısını aç.]

> Erken uyarı alanı teşhis veya resmî salgın ilanı üretmiyor. Sentetik sinyallerin amacı vaka artışı, coğrafi yoğunluk veya aşılama açığı gibi göstergeleri uzman incelemesine daha erken taşımaktır. Nihai karar veteriner otoriteye aittir.

> Bu ekran karar desteğidir; otomatik idari karar veya resmî hastalık bildirimi değildir.

**Geçiş cümlesi:**  
> Bu nedenle önerimiz ulusal geçiş taahhüdü değil, birlikte ölçebileceğimiz bir pilot.

### 24:00-25:00 - Pilot önerisi ve kapanış

**Ekran:** `/demo-akisi`

> Önerimiz, seçilecek sınırlı bir il veya operasyon alanında, mevcut kamu sistemleriyle resmî entegrasyon protokolü altında ölçülebilir bir pilot başlatmak.

> Pilotun başarı ölçütlerini birlikte tanımlayabiliriz: kayıt tamamlama süresi, veri kalitesi, veteriner ve vatandaş kullanım kolaylığı, hareket izlenebilirliği ve karar-destek sinyallerinin uzman ekip için faydası.

> Biz bugün bitmiş bir ulusal altyapı sunduğumuzu iddia etmiyoruz. Çalışan bir ürün yaklaşımı, açık entegrasyon konumu ve birlikte doğrulanabilecek bir pilot önerisi getiriyoruz.

> Uygun görürseniz bir sonraki adımda Bakanlık teknik ekibiyle veri sahipliği, entegrasyon yüzeyleri, güvenlik koşulları ve pilot kapsamı için çalışma oturumu yapmak isteriz.

**Son cümle:**

> VetCep'in vaadi yeni bir silo kurmak değil; mevcut kamu altyapısındaki değeri vatandaş, veteriner, üretici, belediye ve karar verici için görünür ve kullanılabilir hale getirmek.

---

## 6. Şevval'in ezberlemesi gereken 8 mesaj

1. Yerine değil, üzerinde.
2. Yetkili kayıt kaynağı Bakanlık sistemleridir.
3. HKN, mevcut küpe ve mikroçipi silmez; ilişkilendirir.
4. Ekranlar demo, veriler sentetik, kamu entegrasyonları simülasyondur.
5. Klinik derinlik VetCep'in deneyim katkısıdır.
6. Erken uyarı teşhis veya resmî ilan değil, uzman inceleme sinyalidir.
7. Veri sahipliği kamuda kalmalıdır.
8. Talep ulusal geçiş değil, sınırlı ve ölçülebilir pilottur.

---

## 7. Bakanlıktan gelebilecek sorular

### "TÜRKVET zaten varken buna neden ihtiyaç var?"

> TÜRKVET'in kayıt otoritesi rolünü değiştirmeyi önermiyoruz. İhtiyaç, farklı kullanıcıların bu kayıtlarla daha kolay işlem yapması, klinik bağlamın derinleşmesi ve operasyon verisinin karar desteğine dönüşmesi. Bunu sınırlı pilotta işlem süresi, veri kalitesi ve kullanıcı deneyimi ölçütleriyle doğrulamayı öneriyoruz.

### "Entegrasyon olmadan bu yalnız güzel bir arayüz değil mi?"

> Bugünkü Faz 0 ürünün deneyim ve karar-destek hipotezini gösteriyor; resmî entegrasyon olmadan ulusal değer iddiasında bulunmuyoruz. Sonraki adımımız Bakanlık teknik ekibiyle yetkili veri kaynaklarını ve servis sözleşmelerini netleştirmek.

### "Veri kalitesini kim garanti edecek?"

> Yetkili kaydın sahibi ilgili kamu sistemi ve yetkili kurum olarak kalmalıdır. VetCep alan doğrulama, kaynak etiketi, değişiklik geçmişi, mükerrer kayıt kontrolü ve hata kuyruğu sağlayabilir. Pilotun çıktılarından biri veri kalitesi kurallarının birlikte tanımlanmasıdır.

### "Erken uyarı yanlış alarm üretirse ne olacak?"

> Erken uyarı otomatik karar veya salgın ilanı değildir; uzman incelemesine aday sinyal üretir. Eşikler, veri yeterlilik koşulları ve uzman geri bildirimi pilotta kalibre edilmeden operasyonel karar sürecine alınmamalıdır.

### "KVKK ve siber güvenlik hazır mı?"

> Bu demo üretim güvenlik onayı almış bir sistem değildir. Pilot öncesinde veri sınıflandırması, asgari yetki, erişim kaydı, şifreleme, Türkiye'de barındırma, yedekleme, sızma testi ve olay müdahale koşulları Bakanlığın gereklilikleriyle tasarlanmalıdır.

### "İki kişilik ekip ulusal sistemi taşıyamaz."

> Katılıyoruz; iki kişilik ekiple doğrudan ulusal işletim taahhüdü vermiyoruz. Talebimiz sınırlı pilot. Güvenlik, DevOps, kamu entegrasyonu ve destek kapasitesi pilotla birlikte işe alım ve yetkin iş ortaklarıyla büyütülmelidir.

### "Bunu TÜBİTAK veya mevcut yüklenici yapmasın mı?"

> Bu kurumlarla rekabet eden bir konum önermiyoruz. VetCep hızlı ürün doğrulama, veteriner klinik derinliği ve kullanıcı deneyimi katkısı sunabilir; TÜBİTAK, Bakanlık ekipleri ve mevcut yükleniciler entegrasyon, güvenlik ve ölçek ortakları olabilir.

### "Şirket kapanırsa veriler ne olacak?"

> Veri sahipliği Bakanlıkta kalmalıdır. Sözleşmede açık dışa aktarma, dokümantasyon, kaynak kod emaneti veya teslim koşulları, geçiş desteği, SLA ve hizmet sürekliliği planı bulunmalıdır.

### "HKN mükerrer kimlik oluşturmaz mı?"

> HKN mevcut küpe, mikroçip ve kamu kayıt numaralarını silmez; bunları yetkili kaynaklarıyla ilişkilendiren ortak yaşam döngüsü anahtarıdır. Eşleştirme kuralları Bakanlığın kayıt otoritesiyle birlikte tanımlanmalıdır.

### "Pilotun başarılı olduğunu nasıl ölçeceksiniz?"

> Başarıyı ekran sayısıyla değil; kayıt tamamlama süresi, eksik kayıt oranı, mükerrerlik, kullanıcı görev başarısı, hareket izlenebilirliği, sistem kullanılabilirliği ve uzmanların karar-destek sinyallerine verdiği fayda puanıyla ölçmeyi öneriyoruz.

### "Veriler nerede barınacak?"

> Bu demo üretim altyapısı değildir. Pilot tasarımında KVKK, veri sınıflandırması, Türkiye'de barındırma, şifreleme, yedekleme ve Bakanlık güvenlik onayı birlikte netleştirilecektir.

### "Vatandaş veya veteriner yanlış kayıt girerse?"

> Her kayıt kaynak, yetki ve değişiklik geçmişiyle izlenmelidir. Kritik alanlarda otomatik doğrulama, kurum onayı ve hata düzeltme iş akışı gerekir. Resmî kaydı hangi rolün değiştirebildiğini Bakanlık politikası belirler.

---

## 8. Teknik sorun çıkarsa kullanılacak cümleler

### Backend veya klinik ekranı açılmazsa

> Klinik bölümünde canlı servis bağlantısı şu an yanıt vermedi. Bu, demonun bağımlılık sınırını da gösteriyor. Akışı yedek görüntü üzerinden özetleyip backend'den bağımsız çalışan üretici, belediye ve Bakanlık yüzeyleriyle devam edeceğim.

### Mobil ekran açılmazsa

> Mobil bağlantı yerine aynı Pamuk ve Sarıkız senaryosunun önceden hazırlanmış görünümünü kullanacağım. Buradaki ana mesaj, evcil ve üretim hayvanı ihtiyaçlarının aynı kimlik mantığı altında farklı deneyimlerle sunulması.

### Bir form yarıda kalırsa

> Bu adım sentetik demo durumunda yarıda kaldı. Operasyonun sonucu HKN altında zaman damgalı olay geçmişine ekleniyor; akışı sıfırlayıp bir sonraki yüzeye geçiyorum.

### İnternet kesilirse

> Demo yerel ekranlarla devam ediyor. Gerçek kamu entegrasyonu zaten bu sunumun iddiası değil; resmî protokol ve güvenli servis erişimi pilotun konusu.

### Süre geride kalırsa

Kısalt:

- Misket'te yalnız profil ve aşı kaydı
- Hayvancılık formlarındaki alan açıklamaları
- Belediye ilan önizlemesi
- Popülasyon grafiğinin ayrıntıları

Asla atlama:

- Yerine değil, üzerinde konumlandırması
- Sentetik veri açıklaması
- Bakanlık ekranı
- Pilot kapanışı

---

## 9. 20 dakikalık kısa rota

| Süre | Bölüm | Kısaltma |
|---|---|---|
| 00:00-01:30 | Açılış | Konumlandırma + HKN + sentetik demo |
| 01:30-03:30 | Vatandaş | Simülasyon etiketi + yalnız Pamuk; Sarıkız'a sözlü referans |
| 03:30-06:30 | Klinik | Misket arama -> profil -> aşı |
| 06:30-10:30 | Üretici | Dört adım; form alanlarını anlatma |
| 10:30-13:30 | Belediye | Üç adım; ilan metnini okuma |
| 13:30-19:00 | Bakanlık | 81 il -> Konya -> aşılama -> Kars uyarısı |
| 19:00-20:00 | Kapanış | Ölçülebilir pilot ve teknik çalışma oturumu |

---

## 10. Sunumdan 30 dakika önce

### Burak'ın teknik kontrolü

- [ ] `origin/main` ve `feature/portal` beklenen committe
- [ ] Backend `/health` ve `/health/ready` HTTP 200
- [ ] Klinik login çalışıyor
- [ ] `/patients` içinde Misket bulunuyor
- [ ] Pamuk ve Sarıkız mobil ekranları açık
- [ ] Hayvancılık ve belediye akışları sıfırlandı
- [ ] Bakanlık ekranında gerçek Türkiye haritası, 81 il ve grafikler görünüyor
- [ ] Konya tooltip'inde kritik, %74 ve 1 aktif uyarı görünüyor
- [ ] Kars erken uyarı kartı il detayına götürüyor
- [ ] Yedek ekran görüntüleri çevrimdışı erişilebilir

### Şevval'in sunum kontrolü

- [ ] Telefon sessizde
- [ ] Su hazır
- [ ] Açılış ve kapanış cümlesi bir kez sesli söylendi
- [ ] "Yerine değil, üzerinde" cümlesi hazır
- [ ] Sentetik veri açıklaması hazır
- [ ] Pilot talebi tek cümlede söylenebiliyor
- [ ] En zor üç soru sesli cevaplandı
- [ ] Burak'la bölüm geçiş işaretleri tekrarlandı

### Demo bilgileri

- Ana kumanda: `http://localhost:3001/demo-akisi`
- Klinik: `vet@example.com` / `DemoPass123`
- Vatandaş simülasyonu: `12345678901` / `demo1234`

---

## 11. Tek sayfalık konuşmacı kartı

### Açılış

- Yerine değil, üzerinde.
- HKN mevcut kimlikleri silmez; ilişkilendirir.
- Veriler sentetik, kamu bağlantıları simülasyondur.
- Yetkili kayıt kaynağı Bakanlık sistemleridir.

### Canlı akış

- **Vatandaş:** Simülasyon etiketi -> Pamuk -> Sarıkız
- **Klinik:** Misket ara -> profil -> aşı
- **Üretici:** İşletme -> küpe-HKN -> hareket -> olay geçmişi
- **Belediye:** Kabul -> kısırlaştırma -> doğrulanmış ilan
- **Bakanlık:** 81 il -> risk dağılımı -> Konya tooltip -> grafikler -> Kars uyarısı

### Kapanış

- Ulusal taahhüt verme.
- Sınırlı, ölçülebilir pilot öner.
- Bakanlık teknik ekibiyle çalışma oturumu iste.

> **Son söz:** Yeni silo değil; mevcut kamu değerini vatandaş, veteriner, üretici, belediye ve karar verici için görünür ve kullanılabilir hale getirmek.

---

## 12. Şevval'e gönderilecek hazır WhatsApp mesajı

> Şevval selam, VetCep'in Tarım ve Orman Bakanlığı sunumunu senin yapman için hazırladığımız sunumcu devir paketini gönderiyorum. Sunum bir slayt anlatımı değil; çalışan ürün ekranları üzerinden 25 dakikalık canlı demo. PDF'in ilk bölümünde 5 dakikalık hızlı özet, devamında dakika dakika konuşma metni, tıklama sırası, söylenmemesi gereken ifadeler, zor sorular ve teknik B planı var.  
>  
> En önemli cümle: "VetCep mevcut kamu sistemlerinin yerine değil, üzerinde çalışan entegrasyon, deneyim ve karar-destek katmanıdır."  
>  
> Sunumda sen anlatacaksın, Burak ekranları yönetecek. İlk provada metni ezberlemeye çalışma; açılış, bölüm geçişleri ve kapanışı oturtmamız yeterli. PDF'i okuyunca takıldığın yerleri birlikte sadeleştiririz.

---

## 13. Kaynak belgeler

- Ayrıntılı konuşma metni: `DEMO-PROVA-KONUSMA-METNI.md`
- Teknik runbook: `DEMO-PROVA-RUNBOOK.md`
- Canlı sunum kumandası: `portal/src/app/(demo)/demo-akisi/page.tsx`
- Güncel proje durumu: `FRONTEND-ILERLEME.md`

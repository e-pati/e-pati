# VetCep — 25 Dakikalık Demo Konuşma Metni

> Hedef: Bakanlık görüşmesinde ürünün değerini 25 dakika içinde, mevcut kamu sistemleriyle çatışmadan göstermek.  
> Konuşmacı: Burak  
> Kumanda: `http://localhost:3001/demo-akisi`  
> Teknik hazırlık: [`DEMO-PROVA-RUNBOOK.md`](DEMO-PROVA-RUNBOOK.md)

Bu metin ezberlenmek için değil, prova sırasında ritmi ve ana mesajı korumak için hazırlanmıştır. Köşeli parantez içindeki ifadeler konuşulmaz; ekranda yapılacak eylemi gösterir.

## Sunum boyunca kullanılacak dil

Kullan:

- “Mevcut kamu kayıt sistemlerinin üzerinde çalışan entegrasyon ve deneyim katmanı”
- “Yetkili kayıt kaynağı Bakanlık sistemleri olarak kalır”
- “Sentetik veriyle hazırlanmış demo”
- “Sınırlı, ölçülebilir pilot önerisi”
- “HKN etrafında birleşen kimlik, sağlık ve yaşam döngüsü görünümü”

Kullanma:

- “TÜRKVET'in/HAYBİS'in yerine geçiyoruz”
- “Bütün Türkiye'yi hemen taşıyabiliriz”
- “Bu erken uyarı gerçek bir salgını tespit etti”
- “e-Devlet entegrasyonumuz hazır”
- Henüz alınmamış güvenlik, KVKK veya kamu onayları hakkında kesinlik bildiren cümleler

## 00:00–02:00 — Açılış ve konumlandırma

**Ekran:** `/demo-akisi`

“Bugün size yeni bir kayıt silosu önermek için gelmedik. Türkiye'de hayvan kayıtları için HAYBİS, PETVET, TÜRKVET, İTS ve e-Devlet gibi mevcut kamu altyapıları var. VetCep'in konumu bu sistemlerin yerine geçmek değil; onların üzerinde çalışan modern kullanıcı deneyimi, klinik derinlik ve analitik karar-destek katmanı olmak.”

“Hedefimiz; evcil, büyükbaş, küçükbaş, sahipsiz ve görev hayvanlarının farklı temas noktalarında oluşan kayıtlarını tek bir Hayvan Kimlik Numarası, yani HKN etrafında anlaşılır bir yaşam döngüsüne dönüştürmek.”

“Göreceğiniz ekranlar Faz 0 için hazırlanmış bir demodur. Kamu entegrasyonu izlenimi yaratmamak için sentetik veri ve simülasyon alanlarını açıkça etiketledik.”

**Mutlaka söyle:** “Yetkili kayıt kaynağı Bakanlık sistemleri olarak kalır.”

**Geçiş:** “Önce bu yapının vatandaşa nasıl göründüğünden başlayalım.”

**02:00 kontrolü:** Vatandaş ekranına geçmiş ol. Açılış uzadıysa HKN tanımını tek cümleye indir.

## 02:00–05:00 — Vatandaş girişi ve mobil kayıtlar

### 02:00–03:00 — Vatandaş giriş simülasyonu

**Ekran:** `/vatandas-giris`

[“Simülasyon / Demo” etiketini işaret et.]

“Vatandaşın alışık olduğu e-Devlet dilini ve güven hissini koruyan bir giriş deneyimi tasarladık. Bu ekran gerçek e-Devlet değildir; bunu hem burada hem sunum boyunca açıkça belirtiyoruz.”

[TC Kimlik No: `12345678901`, şifre: `demo1234`; **e-Devlet ile Giriş Yap**.]

“Gerçek entegrasyonda kimlik doğrulama, ancak Bakanlık ve ilgili kamu kurumlarının resmî protokolüyle çalışacaktır.”

### 03:00–05:00 — Pamuk ve Sarıkız

**Ekran:** Mobil `/pets/demo-pamuk`, ardından `/pets/producer-demo`

“Vatandaş tarafında Pamuk'un kimliğini, aşı kartını ve sağlık kayıtlarını tek profilde görüyoruz. Buradaki değer yalnızca kayıt göstermek değil; vatandaşın hangi kaydın ne anlama geldiğini anlayabilmesi ve bakım sürekliliğini takip edebilmesi.”

[Pamuk'un HKN ve aşı kartını göster; ayrıntıların tamamını okuma.]

“Aynı yaklaşım üretici deneyimine de uzanıyor. Sarıkız profilinde HKN, küpe, işletme, aşılama ve olay geçmişi birlikte görülebiliyor. Tür değişiyor ama kimlik ve izlenebilirlik mantığı değişmiyor.”

**Mutlaka söyle:** “Evcil hayvan ve üretici ekranları farklı ihtiyaçlara göre tasarlandı; veri otoritesi yine Bakanlık sistemleridir.”

**Geçiş:** “Vatandaşın gördüğü bu kayıtların klinik tarafında nasıl üretildiğine bakalım.”

**05:00 kontrolü:** Klinik giriş ekranında ol. Süre gerideyse Sarıkız'da yalnızca küpe, işletme ve son olayı göster.

## 05:00–09:00 — Veteriner klinik derinliği

**Ekran:** `/login` → `/patients` → Misket profili → `/vaccinations`

[Klinik: `vet@example.com`, şifre: `DemoPass123`.]

“Klinik portalı veterinerin günlük iş akışına odaklanıyor. Hasta, muayene, aşı, reçete ve laboratuvar bilgileri birbirinden kopuk listeler yerine aynı hayvan profiline bağlanıyor.”

[Hastalar ekranını aç; aramaya `Misket` yaz; Misket'i aç.]

“Misket'in kimliği, sahibi ve klinik geçmişi tek ekranda. Böylece veteriner geçmiş kaydı aramak yerine doğru hayvanın yaşam boyu bağlamını görüyor.”

[Muayene geçmişini ve aşı bölümünü göster. Ardından Aşılar ekranında Misket kaydını göster.]

“Demo bugün gerçek backend ve sentetik seed verisiyle çalışıyor. Ulusal kullanımda klinik kaydı ile kamu kayıt sistemi arasındaki veri sahipliği, doğrulama ve çift yönlü senkronizasyon kuralları resmî entegrasyon sözleşmesiyle belirlenecek.”

**Mutlaka söyle:** “Klinik derinliği VetCep'in deneyim katkısıdır; resmî kayıt statüsünü Bakanlık sistemi belirler.”

**Geçiş:** “Şimdi aynı izlenebilirlik yaklaşımını üretim hayvanlarında görelim.”

**09:00 kontrolü:** `/hayvancilik` ana ekranında ol. Süre gerideyse Aşılar listesini atla; Misket profilindeki aşı kaydı yeterli.

## 09:00–14:00 — Üretici ve hayvan hareketi

**Ekran:** `/hayvancilik`

[Gerekirse **Demo akışını sıfırla**, ardından **Demo akışını başlat**.]

“Üretici tarafında hedef, mevcut kayıt yükünü çoğaltmak değil; işletme, küpe ve hareket işlemlerini daha anlaşılır ve izlenebilir bir akışa dönüştürmek.”

### İşletme kaydı

“İlk adım işletme bağlamı. Buradaki sentetik bilgiler, gerçek kullanımda HAYBİS/TÜRKVET tarafındaki yetkili işletme kaydıyla doğrulanacak.”

[**İşletmeyi kaydet ve ilerle**.]

### Küpe ile hayvan girişi

“Sarıkız'ın küpe numarası doğrulanıyor ve HKN yaşam döngüsüne bağlanıyor. Küpe mevcut fiziksel kimliği korurken HKN farklı temas noktalarındaki kayıtların ortak anahtarı oluyor.”

[**Küpeyi doğrula ve ilerle**.]

### İşletmeler arası hareket

“Şimdi Güneş Süt İşletmesi'nden Bereket Besi Çiftliği'ne hareketi görüyoruz. Kaynak, hedef, hayvan ve doğrulama adımı tek işlem bağlamında.”

[Onay kutusunu işaretle; **Hareketi onayla ve tamamla**.]

### Olay geçmişi

“İşlem tamamlandığında yalnızca güncel işletme değişmiyor; bu hareket HKN altında zaman damgalı bir olay olarak yaşam boyu geçmişe ekleniyor. Denetim ve hastalık takibi açısından değer burada oluşuyor.”

**Mutlaka söyle:** “Bu demo resmî hareket bildirimi değildir; hedef entegrasyon deneyimini gösterir.”

**Geçiş:** “Aynı yaşam döngüsü yaklaşımı, sahipsiz hayvanlarda belediye operasyonuna dönüşüyor.”

**14:00 kontrolü:** `/belediye` ana ekranında ol. Süre gerideyse işletme formundaki alanları anlatmadan doğrudan kaydet.

## 14:00–18:00 — Belediye yaşam döngüsü

**Ekran:** `/belediye`

[Gerekirse sıfırla; demo akışını başlat.]

“Sahipsiz hayvan tarafında farklı bir operasyon dili gerekiyor. Dost isimli sentetik hayvanın barınak kabulünden güvenli sahiplendirmeye uzanan sürecini göstereceğim.”

### Barınak kabulü

“Kabul sırasında temel kimlik ve sağlık değerlendirmesi kaydediliyor. Kamusal görünümde hassas yakalama konumunu paylaşmıyoruz.”

[**Kabulü kaydet ve ilerle**.]

### Kısırlaştırma

“Operasyon bilgisi, kayıt numarası ve doğrulama durumu aynı yaşam döngüsüne ekleniyor. Amaç sayı üretmek değil, hangi işlemin hangi hayvana uygulandığını izlenebilir kılmak.”

[Doğrulama kutusunu işaretle; **İşlemi kaydet ve ilerle**.]

### Sahiplendirme ilanı

“İlan, doğrulanmış sağlık ve kısırlaştırma bilgisinden besleniyor. Böylece vatandaşın gördüğü bilgi belediyedeki operasyon kaydından kopmuyor.”

[**İlanı yayımla**; “Yayında · Demo” etiketini göster.]

**Mutlaka söyle:** “Canlı kullanım için belediye yetkisi, ilan moderasyonu ve resmî endpoint sözleşmeleri ayrıca tanımlanacaktır.”

**Geçiş:** “Şimdi bütün bu operasyonların Bakanlık açısından nasıl karar desteğine dönüştüğünü görelim.”

**18:00 kontrolü:** `/bakanlik` açık olmalı. Süre gerideyse ilan önizlemesini yalnızca bir cümleyle göster.

## 18:00–24:00 — Bakanlık karar-destek katmanı

**Ekran:** `/bakanlik`

“Şimdi ürünün Bakanlık için en önemli yüzeyindeyiz. Sahadaki kimlik, sağlık ve hareket kayıtları yalnızca operasyon ekranlarında kalmıyor; ulusal aşılama, popülasyon ve erken uyarı karar desteğine dönüşüyor.”

### 18:00–20:00 — Ulusal görünüm

[Sentetik veri etiketini ve 81 il haritasını göster.]

“Haritada 81 ilin tamamı aynı veri modelinde izleniyor. Bu rakamlar sentetiktir; ekranın amacı karar vericinin ulusal durumdan sorunlu ile hızlıca inebilmesini göstermektir.”

“Üst göstergeler popülasyon, aşılama kapsamı, işletme ve risk görünümünü tek bakışta özetliyor.”

### 20:00–21:30 — İl drill-down

[Konya'yı seç.]

“Konya'ya indiğimizde ulusal ortalamanın arkasındaki il bağlamını görüyoruz. Böyle bir görünüm, kaynak planlama ve saha koordinasyonu için ortak bir operasyon resmi sağlayabilir.”

### 21:30–22:30 — Aşılama ve popülasyon

[Aşılama ve popülasyon grafiklerini göster.]

“Bölgesel aşılama kapsamı ile hayvan sınıflarının popülasyon dağılımını birlikte okuyabiliyoruz. Pilot aşamasında bu göstergelerin tanımı, veri kalitesi eşiği ve yenilenme sıklığı Bakanlıkla belirlenmelidir.”

### 22:30–24:00 — Erken uyarı

[Kars erken uyarısını aç.]

“Erken uyarı alanı bir teşhis veya resmî salgın ilanı üretmiyor. Sentetik sinyallerin amacı; vaka artışı, coğrafi yoğunluk veya aşılama açığı gibi göstergeleri uzman incelemesine daha erken taşımak.”

“Nihai karar veteriner otoriteye aittir. Sistem yalnızca önceliklendirme ve iz sürme süresini kısaltmayı hedefler.”

**Mutlaka söyle:** “Bu ekran karar desteğidir; otomatik idari karar veya resmî hastalık bildirimi değildir.”

**Geçiş:** “Bu nedenle önerimiz ulusal geçiş taahhüdü değil, birlikte ölçebileceğimiz bir pilot.”

**24:00 kontrolü:** Kumandada kapanış bölümünde ol. Süre gerideyse grafiklerden yalnızca aşılama kapsamını göster; erken uyarı ve kapanışı koru.

## 24:00–25:00 — Pilot önerisi ve kapanış

**Ekran:** `/demo-akisi`

“Önerimiz, seçilecek sınırlı bir il veya operasyon alanında, mevcut kamu sistemleriyle resmî entegrasyon protokolü altında ölçülebilir bir pilot başlatmak.”

“Pilotun başarı ölçütlerini birlikte tanımlayabiliriz: kayıt tamamlama süresi, veri kalitesi, veteriner ve vatandaş kullanım kolaylığı, hareket izlenebilirliği ve karar-destek sinyallerinin uzman ekip için faydası.”

“Biz bugün bitmiş bir ulusal altyapı sunduğumuzu iddia etmiyoruz. Çalışan bir ürün yaklaşımı, açık entegrasyon konumu ve birlikte doğrulanabilecek bir pilot önerisi getiriyoruz.”

“Uygun görürseniz bir sonraki adımda Bakanlık teknik ekibiyle veri sahipliği, entegrasyon yüzeyleri, güvenlik koşulları ve pilot kapsamı için çalışma oturumu yapmak isteriz.”

**Son cümle:** “VetCep'in vaadi yeni bir silo kurmak değil; mevcut kamu altyapısındaki değeri vatandaş, veteriner, üretici, belediye ve karar verici için görünür ve kullanılabilir hale getirmek.”

## 20 dakikalık kısaltılmış rota

Toplantıda süre 20 dakikaya düşürülürse bölümleri silme; ayrıntıları kısalt:

| Süre | Bölüm | Kısaltma kararı |
|---|---|---|
| 00:00–01:30 | Açılış | Kamu sistemleri üzerinde konumlandırma + HKN + sentetik demo. |
| 01:30–03:30 | Vatandaş/mobil | Giriş etiketini ve yalnızca Pamuk aşı kartını göster; Sarıkız'a sözlü referans ver. |
| 03:30–06:30 | Klinik | Misket arama → profil → aşı; ayrı aşı listesine geçme. |
| 06:30–10:30 | Üretici | Dört adımı tamamla; form alanlarını açıklama. |
| 10:30–13:30 | Belediye | Üç adımı tamamla; ilan metnini okuma. |
| 13:30–19:00 | Bakanlık | 81 il → Konya → aşılama → Kars uyarısı. Popülasyon grafiğini yalnızca işaret et. |
| 19:00–20:00 | Kapanış | Ölçülebilir pilot ve teknik çalışma oturumu talebi. |

Kısaltılmaması gerekenler:

- “Yerine değil, üzerinde” konumlandırması
- Simülasyon/sentetik veri açıklaması
- Bakanlık karar-destek ekranı
- Sınırlı pilot talebi

## Düşmanca soru provası

Yanıt yapısı: önce doğrudan cevap, sonra sınır, son olarak önerilen sonraki adım. Savunmaya geçmeden 30–45 saniyede bitir.

### 1. “TÜRKVET zaten varken buna neden ihtiyaç var?”

“TÜRKVET'in kayıt otoritesi rolünü değiştirmeyi önermiyoruz. İhtiyaç; farklı kullanıcıların bu kayıtlarla daha kolay işlem yapması, klinik bağlamın derinleşmesi ve operasyon verisinin karar desteğine dönüşmesi. Bunu sınırlı pilotta işlem süresi, veri kalitesi ve kullanıcı deneyimi ölçütleriyle doğrulamayı öneriyoruz.”

### 2. “Entegrasyon olmadan bu sadece güzel bir arayüz değil mi?”

“Bugünkü Faz 0 ürünün deneyim ve karar-destek hipotezini gösteriyor; resmî entegrasyon olmadan ulusal değer iddiasında bulunmuyoruz. Bu yüzden sonraki adımımız ekran geliştirmekten önce Bakanlık teknik ekibiyle yetkili veri kaynaklarını ve servis sözleşmelerini netleştirmek.”

### 3. “Veri kalitesini kim garanti edecek?”

“Yetkili kaydın sahibi ilgili kamu sistemi ve yetkili kurum olarak kalmalı. VetCep tarafında alan doğrulama, kaynak etiketi, değişiklik geçmişi, mükerrer kayıt kontrolü ve hata kuyruğu uygulanabilir. Pilotun önemli çıktılarından biri de veri kalitesi kurallarının Bakanlıkla ölçülebilir biçimde tanımlanmasıdır.”

### 4. “Erken uyarınız yanlış alarm üretirse ne olacak?”

“Erken uyarı otomatik karar veya salgın ilanı değildir; uzman incelemesine aday sinyal üretir. Eşikler, açıklanabilir göstergeler, veri yeterlilik koşulları ve uzman geri bildirimi pilotta kalibre edilmeden operasyonel karar sürecine alınmamalıdır.”

### 5. “KVKK ve siber güvenlik hazır mı?”

“Bu demo üretim güvenlik onayı almış bir sistem değildir. Pilot öncesinde veri sınıflandırması, asgari yetki, erişim kaydı, şifreleme, Türkiye'de barındırma, yedekleme, sızma testi ve olay müdahale koşulları Bakanlığın gereklilikleriyle tasarlanmalıdır. Hazır olmayan bir uyumluluğu hazırmış gibi sunmuyoruz.”

### 6. “İki kişilik ekip ulusal sistemi taşıyamaz.”

“Katılıyoruz; iki kişilik ekiple doğrudan ulusal işletim taahhüdü vermiyoruz. Talebimiz sınırlı pilot. Pilot boyunca güvenlik, DevOps, kamu entegrasyonu ve destek kapasitesi işe alım ve yetkin iş ortaklarıyla büyütülür; ulusal ölçeğe geçiş ancak bu kapasite ve yönetişim doğrulandıktan sonra gündeme gelir.”

### 7. “Bunu TÜBİTAK veya mevcut yüklenici daha güvenli yapmaz mı?”

“Bu kurumlarla rekabet eden bir konum önermiyoruz. VetCep hızlı ürün doğrulama, veteriner klinik derinliği ve kullanıcı deneyimi katkısı sunabilir; TÜBİTAK, Bakanlık ekipleri ve mevcut yükleniciler entegrasyon, güvenlik ve ölçek ortakları olabilir. Pilot modeli hangi yapının en doğru olduğunu ölçmeye yarar.”

### 8. “Şirket kapanırsa veriler ve sistem ne olacak?”

“Veri sahipliği Bakanlıkta kalmalı. Sözleşmede açık dışa aktarma, teknik dokümantasyon, kaynak kod emaneti veya teslim koşulları, geçiş desteği, SLA ve hizmet sürekliliği planı bulunmalı. Bakanlığı tek tedarikçiye kilitleyen bir model önermiyoruz.”

### 9. “HKN yeni bir kimlik numarası yaratıp mükerrerlik oluşturmaz mı?”

“HKN'nin rolü mevcut küpe, mikroçip ve kamu kayıt numaralarını silmek değil; bunları yetkili kaynaklarıyla ilişkilendiren ortak yaşam döngüsü anahtarı olmaktır. Kimlik eşleştirme ve mükerrerlik kuralları Bakanlığın kayıt otoritesiyle birlikte tanımlanmadan HKN resmî kimlik gibi kullanılmamalıdır.”

### 10. “Pilot başarılı sayılacak mı, nasıl ölçeceksiniz?”

“Başarıyı ekran sayısıyla değil; kayıt tamamlama süresi, hatalı veya eksik kayıt oranı, mükerrerlik, kullanıcı görev başarı oranı, hareket izlenebilirliği, sistem kullanılabilirliği ve uzmanların karar-destek sinyallerine verdiği fayda puanıyla ölçmeyi öneriyoruz. Hedef değerler pilot başlamadan Bakanlıkla birlikte yazılmalıdır.”

## Prova değerlendirme formu

Her tam provadan sonra doldur:

- Tarih ve prova numarası:
- Toplam süre:
- 02:00 vatandaş geçişi gerçekleşti mi?
- 05:00 klinik geçişi gerçekleşti mi?
- 09:00 üretici geçişi gerçekleşti mi?
- 14:00 belediye geçişi gerçekleşti mi?
- 18:00 Bakanlık geçişi gerçekleşti mi?
- 24:00 kapanış başladı mı?
- Takılınan ekran veya cümle:
- Atlanan zorunlu mesaj:
- Teknik hata:
- En zayıf zor soru cevabı:
- Bir sonraki provada tek düzeltme:


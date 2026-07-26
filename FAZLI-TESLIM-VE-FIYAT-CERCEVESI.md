# VetCep — Fazlı Teslim ve Fiyat Çerçevesi

> **Belge durumu:** İÇ MÜZAKERE TASLAĞI — bağlayıcı teklif değildir
> **Sürüm:** 26 Temmuz 2026
> **Kullanım:** Hukuk, mali müşavir/kamu ihalesi danışmanı ve teknik ekip onayı olmadan Bakanlığa fiyat teklifi olarak verilmez.

## 1. Temel ilke

Bugünkü demo ile ulusal üretim sisteminin fiyatı birbirine bağlanmamalıdır. Bakanlığın satın alacağı değer; çalışan ekranlardan daha geniş olarak entegrasyon, güvenlik, mevzuat uyumu, veri göçü, operasyon, eğitim, destek ve çok yıllı teslim organizasyonudur.

Önerilen ticari rota:

1. **Faz 0 — Demo:** ürün vizyonunu ve kullanıcı akışını doğrular.
2. **Faz 1 — Sınırlı pilot:** tek il veya sınırlı kurum grubunda resmî entegrasyon ve ölçülebilir başarıyı doğrular.
3. **Faz 2 — Ulusal teslim:** pilot sonuçlarına ve Bakanlık kararına bağlı kademeli yaygınlaştırmadır.

Toplantı talebi ulusal alım kararı değil; kapsamı, veri erişimi ve başarı ölçütleri yazılı bir pilot çalışma olmalıdır.

## 2. Faz kapsamları

### Faz 0 — Demo-hazır

**Durum:** çalışan senaryolu demo.

**Dahil:**

- e-Devlet görünümlü ve açıkça simülasyon etiketli vatandaş girişi;
- evcil hayvan ve üretici mobil profilleri;
- klinik hasta/aşı kayıt akışı;
- büyükbaş işletme, küpe, hareket ve olay geçmişi;
- belediye kabul, kısırlaştırma ve sahiplendirme;
- 81 il sentetik Bakanlık konsolu ve erken uyarı akışı;
- yerel Docker yedeği, test ve sunumcu paketi.

**Dahil değil:** gerçek kamu entegrasyonu, gerçek ulusal veri, üretim SLA'sı, mevzuat uyum beyanı, ulusal kapasite veya sertifikasyon.

### Faz 1 — Pilot-hazır

**Önerilen süre:** 6–9 ay.
**Önerilen kapsam:** bir il ve/veya 2–3 belediye/kurum; kesin sayı keşif sonunda.

**Teslimler:**

- Bakanlıkla onaylı hedef mimari, veri sözlüğü ve sorumluluk matrisi;
- gerçek e-Devlet ve erişim verildiği ölçüde PETVET/İTS entegrasyonu;
- Animal/HKN, işletme, kimliklendirme ve hareket çekirdeği;
- hiyerarşik rol/kurum yetkisi ve denetim izi;
- Türkiye'de onaylı barındırma ve gözlemlenebilirlik;
- KVKK envanteri, aydınlatma, saklama-imha ve ilgili kişi süreçleri;
- otomatik test/CI, bağımsız sızma testi ve bulgu kapatma;
- pilot kullanıcı eğitimi, destek ve ölçüm panosu.

**Giriş bağımlılıkları:**

- imzalı pilot kapsamı veya niyet/protokol belgesi;
- kamu sistemleri için yetkili teknik muhatap, test ortamı ve veri sözlüğü;
- veri sorumluluğu ve barındırma kararları;
- pilot kurumlar ve başarı ölçütleri.

### Faz 2 — Ulusal üretim

**Önerilen süre:** pilot sonrasında 18–24 ay; toplam program 30 aya kadar planlanabilir.

**Teslimler:**

- HAYBİS/TÜRKVET dahil kademeli çift yönlü entegrasyon;
- iller, belediyeler, klinikler ve üreticiler için kontrollü yaygınlaştırma;
- Bakanlıkça onaylı hastalık ihbarı ve karar-destek süreçleri;
- yüksek erişilebilirlik, felaket kurtarma ve düzenli tatbikat;
- erişilebilirlik ve güvenlik denetimleri;
- eğitim, geçiş, 7×24 kritik olay desteği ve SLA operasyonu.

Faz 2 kapsamı Faz 1 pilot sonuçları olmadan sabit fiyatlı tek paket olarak taahhüt edilmemelidir.

## 3. Efor ve ekip varsayımları

| Faz | Tahmini efor | Teslim organizasyonu |
|---|---:|---|
| Faz 0 | yaklaşık 85 adam-gün | mevcut iki kişilik çekirdek ekip |
| Faz 1 | yaklaşık 700–900 adam-gün | 6–8 kişilik ürün/teslim ekibi + hukuk/KVKK danışmanlığı |
| Faz 2 | yaklaşık 4.000–6.000 adam-gün | 15–25 kişilik çok disiplinli program ekibi |

Tahminler ilk keşif öncesi yaklaşık değerlerdir ve en az ±%30 belirsizlik taşır. Entegrasyon erişimi, veri göçü, güvenlik kabulü ve ihale modeli takvimi doğrudan etkiler.

Önerilen Faz 1 çekirdek kapasitesi:

- 2 kıdemli backend;
- 1 frontend;
- 1 mobil;
- 1 DevOps/platform;
- 1 QA/test otomasyonu;
- kamu deneyimli ürün/iş analisti;
- yarı zamanlı kamu ihalesi hukuk ve KVKK danışmanlığı;
- veteriner alan danışmanı.

İşe alım ve uzun süreli tedarik taahhüdü, imzalı ve bütçeli pilot kararı sonrasında başlatılmalıdır.

## 4. Gösterge fiyat çerçevesi

Bu rakamlar 26 Temmuz 2026 tarihli iç planlama aralığıdır; KDV/vergi, ihale usulü, lisans modeli, donanım/bulut, üçüncü taraf bedelleri ve fiyat farkı hükümleri kesinleşmeden teklif değildir.

| Kalem | İç planlama aralığı | Açıklama |
|---|---:|---|
| Faz 1 sınırlı pilot | ₺3–5 milyon | 6–9 ay; sabit pilot kapsamı, güvenlik/KVKK ve sınırlı entegrasyon |
| Faz 2 ulusal lisans + teslim | ₺15–20 milyon | kilometre taşlı, pilot sonucuna bağlı kademeli teslim |
| Yıllık bakım ve destek | lisans/teslim bedelinin yaklaşık %15–20'si | kapsam ve SLA'ya göre ayrıca sözleşme |
| Barındırma/operasyon | ayrıca boyutlandırılır | Bakanlık altyapısı veya yönetilen Türkiye barındırma tercihine bağlı |
| Eğitim/yeni modül | ayrıca fiyatlanır | kullanıcı kohortu, saha ve değişiklik talebine bağlı |

**Kritik anlatım:** “₺20 milyon bugünkü demo yazılımının fiyatıdır” denmemelidir. Rakam ancak ulusal teslim organizasyonu, entegrasyonlar, güvenlik, veri geçişi, eğitim ve çok yıllı operasyon kapsamıyla tartışılabilir.

## 5. Kilometre taşı ve ödeme mantığı taslağı

Nihai oranlar ihale ve hukuk danışmanıyla belirlenmek üzere önerilen teslim kapıları:

1. keşif, hedef mimari ve veri sorumluluğu onayı;
2. Türkiye barındırma ve güvenlik temeli;
3. kayıt çekirdeği ve kurum izolasyonu;
4. ilk resmî entegrasyon kabulü;
5. pilot kullanıcı kabulü ve eğitim;
6. sızma testi bulgularının kapanışı;
7. pilot sonuç raporu ve Faz 2 go/no-go kararı.

Ödeme yalnız takvim geçişine değil, kanıtlanabilir teslim ve kabul ölçütlerine bağlanmalıdır. Bakanlık kaynaklı entegrasyon erişimi gecikmeleri için sorumluluk ve takvim etkisi sözleşmede açıkça tanımlanmalıdır.

## 6. Başarı ölçütü önerileri

Pilot başlangıcında sayısal hedefleri Bakanlıkla birlikte belirlemek üzere:

- hedef kullanıcı gruplarında görev tamamlama süresi ve başarı oranı;
- kayıt eşleştirme ve veri mutabakat hata oranı;
- kurumlar arası yetkisiz erişim negatif testlerinin tamamının geçmesi;
- aşı/kimlik/hareket verilerinde belirlenen veri kalitesi eşiği;
- kritik ve yüksek sızma testi bulgularının kabul öncesi kapatılması;
- kullanıcı destek talebi çözüm süresi;
- yedek geri yükleme ve olay müdahale tatbikatının başarıyla tamamlanması.

Erken uyarı göstergeleri pilotta karar-destek sinyali olarak ölçülür; otomatik idari karar veya hastalık teşhisi olarak kabul edilmez.

## 7. Kapsam ve değişiklik yönetimi

Her yeni talep aşağıdaki üç sonuçtan birine bağlanmalıdır:

- mevcut fazın kabul ölçütü içinde;
- değişiklik talebi olarak süre/bütçe etkili;
- sonraki faz backlog'u.

“Bunu da yaparız” ifadesi faz, süre ve fiyat belirtilmeden kullanılmamalıdır. Kamu entegrasyonu, yeni hayvan sınıfı, yeni kurum rolü, veri göçü veya yeni raporlama yükümlülüğü otomatik olarak mevcut kapsama dahil sayılmaz.

## 8. Fikrî mülkiyet ve hizmet sürekliliği seçenekleri

Hukuk danışmanı ve Bakanlıkla karar verilmek üzere iki temel model:

### Model A — Lisans + kaynak kod emaneti

- ürün fikrî mülkiyeti yüklenicide kalır;
- Bakanlığa sözleşmede tanımlı genişlikte kullanım lisansı verilir;
- hizmet sürekliliği tetikleyicileri için kaynak kod emaneti/escrow;
- açık veri dışa aktarma, dokümantasyon ve geçiş desteği zorunlu olur.

### Model B — Tam veya kademeli hak devri

- devir kapsamı, yeniden kullanım hakkı, üçüncü taraf bileşenleri ve bakım sorumluluğu açık yazılır;
- lisans modeline göre daha yüksek fiyat ve ayrı geçiş/garanti kapsamı gerekir.

Bu iki modelden biri toplantı öncesi seçilmeden bağlayıcı hak taahhüdü verilmemelidir.

## 9. SLA taslak başlıkları

Ulusal üretim fazında kesinleştirilmek üzere:

- hedef erişilebilirlik ve planlı bakım istisnaları;
- Sev-1/Sev-2 tanımları, ilk yanıt ve çözüm hedefleri;
- 7×24 kritik olay iletişim zinciri;
- yedekleme, RPO/RTO ve felaket kurtarma tatbikatı;
- güvenlik olayı ve veri ihlali eskalasyonu;
- sürüm, değişiklik ve geriye dönüş yönetimi;
- raporlama, hizmet kredisi/yaptırım ve bağımlılık istisnaları.

%99,9 erişilebilirlik ve 7×24 Sev-1 desteği hedef olarak konuşulabilir; ölçüm yöntemi, kapsam ve operasyon bütçesi belirlenmeden verilmiş garanti sayılmaz.

## 10. İhale ve fiyat farkı notu

Kamu alım yöntemi, yaklaşık maliyet, ihale dokümanı, fikrî haklar, fiyat farkı ve sözleşme türü kamu ihalesi uzmanı tarafından güncel mevzuata göre belirlenmelidir. Uzun süreli TL sözleşmede fiyat farkı mekanizması gerektiği varsayılabilir; ancak bunun endeksi ve uygulanabilirliği idari şartname ve sözleşmeye bağlıdır.

Başvuru kaynağı:

- [Kamu İhale Kurumu — Kamu ihale mevzuatında değişiklik duyurusu](https://ihale.gov.tr/Duyuru/759/kamu_ihale_mevzuatinda_degisiklik_duyurusu.html)

## 11. Toplantıda önerilen ticari kapanış

> Bugün ulusal yaygınlaştırma için peşin taahhüt istemiyoruz. Önerimiz; veri erişimi, güvenlik kapıları, başarı ölçütleri ve teslim sorumlulukları birlikte yazılmış sınırlı bir pilot. Pilot sonuçları ulusal kapsamın takvimini, bütçesini ve ihale modelini kanıta dayalı biçimde belirlesin.
